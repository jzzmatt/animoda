import { EMERALD_TREE_BOA_SLUG, persistedSampleStyles } from "@/content/persisted-samples";
import { FASHION_SAMPLE_BUCKET, isFashionSampleStyle, pathMatchesSample, publicSampleUrl, type FashionSampleStyle } from "@/server/fashion-samples/model";
import { isPng } from "@/server/fashion-samples/pilot";
import { readImageModel } from "@/server/fashion-samples/openai-image";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

export type PilotSampleFile = {
  style: FashionSampleStyle;
  imagePath: string;
  imageUrl: string;
};

export type PilotRead =
  | { state: "unconfigured"; reason: "openai" | "openai_model" | "supabase" }
  | { state: "stored"; samples: PilotSampleFile[] }
  | { state: "incomplete"; missing: FashionSampleStyle[] };

type PilotRow = {
  id: string;
  style: string;
  generation_status: string;
  image_path: string | null;
};

const storedMessage =
  "Stored pilot. The three Emerald tree boa styles are already in Supabase Storage and were read back as PNG files. No new image was requested. The catalogue directions are unchanged, and the selected design remains the reference.";

const generatedMessage =
  "Stored pilot. OpenAI returned the missing PNG files and they were saved in Supabase Storage and read back. The catalogue directions are unchanged, and the selected design remains the reference.";

export type PilotEnsureResult =
  | { status: "completed"; samples: PilotSampleFile[]; providerCalled: boolean; message: string }
  | { status: "failed"; message: string };

function unconfiguredMessage(reason: "openai" | "openai_model" | "supabase"): string {
  if (reason === "openai") {
    return "OPENAI_API_KEY is not configured, so this job did not call a provider and no image was generated. The selected design remains the reference.";
  }
  if (reason === "openai_model") {
    return "OPENAI_IMAGE_MODEL is not a gpt-image model, so this job did not call a provider and no image was generated. The selected design remains the reference.";
  }
  return "Supabase is not configured, so this job did not call a provider and no image was stored. The selected design remains the reference.";
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

export async function readEmeraldTreeBoaPilot(env: Record<string, string | undefined> = process.env): Promise<PilotRead> {
  if (!(env.OPENAI_API_KEY ?? "").trim()) return { state: "unconfigured", reason: "openai" };
  if (!readImageModel(env)) return { state: "unconfigured", reason: "openai_model" };
  const config = readSupabaseServerConfig(env);
  if (!config) return { state: "unconfigured", reason: "supabase" };
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, style, generation_status, image_path")
    .eq("animal_id", EMERALD_TREE_BOA_SLUG);
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
    if (!pathMatchesSample(EMERALD_TREE_BOA_SLUG, item.style, row.id, row.image_path)) {
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

/** Reads the three pilot files first. The generator runs only when a style is missing. */
export async function ensureEmeraldTreeBoaPilot(
  env: Record<string, string | undefined>,
  deps: {
    read?: typeof readEmeraldTreeBoaPilot;
    generateMissing?: (env: Record<string, string | undefined>) => Promise<void>;
  } = {},
): Promise<PilotEnsureResult> {
  const read = deps.read ?? readEmeraldTreeBoaPilot;
  const first = await read(env);
  if (first.state === "unconfigured") return { status: "failed", message: unconfiguredMessage(first.reason) };
  if (first.state === "stored") {
    return { status: "completed", samples: first.samples, providerCalled: false, message: storedMessage };
  }
  if (!deps.generateMissing) {
    return {
      status: "failed",
      message: "The Emerald tree boa samples are not all stored. No new image was requested, so this job is not completed. The selected design remains the reference.",
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
  const second = await read(env);
  if (second.state !== "stored") {
    return {
      status: "failed",
      message: "The provider finished, but the stored files could not be read back. This job is not completed. The selected design remains the reference.",
    };
  }
  return { status: "completed", samples: second.samples, providerCalled: true, message: generatedMessage };
}
