import { randomUUID } from "node:crypto";
import { catalogueAnimals, type CatalogueAnimal } from "@/content/catalogue";
import {
  FASHION_SAMPLE_BUCKET,
  isFashionSampleStyle,
  pathMatchesSample,
  publicSampleUrl,
  sampleObjectPath,
  type FashionSampleStyle,
} from "@/server/fashion-samples/model";
import { assertImageModel, generateFashionPng, readImageModel } from "@/server/fashion-samples/openai-image";
import { CATALOGUE_PROMPT_VERSION, decidePilotStep, pilotPromptRecord, pilotStyles, sampleCopy } from "@/server/fashion-samples/pilot";
import { createSupabaseServiceClient, readSupabaseServerConfig, type SupabaseServerConfig } from "@/server/supabase/server";

type SampleRow = {
  id: string;
  animal_id: string;
  style: string;
  generation_status: string;
  image_path: string | null;
  prompt_hash: string;
};

export type PilotStyleResult = {
  animalId: string;
  style: FashionSampleStyle;
  action: "skipped" | "completed" | "failed";
  id: string | null;
  imagePath: string | null;
  errorCode: string | null;
};

const concurrency = 2;

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "sample_failed";
  return /^[a-z0-9_]{1,80}$/.test(message) ? message : "sample_failed";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function objectExists(supabase: ReturnType<typeof createSupabaseServiceClient>, imagePath: string | null): Promise<boolean> {
  if (!imagePath) return false;
  const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(imagePath);
  return !check.error && check.data === true;
}

async function generateWithRetry(input: { apiKey: string; model: string; prompt: string }) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await generateFashionPng(input);
    } catch (error) {
      lastError = error;
      const code = safeCode(error);
      if (code !== "openai_rate_limited" && code !== "openai_request_failed") throw error;
      if (attempt === 3) throw error;
      await sleep(attempt * 20_000);
    }
  }
  throw lastError;
}

export async function runCatalogueFashionSamples(
  env: Record<string, string | undefined> = process.env,
  slugs?: readonly string[],
): Promise<PilotStyleResult[]> {
  const config = readSupabaseServerConfig(env);
  const apiKey = env.OPENAI_API_KEY?.trim() ?? "";
  const model = readImageModel(env);
  if (!config) throw new Error("supabase_not_configured");
  if (!apiKey || !model) throw new Error("openai_not_configured");
  const serverConfig: SupabaseServerConfig = config;
  const imageModel = model;
  await assertImageModel(apiKey, imageModel);

  const animals = catalogueAnimals.filter((animal) => !slugs || slugs.includes(animal.slug));
  if (slugs && animals.length !== slugs.length) throw new Error("catalogue_animal_missing");
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, animal_id, style, generation_status, image_path, prompt_hash");
  if (listed.error || !listed.data) throw new Error("supabase_query_failed");
  const rows = listed.data as SampleRow[];

  const work: Array<{ animal: CatalogueAnimal; style: FashionSampleStyle }> = [];
  for (const animal of animals) {
    for (const item of pilotStyles) work.push({ animal, style: item.style });
  }

  const results: PilotStyleResult[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < work.length) {
      const index = cursor;
      cursor += 1;
      const item = work[index];
      if (!item) return;
      const result = await storeOneSample({ supabase, config: serverConfig, apiKey, model: imageModel, rows, animal: item.animal, style: item.style });
      results.push(result);
      console.log(`${results.length}/${work.length} ${result.animalId} ${result.style} ${result.action} ${result.errorCode ?? ""}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, work.length) }, () => worker()));
  return results;
}

async function storeOneSample(input: {
  supabase: ReturnType<typeof createSupabaseServiceClient>;
  config: SupabaseServerConfig;
  apiKey: string;
  model: string;
  rows: SampleRow[];
  animal: CatalogueAnimal;
  style: FashionSampleStyle;
}): Promise<PilotStyleResult> {
  const { supabase, config, apiKey, model, rows, animal, style } = input;
  const existing = rows.find((row) => row.animal_id === animal.slug && row.style === style && isFashionSampleStyle(row.style)) ?? null;
  const stored = await objectExists(supabase, existing?.image_path ?? null);
  const step = decidePilotStep(
    existing ? { generationStatus: existing.generation_status, imagePath: existing.image_path, objectExists: stored } : null,
  );
  if (step === "skip" && existing?.image_path) {
    return { animalId: animal.slug, style, action: "skipped", id: existing.id, imagePath: existing.image_path, errorCode: null };
  }
  if (step === "finish-stored" && existing?.image_path && pathMatchesSample(animal.slug, style, existing.id, existing.image_path)) {
    const finished = await markCompleted(supabase, config.url, animal.slug, existing.id, existing.image_path, model);
    return finished
      ? { animalId: animal.slug, style, action: "completed", id: existing.id, imagePath: existing.image_path, errorCode: null }
      : { animalId: animal.slug, style, action: "failed", id: existing.id, imagePath: existing.image_path, errorCode: "database_failed" };
  }

  const id = existing?.id ?? randomUUID();
  const brief = sampleCopy(animal, style);
  const { prompt, hash } = pilotPromptRecord(animal, style);
  const path = sampleObjectPath(animal.slug, style, id);
  try {
    if (!existing) {
      const inserted = await supabase.from("animal_fashion_samples").insert({
        id,
        animal_id: animal.slug,
        style,
        title: brief.title,
        description: brief.description,
        generation_status: "generating",
        prompt_version: CATALOGUE_PROMPT_VERSION,
        prompt_hash: hash,
      });
      if (inserted.error) throw new Error("database_failed");
      rows.push({ id, animal_id: animal.slug, style, generation_status: "generating", image_path: null, prompt_hash: hash });
    } else {
      const updated = await supabase
        .from("animal_fashion_samples")
        .update({
          generation_status: "generating",
          error_code: null,
          title: brief.title,
          description: brief.description,
          prompt_version: CATALOGUE_PROMPT_VERSION,
          prompt_hash: hash,
        })
        .eq("id", id)
        .eq("animal_id", animal.slug);
      if (updated.error) throw new Error("database_failed");
    }
    await supabase.from("fashion_sample_jobs").update({ status: "failed", error_code: "superseded" }).eq("sample_id", id).in("status", ["pending", "generating"]);
    await supabase.from("fashion_sample_jobs").insert({ sample_id: id, status: "generating", retry_count: existing ? 1 : 0 });
    const image = await generateWithRetry({ apiKey, model, prompt });
    const uploaded = await supabase.storage.from(FASHION_SAMPLE_BUCKET).upload(path, image.bytes, {
      contentType: "image/png",
      upsert: true,
    });
    if (uploaded.error) throw new Error("upload_failed");
    const persisted = await objectExists(supabase, path);
    if (!persisted) throw new Error("object_missing");
    const retrieved = await fetch(publicSampleUrl(config.url, path), { signal: AbortSignal.timeout(20_000) });
    if (!retrieved.ok) throw new Error("object_unreadable");
    const finished = await markCompleted(supabase, config.url, animal.slug, id, path, image.model);
    if (!finished) throw new Error("database_failed");
    await supabase.from("fashion_sample_jobs").update({ status: "completed", finished_at: new Date().toISOString() }).eq("sample_id", id).eq("status", "generating");
    return { animalId: animal.slug, style, action: "completed", id, imagePath: path, errorCode: null };
  } catch (error) {
    const errorCode = safeCode(error);
    await supabase.from("animal_fashion_samples").update({ generation_status: "failed", error_code: errorCode }).eq("id", id).eq("animal_id", animal.slug);
    await supabase.from("fashion_sample_jobs").update({ status: "failed", error_code: errorCode, finished_at: new Date().toISOString() }).eq("sample_id", id).eq("status", "generating");
    return { animalId: animal.slug, style, action: "failed", id, imagePath: null, errorCode };
  }
}

async function markCompleted(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  supabaseUrl: string,
  animalId: string,
  id: string,
  imagePath: string,
  model: string,
): Promise<boolean> {
  const updated = await supabase
    .from("animal_fashion_samples")
    .update({
      generation_status: "completed",
      image_path: imagePath,
      image_url: publicSampleUrl(supabaseUrl, imagePath),
      generation_model: model,
      generated_at: new Date().toISOString(),
      error_code: null,
    })
    .eq("id", id)
    .eq("animal_id", animalId)
    .select("id");
  return !updated.error && (updated.data?.length ?? 0) === 1;
}
