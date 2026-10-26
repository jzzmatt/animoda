import OpenAI, { toFile } from "openai";
import type { StudioAudience } from "@/studio/session";
import type { PortraitMediaType } from "./portrait-input";

export const defaultOpenAiImageModel = "gpt-image-2.5-sunburst";
export const conceptImageSize = "1024x1536";
export const tryOnImageSize = "1024x1536";

export type GeneratedImage = {
  bytes: Buffer;
  mediaType: PortraitMediaType;
};

export type ImageReference = {
  bytes: Buffer;
  mediaType: PortraitMediaType;
  filename: string;
};

export type ConceptBrief = {
  animalName: string;
  scientificName: string;
  characteristics: string;
  colors: string;
  garmentTitle: string;
  garmentDescription: string;
  textile: string;
  occasion: string;
  wearer: "adult" | "child" | "unisex";
  audience: StudioAudience;
  reference: ImageReference | null;
};

export type TryOnBrief = {
  portrait: ImageReference;
  garment: ImageReference;
  garmentTitle: string;
  textile: string;
  wearer: "adult" | "child" | "unisex";
};

export type FashionImageProvider = {
  id: "openai";
  generateConcept(brief: ConceptBrief): Promise<GeneratedImage>;
  editTryOn(brief: TryOnBrief): Promise<GeneratedImage>;
};

export type ImageClient = {
  models: { retrieve: (id: string) => Promise<{ id?: string | null }> };
  images: {
    generate: (body: OpenAI.ImageGenerateParamsNonStreaming, options?: OpenAI.RequestOptions) => Promise<OpenAI.ImagesResponse>;
    edit: (body: OpenAI.ImageEditParamsNonStreaming, options?: OpenAI.RequestOptions) => Promise<OpenAI.ImagesResponse>;
  };
};

export class FashionImageError extends Error {
  constructor(
    message: string,
    readonly kind: "configuration" | "unavailable-model" | "rate-limit" | "moderation" | "timeout" | "provider" | "unchanged",
  ) {
    super(message);
    this.name = "FashionImageError";
  }
}

const verifiedModels = new Set<string>();

export function wearerFor(audience: StudioAudience): ConceptBrief["wearer"] {
  if (audience === "Girls" || audience === "Boys") return "child";
  if (audience === "Unisex") return "unisex";
  return "adult";
}

export function conceptPrompt(brief: ConceptBrief): string {
  const wearerLine =
    brief.wearer === "child"
      ? "Design one age-appropriate children's outfit. Keep it fully covered and suitable for a child. Do not design an adult, revealing, or couture-evening garment."
      : brief.wearer === "unisex"
        ? "Design one complete unisex adult outfit that can be worn without being cut for only one gender."
        : `Design one complete adult outfit for ${brief.audience.toLowerCase()}.`;
  return [
    "Create a single original fashion concept photograph on a plain warm studio background.",
    wearerLine,
    `The creative reference is the animal ${brief.animalName} (${brief.scientificName}).`,
    `Visual characteristics: ${brief.characteristics}`,
    `Colour inspiration: ${brief.colors}. Translate those colours into dye, print, weave, or trim.`,
    "Use the animal as a creative reference only. Do not depict the living animal, animal skin, fur, hide, feathers, scales, or leather as the garment material.",
    `Garment: ${brief.garmentTitle}. ${brief.garmentDescription}`,
    `Suggested textile: ${brief.textile}. Occasion: ${brief.occasion}.`,
    "Show the whole garment clearly, with realistic cloth, construction, and drape.",
    "No words, logos, watermarks, or measurement marks.",
  ].join(" ");
}

export function tryOnPrompt(brief: TryOnBrief): string {
  const wearerLine =
    brief.wearer === "child"
      ? "The person is a child. Keep the outfit age-appropriate and fully covered."
      : "Keep the outfit appropriate to the selected garment.";
  return [
    "The first image is the person. The second image is the selected garment reference.",
    "Edit the first image so the person appears to wear that garment.",
    "Preserve the person's identity, face, skin tone, body proportions, pose, and background as closely as the edit allows.",
    "Do not copy the face or identity from the garment reference.",
    `Garment: ${brief.garmentTitle}. Textile: ${brief.textile}.`,
    wearerLine,
    "Prioritize realistic fabric, placement, and visual coherence.",
    "This is a visualization for review, not a pattern, measurement, or manufacturing specification.",
    "No words, logos, or watermarks.",
  ].join(" ");
}

export function createOpenAiFashionProvider(options: { apiKey: string; model?: string; client?: ImageClient }): FashionImageProvider {
  const model = options.model?.trim() || defaultOpenAiImageModel;
  const client = options.client ?? new OpenAI({ apiKey: options.apiKey, timeout: 90_000, maxRetries: 0 });
  return {
    id: "openai",
    async generateConcept(brief) {
      await assertModel(client, model, options.apiKey);
      const prompt = conceptPrompt(brief);
      try {
        const response = brief.reference
          ? await client.images.edit(
              {
                model,
                image: await toFile(brief.reference.bytes, brief.reference.filename, { type: brief.reference.mediaType }),
                prompt,
                n: 1,
                size: conceptImageSize,
                quality: "medium",
                output_format: "jpeg",
                output_compression: 85,
                stream: false,
              },
              { timeout: 90_000, maxRetries: 0 },
            )
          : await client.images.generate(
              {
                model,
                prompt,
                n: 1,
                size: conceptImageSize,
                quality: "medium",
                output_format: "jpeg",
                output_compression: 85,
                moderation: "auto",
              },
              { timeout: 90_000, maxRetries: 0 },
            );
        return decodeImage(response);
      } catch (error) {
        throw asFashionError(error, options.apiKey, model);
      }
    },
    async editTryOn(brief) {
      await assertModel(client, model, options.apiKey);
      try {
        const response = await client.images.edit(
          {
            model,
            image: [
              await toFile(brief.portrait.bytes, brief.portrait.filename, { type: brief.portrait.mediaType }),
              await toFile(brief.garment.bytes, brief.garment.filename, { type: brief.garment.mediaType }),
            ],
            prompt: tryOnPrompt(brief),
            n: 1,
            size: tryOnImageSize,
            quality: "high",
            output_format: "jpeg",
            output_compression: 85,
            stream: false,
          },
          { timeout: 90_000, maxRetries: 0 },
        );
        const image = decodeImage(response);
        if (image.bytes.equals(brief.portrait.bytes) || image.bytes.equals(brief.garment.bytes)) {
          throw new FashionImageError(
            "OpenAI returned an unchanged input image. That is not a try-on visualization, so it was discarded.",
            "unchanged",
          );
        }
        return image;
      } catch (error) {
        throw asFashionError(error, options.apiKey, model);
      }
    },
  };
}

async function assertModel(client: ImageClient, model: string, apiKey: string) {
  if (verifiedModels.has(model)) return;
  try {
    const found = await client.models.retrieve(model);
    if (!found?.id) {
      throw new FashionImageError(unavailable(model), "unavailable-model");
    }
    verifiedModels.add(model);
  } catch (error) {
    throw asFashionError(error, apiKey, model);
  }
}

function unavailable(model: string) {
  return `The image model ${model} is not available to this OpenAI account. No image was generated. Confirm the model and billing in the OpenAI account, or set OPENAI_IMAGE_MODEL to a model that account can use.`;
}

function decodeImage(response: OpenAI.ImagesResponse): GeneratedImage {
  const encoded = response.data?.[0]?.b64_json;
  if (!encoded) {
    throw new FashionImageError("OpenAI did not return an image. Nothing was saved in its place.", "provider");
  }
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length < 32) {
    throw new FashionImageError("OpenAI returned an empty image. Nothing was saved in its place.", "provider");
  }
  const mediaType = sniff(bytes);
  if (!mediaType) {
    throw new FashionImageError("OpenAI returned a file that is not a JPG, PNG, or WebP image.", "provider");
  }
  return { bytes, mediaType };
}

function sniff(bytes: Buffer): PortraitMediaType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function asFashionError(error: unknown, apiKey: string, model: string): FashionImageError {
  if (error instanceof FashionImageError) return error;
  const status = error instanceof OpenAI.APIError ? error.status : undefined;
  const code = error instanceof OpenAI.APIError ? String(error.code ?? "") : "";
  const raw = error instanceof Error ? error.message : "OpenAI request failed.";
  const message = redact(raw, apiKey);
  if (status === 401 || status === 403) {
    return new FashionImageError(
      "OpenAI refused the server credential. Check OPENAI_API_KEY. No image was saved.",
      "configuration",
    );
  }
  if (status === 404 || /model/i.test(code)) {
    return new FashionImageError(unavailable(model), "unavailable-model");
  }
  if (status === 429) {
    return new FashionImageError("OpenAI rate-limited this request. Wait and try again. No image was saved.", "rate-limit");
  }
  if (code === "moderation_blocked" || /moderation/i.test(message)) {
    return new FashionImageError("OpenAI did not generate that image because of a moderation response. No image was saved.", "moderation");
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError || /timed out|timeout/i.test(message)) {
    return new FashionImageError("The OpenAI image request timed out. No image was saved.", "timeout");
  }
  console.error(`studio image request failed status=${status ?? "none"}`);
  return new FashionImageError("The OpenAI image request failed. No image was saved.", "provider");
}

function redact(value: string, apiKey: string): string {
  let text = value;
  if (apiKey) text = text.split(apiKey).join("[redacted]");
  return text.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 300);
}

export function resetOpenAiModelVerificationForTests() {
  verifiedModels.clear();
}
