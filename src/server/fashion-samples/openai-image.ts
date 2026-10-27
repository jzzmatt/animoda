import { isPng } from "@/server/fashion-samples/pilot";

const imageEndpoint = "https://api.openai.com/v1/images/generations";

/** Documented GPT Image models for POST /v1/images/generations. gpt-image-1 is excluded. */
export const supportedGptImageModels = [
  "gpt-image-2.5-sunburst",
  "gpt-image-2.5-flare",
  "gpt-image-2",
  "gpt-image-1.5",
  "gpt-image-1-mini",
] as const;

export type SupportedGptImageModel = (typeof supportedGptImageModels)[number];

/** Used only when OPENAI_IMAGE_MODEL is unset. An invalid explicit value is never replaced. */
export const defaultGptImageModel: SupportedGptImageModel = "gpt-image-2.5-flare";

export type ImageModelResolution =
  | { ok: true; model: SupportedGptImageModel; source: "configured" | "default" }
  | { ok: false; reason: "invalid_model" };

export type GeneratedPng = {
  bytes: Buffer;
  model: string;
};

export function readOpenAiApiKey(env?: Record<string, string | undefined>): string {
  const raw = env ? env.OPENAI_API_KEY : process.env.OPENAI_API_KEY;
  return raw?.trim() ?? "";
}

/**
 * Resolves the image model. An empty value uses the documented default.
 * Any other value must match a supported GPT Image model exactly.
 * The unset branch reads process.env.OPENAI_IMAGE_MODEL directly so the server runtime can see it.
 */
export function readImageModel(env?: Record<string, string | undefined>): ImageModelResolution {
  const raw = env ? env.OPENAI_IMAGE_MODEL : process.env.OPENAI_IMAGE_MODEL;
  const model = raw?.trim() ?? "";
  if (!model) return { ok: true, model: defaultGptImageModel, source: "default" };
  if ((supportedGptImageModels as readonly string[]).includes(model)) {
    return { ok: true, model: model as SupportedGptImageModel, source: "configured" };
  }
  return { ok: false, reason: "invalid_model" };
}

export function imageModelErrorMessage(): string {
  return `Configuration error. OPENAI_IMAGE_MODEL must be one of ${supportedGptImageModels.join(", ")}. gpt-image-1 is not available. No provider was called and no image was generated. The selected design remains the reference.`;
}

export async function assertImageModel(apiKey: string, model: string): Promise<void> {
  const response = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("openai_model_unavailable");
}

export async function generateFashionPng(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<GeneratedPng> {
  const response = await fetch(imageEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      size: "1024x1536",
      quality: "medium",
      output_format: "png",
      n: 1,
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("openai_rate_limited");
    if (response.status === 401 || response.status === 403) throw new Error("openai_unauthorized");
    throw new Error("openai_request_failed");
  }
  const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const encoded = payload.data?.[0]?.b64_json;
  if (!encoded) throw new Error("openai_empty_image");
  const bytes = Buffer.from(encoded, "base64");
  if (!isPng(bytes)) throw new Error("openai_invalid_image");
  return { bytes, model: input.model };
}
