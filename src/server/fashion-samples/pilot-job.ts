import { animalBySlug } from "@/content/catalogue";
import { persistedSampleStyles } from "@/content/persisted-samples";
import { FASHION_SAMPLE_BUCKET, isFashionSampleStyle, pathMatchesSample, publicSampleUrl, type FashionSampleStyle } from "@/server/fashion-samples/model";
import { isPng } from "@/server/fashion-samples/pilot";
import { imageModelErrorMessage, readImageModel, readOpenAiApiKey } from "@/server/fashion-samples/openai-image";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

export type PilotSampleFile = {
  style: FashionSampleStyle;
  imagePath: string;
  imageUrl: string;
};

export type PilotConfigReason = "openai" | "openai_model" | "supabase" | "animal";

export type PilotRead =
  | { state: "unconfigured"; reason: PilotConfigReason }
  | { state: "stored"; samples: PilotSampleFile[] }
  | { state: "incomplete"; missing: FashionSampleStyle[] };

type PilotRow = {
  id: string;
  style: string;
  generation_status: string;
  image_path: string | null;
};

export type PilotEnsureResult =
  | { status: "completed"; samples: PilotSampleFile[]; providerCalled: boolean; message: string }
  | { status: "failed"; message: string };

export function pilotConfigurationMessage(reason: PilotConfigReason): string {
  if (reason === "openai") {
    return "Configuration error. OPENAI_API_KEY is not configured, so this job did not call a provider and no image was generated. The selected design remains the reference.";
  }
  if (reason === "openai_model") return imageModelErrorMessage();
  if (reason === "animal") {
    return "Configuration error. That animal is not in the catalogue, so this job did not call a provider. The selected design remains the reference.";
  }
  return "Configuration error. Supabase is not configured, so this job did not call a provider and no image was stored. The selected design remains the reference.";
}

function animalName(slug: string): string {
  return animalBySlug(slug)?.commonName ?? "this animal";
}

function storedMessage(slug: string): string {
  return `Stored samples. The three ${animalName(slug)} styles are already in Supabase Storage and were read back as PNG files. No new image was requested. The catalogue directions are unchanged, and the selected design remains the reference.`;
}

function generatedMessage(slug: string): string {
  return `Stored samples. OpenAI returned the missing PNG files for ${animalName(slug)} and they were saved in Supabase Storage and read back. The catalogue directions are unchanged, and the selected design remains the reference.`;
}

async function readablePng(url: string): Promise<boolean> {
  const response = await fetch(url, {
    headers: { Range: "bytes=0-31" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok && response.status !== 206) return false;
  const bytes = new Uint8Array(await response.arrayBuffer());
  return isPng(bytes);
}

export async function readStoredAnimalSamples(slug: string, env?: Record<string, string | undefined>): Promise<PilotRead> {
  if (!animalBySlug(slug)) return { state: "unconfigured", reason: "animal" };
  if (!readOpenAiApiKey(env)) return { state: "unconfigured", reason: "openai" };
  if (!readImageModel(env).ok) return { state: "unconfigured", reason: "openai_model" };
  const config = readSupabaseServerConfig(env);
  if (!config) return { state: "unconfigured", reason: "supabase" };
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, style, generation_status, image_path")
    .eq("animal_id", slug);
  if (listed.error || !listed.data) {
    return { state: "incomplete", missing: persistedSampleStyles.map((item) => item.style) };
  }
  const rows = listed.data as PilotRow[];
  const samples: PilotSampleFile[] = [];
  const missing: FashionSampleStyle[] = [];
  for (const item of persistedSampleStyles) {
    const row = rows.find((entry) => entry.style === item.style);
    if (!row || row.generation_status !== "completed" || !row.image_path || !isFashionSampleStyle(row.style)) {
      missing.push(item.style);
      continue;
    }
    if (!pathMatchesSample(slug, item.style, row.id, row.image_path)) {
      missing.push(item.style);
      continue;
    }
    const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(row.image_path);
    if (check.error || check.data !== true) {
      missing.push(item.style);
      continue;
    }
    const imageUrl = publicSampleUrl(config.url, row.image_path);
    if (!(await readablePng(imageUrl))) {
      missing.push(item.style);
      continue;
    }
    samples.push({ style: item.style, imagePath: row.image_path, imageUrl });
  }
  if (missing.length === 0 && samples.length === persistedSampleStyles.length) return { state: "stored", samples };
  return { state: "incomplete", missing };
}

/** Reads the three stored styles first. The generator runs only when a style is missing or replacement was requested. */
export async function ensureStoredAnimalSamples(
  slug: string,
  deps: {
    env?: Record<string, string | undefined>;
    read?: typeof readStoredAnimalSamples;
    generateMissing?: (env: Record<string, string | undefined> | undefined) => Promise<void>;
    replaceStored?: boolean;
  } = {},
): Promise<PilotEnsureResult> {
  const read = deps.read ?? readStoredAnimalSamples;
  const env = deps.env;
  const first = await read(slug, env);
  if (first.state === "unconfigured") return { status: "failed", message: pilotConfigurationMessage(first.reason) };
  if (first.state === "stored" && !deps.replaceStored) {
    return { status: "completed", samples: first.samples, providerCalled: false, message: storedMessage(slug) };
  }
  if (!deps.generateMissing) {
    return {
      status: "failed",
      message: `The ${animalName(slug)} samples are not all stored. No new image was requested, so this job is not completed. The selected design remains the reference.`,
    };
  }
  try {
    await deps.generateMissing(env);
  } catch {
    return {
      status: "failed",
      message: "Image generation did not finish. Nothing new was marked completed. The selected design remains the reference.",
    };
  }
  const second = await read(slug, env);
  if (second.state !== "stored") {
    return {
      status: "failed",
      message: "The provider finished, but the stored files could not be read back. This job is not completed. The selected design remains the reference.",
    };
  }
  return { status: "completed", samples: second.samples, providerCalled: true, message: generatedMessage(slug) };
}
