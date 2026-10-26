import { isPng } from "@/server/fashion-samples/pilot";

const imageEndpoint = "https://api.openai.com/v1/images/generations";

export type GeneratedPng = {
  bytes: Buffer;
  model: string;
};

export function readImageModel(env: Record<string, string | undefined> = process.env): string | null {
  const model = env.OPENAI_IMAGE_MODEL?.trim() ?? "";
  if (!model.startsWith("gpt-image-")) return null;
  return model;
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
