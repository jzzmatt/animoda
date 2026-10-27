import { animalBySlug } from "@/content/catalogue";
import {
  assessAnimalVariants,
  isFashionSampleAudience,
  toPublicFashionSample,
  type AuditedSampleRecord,
  type FashionSampleAudience,
  type PublicFashionSample,
  type VariantDecision,
} from "@/content/fashion-samples";
import { FASHION_SAMPLE_BUCKET, publicSampleUrl } from "@/server/fashion-samples/model";
import { isPng } from "@/server/fashion-samples/pilot";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

type SampleQueryRow = {
  id: string;
  animal_id: string;
  style: string;
  title: string | null;
  description: string | null;
  generation_status: string;
  image_path: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  prompt_hash: string | null;
  audience?: string | null;
};

const sampleColumns =
  "id, animal_id, style, title, description, generation_status, image_path, generation_model, prompt_version, prompt_hash";

function readAudience(value: unknown): FashionSampleAudience | null {
  if (typeof value !== "string") return null;
  const audience = value.trim().toLowerCase();
  return isFashionSampleAudience(audience) ? audience : null;
}

export function toAuditedSampleRecord(
  row: SampleQueryRow,
  checks: { objectExists: boolean; imageRetrieved: boolean },
): AuditedSampleRecord {
  return {
    id: row.id,
    animalId: row.animal_id,
    style: row.style,
    audience: readAudience(row.audience),
    generationStatus: row.generation_status,
    imagePath: row.image_path,
    title: row.title,
    description: row.description,
    generationModel: row.generation_model,
    promptVersion: row.prompt_version,
    promptHash: row.prompt_hash,
    objectExists: checks.objectExists,
    imageRetrieved: checks.imageRetrieved,
  };
}

async function imageWasRetrieved(url: string): Promise<boolean> {
  const response = await fetch(url, { headers: { Range: "bytes=0-31" } });
  if (!response.ok && response.status !== 206) return false;
  const bytes = new Uint8Array(await response.arrayBuffer());
  return isPng(bytes);
}

export async function loadAnimalVariantDecisions(slug: string): Promise<VariantDecision[] | null> {
  if (!animalBySlug(slug)) return null;
  const config = readSupabaseServerConfig();
  if (!config) return assessAnimalVariants(slug, []);
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase.from("animal_fashion_samples").select(sampleColumns).eq("animal_id", slug);
  if (listed.error || !listed.data) return assessAnimalVariants(slug, []);
  const records: AuditedSampleRecord[] = [];
  for (const row of listed.data as SampleQueryRow[]) {
    let objectExists = false;
    let imageRetrieved = false;
    if (row.image_path) {
      const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(row.image_path);
      objectExists = !check.error && Boolean(check.data);
      if (objectExists) imageRetrieved = await imageWasRetrieved(publicSampleUrl(config.url, row.image_path));
    }
    records.push(toAuditedSampleRecord(row, { objectExists, imageRetrieved }));
  }
  return assessAnimalVariants(slug, records, (path) => publicSampleUrl(config.url, path));
}

export async function loadPublicFashionSamples(slug: string): Promise<PublicFashionSample[] | null> {
  const decisions = await loadAnimalVariantDecisions(slug);
  if (!decisions) return null;
  return decisions.map(toPublicFashionSample);
}

export type SelectedFashionSample = {
  sampleId: string;
  animalId: string;
  audience: FashionSampleAudience;
  style: VariantDecision["style"];
  imagePath: string;
  imageUrl: string;
  title: string | null;
};

export async function confirmSelectedFashionSample(input: {
  animalId: string;
  audience: FashionSampleAudience;
  sampleId: string;
}): Promise<{ ok: true; sample: SelectedFashionSample } | { ok: false; message: string }> {
  const decisions = await loadAnimalVariantDecisions(input.animalId);
  if (!decisions) return { ok: false, message: "Choose an animal from the catalogue before selecting a Fashion Sample." };
  const decision = decisions.find((item) => item.audience === input.audience && item.sampleId === input.sampleId);
  if (!decision?.sampleId || !decision.imagePath || !decision.imageUrl || decision.presentation !== "ready") {
    return {
      ok: false,
      message: "That Fashion Sample is not available. Choose an available Fashion Sample before continuing.",
    };
  }
  return {
    ok: true,
    sample: {
      sampleId: decision.sampleId,
      animalId: decision.animalId,
      audience: decision.audience,
      style: decision.style,
      imagePath: decision.imagePath,
      imageUrl: decision.imageUrl,
      title: decision.title,
    },
  };
}
