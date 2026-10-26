import { randomUUID } from "node:crypto";
import { EMERALD_TREE_BOA_SLUG } from "@/content/persisted-samples";
import {
  FASHION_SAMPLE_BUCKET,
  pathMatchesSample,
  publicSampleUrl,
  sampleObjectPath,
  type FashionSampleStyle,
} from "@/server/fashion-samples/model";
import { assertImageModel, generateFashionPng, readImageModel } from "@/server/fashion-samples/openai-image";
import {
  PILOT_PROMPT_VERSION,
  assertPilotAnimal,
  decidePilotStep,
  emeraldTreeBoa,
  pilotBrief,
  pilotPromptRecord,
  pilotStyles,
} from "@/server/fashion-samples/pilot";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

type SampleRow = {
  id: string;
  animal_id: string;
  style: string;
  generation_status: string;
  image_path: string | null;
  prompt_hash: string;
};

export type PilotStyleResult = {
  style: FashionSampleStyle;
  action: "skipped" | "completed" | "failed";
  id: string | null;
  imagePath: string | null;
  errorCode: string | null;
};

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "pilot_failed";
  return /^[a-z0-9_]{1,80}$/.test(message) ? message : "pilot_failed";
}

async function objectExists(supabase: ReturnType<typeof createSupabaseServiceClient>, imagePath: string | null): Promise<boolean> {
  if (!imagePath) return false;
  const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(imagePath);
  return !check.error && check.data === true;
}

export async function runEmeraldTreeBoaPilot(env: Record<string, string | undefined> = process.env): Promise<PilotStyleResult[]> {
  assertPilotAnimal(EMERALD_TREE_BOA_SLUG);
  const config = readSupabaseServerConfig(env);
  if (!config) throw new Error("supabase_not_configured");
  const apiKey = env.OPENAI_API_KEY?.trim() ?? "";
  const model = readImageModel(env);
  if (!apiKey || !model) throw new Error("openai_not_configured");
  await assertImageModel(apiKey, model);

  const animal = emeraldTreeBoa();
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, animal_id, style, generation_status, image_path, prompt_hash")
    .eq("animal_id", EMERALD_TREE_BOA_SLUG);
  if (listed.error || !listed.data) throw new Error("supabase_query_failed");
  const rows = listed.data as SampleRow[];
  if (rows.some((row) => row.animal_id !== EMERALD_TREE_BOA_SLUG)) throw new Error("pilot_animal_refused");

  const results: PilotStyleResult[] = [];
  for (const item of pilotStyles) {
    const style = item.style;
    const existing = rows.find((row) => row.style === style) ?? null;
    const stored = await objectExists(supabase, existing?.image_path ?? null);
    console.log(`pilot ${style} checking`);
    const step = decidePilotStep(
      existing
        ? { generationStatus: existing.generation_status, imagePath: existing.image_path, objectExists: stored }
        : null,
    );
    if (step === "skip" && existing?.image_path) {
      results.push({ style, action: "skipped", id: existing.id, imagePath: existing.image_path, errorCode: null });
      continue;
    }
    if (step === "finish-stored" && existing?.image_path && pathMatchesSample(EMERALD_TREE_BOA_SLUG, style, existing.id, existing.image_path)) {
      const finished = await markCompleted(supabase, config.url, existing.id, existing.image_path, model);
      results.push(finished ? { style, action: "completed", id: existing.id, imagePath: existing.image_path, errorCode: null } : { style, action: "failed", id: existing.id, imagePath: existing.image_path, errorCode: "database_failed" });
      continue;
    }

    const id = existing?.id ?? randomUUID();
    const brief = pilotBrief(style);
    const { prompt, hash } = pilotPromptRecord(animal, style);
    const path = sampleObjectPath(EMERALD_TREE_BOA_SLUG, style, id);
    try {
      if (!existing) {
        const inserted = await supabase.from("animal_fashion_samples").insert({
          id,
          animal_id: EMERALD_TREE_BOA_SLUG,
          style,
          title: brief.title,
          description: brief.description,
          generation_status: "generating",
          prompt_version: PILOT_PROMPT_VERSION,
          prompt_hash: hash,
        });
        if (inserted.error) throw new Error("database_failed");
      } else {
        const updated = await supabase
          .from("animal_fashion_samples")
          .update({ generation_status: "generating", error_code: null, title: brief.title, description: brief.description, prompt_version: PILOT_PROMPT_VERSION, prompt_hash: hash })
          .eq("id", id)
          .eq("animal_id", EMERALD_TREE_BOA_SLUG);
        if (updated.error) throw new Error("database_failed");
      }
      await supabase
        .from("fashion_sample_jobs")
        .update({ status: "failed", error_code: "superseded" })
        .eq("sample_id", id)
        .in("status", ["pending", "generating"]);
      await supabase.from("fashion_sample_jobs").insert({ sample_id: id, status: "generating", retry_count: existing ? 1 : 0 });
      console.log(`pilot ${style} generating`);
      const image = await generateFashionPng({ apiKey, model, prompt });
      console.log(`pilot ${style} generated bytes=${image.bytes.byteLength}`);
      const uploaded = await supabase.storage.from(FASHION_SAMPLE_BUCKET).upload(path, image.bytes, {
        contentType: "image/png",
        upsert: true,
      });
      if (uploaded.error) throw new Error("upload_failed");
      const persisted = await objectExists(supabase, path);
      if (!persisted) throw new Error("object_missing");
      const publicUrl = publicSampleUrl(config.url, path);
      const retrieved = await fetch(publicUrl, { signal: AbortSignal.timeout(20_000) });
      if (!retrieved.ok) throw new Error("object_unreadable");
      const finished = await markCompleted(supabase, config.url, id, path, image.model);
      if (!finished) throw new Error("database_failed");
      await supabase.from("fashion_sample_jobs").update({ status: "completed", finished_at: new Date().toISOString() }).eq("sample_id", id).eq("status", "generating");
      results.push({ style, action: "completed", id, imagePath: path, errorCode: null });
    } catch (error) {
      const errorCode = safeCode(error);
      await supabase
        .from("animal_fashion_samples")
        .update({ generation_status: "failed", error_code: errorCode })
        .eq("id", id)
        .eq("animal_id", EMERALD_TREE_BOA_SLUG);
      await supabase.from("fashion_sample_jobs").update({ status: "failed", error_code: errorCode, finished_at: new Date().toISOString() }).eq("sample_id", id).eq("status", "generating");
      results.push({ style, action: "failed", id, imagePath: null, errorCode });
    }
  }
  return results;
}

async function markCompleted(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  supabaseUrl: string,
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
    .eq("animal_id", EMERALD_TREE_BOA_SLUG)
    .select("id");
  return !updated.error && (updated.data?.length ?? 0) === 1;
}
