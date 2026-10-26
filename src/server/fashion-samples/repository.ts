import { catalogueAnimals } from "@/content/catalogue";
import { FASHION_SAMPLE_BUCKET, buildFashionSampleReport, type FashionSampleReport, type StoredSample } from "@/server/fashion-samples/model";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

type SampleQueryRow = {
  id: string;
  animal_id: string;
  style: string;
  generation_status: string;
  image_path: string | null;
  prompt_hash: string;
  error_code: string | null;
};

export type FashionSampleReportResult =
  | { ok: true; report: FashionSampleReport }
  | { ok: false; error: "supabase_not_configured" | "supabase_query_failed" };

function catalogueAnimalIds(): string[] {
  return catalogueAnimals.map((animal) => animal.slug);
}

function toStoredSample(row: SampleQueryRow): StoredSample {
  return {
    id: row.id,
    animalId: row.animal_id,
    style: row.style,
    generationStatus: row.generation_status,
    imagePath: row.image_path,
    promptHash: row.prompt_hash,
    errorCode: row.error_code,
  };
}

/**
 * Reads catalogue sample rows and checks each stored object with the service role.
 * A sample is completed only when the row is valid and Storage answers that the object exists.
 */
export async function loadFashionSampleReport(): Promise<FashionSampleReportResult> {
  const config = readSupabaseServerConfig();
  if (!config) return { ok: false, error: "supabase_not_configured" };

  const supabase = createSupabaseServiceClient(config);
  const { data, error } = await supabase
    .from("animal_fashion_samples")
    .select("id, animal_id, style, generation_status, image_path, prompt_hash, error_code");

  if (error || !data) return { ok: false, error: "supabase_query_failed" };

  const rows = (data as SampleQueryRow[]).map(toStoredSample);
  const verifiedPaths = new Set<string>();
  for (const row of rows) {
    if (!row.imagePath) continue;
    const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(row.imagePath);
    if (!check.error && check.data) verifiedPaths.add(row.imagePath);
  }

  return {
    ok: true,
    report: buildFashionSampleReport({
      animalIds: catalogueAnimalIds(),
      rows,
      verifiedPaths,
    }),
  };
}
