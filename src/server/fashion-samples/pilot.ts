import { animalBySlug, type CatalogueAnimal } from "@/content/catalogue";
import {
  EMERALD_TREE_BOA_SLUG,
  persistedSampleStyles,
  type PersistedSampleStyle,
} from "@/content/persisted-samples";
import { promptHash, type FashionSampleStyle } from "@/server/fashion-samples/model";

export const PILOT_PROMPT_VERSION = "boa-pilot-1";

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function assertPilotAnimal(slug: string): void {
  if (slug !== EMERALD_TREE_BOA_SLUG) throw new Error("pilot_animal_refused");
}

export function isPng(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 32) return false;
  return pngSignature.every((value, index) => bytes[index] === value);
}

export type PilotStep = "skip" | "finish-stored" | "generate";

export function decidePilotStep(existing: { generationStatus: string; imagePath: string | null; objectExists: boolean } | null): PilotStep {
  if (existing?.imagePath && existing.objectExists) {
    return existing.generationStatus === "completed" ? "skip" : "finish-stored";
  }
  return "generate";
}

type StyleBrief = {
  title: string;
  description: string;
  direction: string;
};

const briefs: Record<PersistedSampleStyle, StyleBrief> = {
  formal: {
    title: "Emerald curve tailoring",
    description:
      "Formal couture for the emerald tree boa: a slender evening silhouette, deep emerald cloth, and a fine scale texture along the curve of the cloth. It is a fashion design, not a picture of the snake.",
    direction:
      "Formal couture. Elegant premium tailoring, a long evening column or tailored coat, deep emerald and near-black green, a subtle scale texture in the weave, and a slender curved silhouette. No snake body as the subject.",
  },
  casual_street: {
    title: "Canopy scale street set",
    description:
      "Casual streetwear for the emerald tree boa: wearable layers in emerald and pale scale-highlight cloth, with an organic pattern and a modern silhouette. It is a fashion design, not a picture of the snake.",
    direction:
      "Casual streetwear. A contemporary wearable set, jacket and trousers or an overshirt, emerald green with a pale highlight, organic scale patterning used as cloth, and a modern street silhouette. No snake body as the subject.",
  },
  youth_couture: {
    title: "Young canopy knit",
    description:
      "Youth couture for the emerald tree boa: age-appropriate clothing for a child or young person, in emerald and leaf tones, with a small scale motif. It is not sexualized and it is not a picture of the snake.",
    direction:
      "Youth couture for a child or young person. Age-appropriate knit or cotton clothing, cheerful and modest, emerald and leaf green with a small scale motif. No sexualized styling, no adult cut, and no snake body as the subject.",
  },
};

export function pilotBrief(style: PersistedSampleStyle): StyleBrief {
  return briefs[style];
}

export function pilotPrompt(animal: CatalogueAnimal, style: PersistedSampleStyle): string {
  assertPilotAnimal(animal.slug);
  const swatches = animal.swatches.map((swatch) => `${swatch.name} ${swatch.hex}`).join(", ");
  const brief = briefs[style];
  return [
    "Animoda editorial fashion photograph. Show one finished garment on a person in a quiet atelier. The animal inspires the cloth, color, and silhouette. Do not depict the animal, a snake, scales as a creature, or a wildlife scene.",
    `Species inspiration: ${animal.commonName}, ${animal.scientificName}. ${animal.summary}`,
    `Colors from the catalogue swatches: ${swatches}.`,
    brief.direction,
    "No text, logo, watermark, or caption. Photographed with soft atelier light, full garment visible, portrait framing.",
  ].join(" ");
}

export function pilotPromptRecord(animal: CatalogueAnimal, style: FashionSampleStyle): { prompt: string; hash: string } {
  const prompt = pilotPrompt(animal, style);
  return { prompt, hash: promptHash(prompt) };
}

export function emeraldTreeBoa(): CatalogueAnimal {
  const animal = animalBySlug(EMERALD_TREE_BOA_SLUG);
  if (!animal) throw new Error("pilot_animal_missing");
  return animal;
}

export const pilotStyles = persistedSampleStyles;
