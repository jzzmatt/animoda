import { catalogueAnimals, type CatalogueAnimal } from "@/content/catalogue";
import { persistedSampleStyles, type PersistedSampleStyle } from "@/content/persisted-samples";
import { promptHash, type FashionSampleStyle } from "@/server/fashion-samples/model";

export const CATALOGUE_PROMPT_VERSION = "catalogue-1";

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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

const styleDirections: Record<PersistedSampleStyle, string> = {
  formal:
    "Formal couture. Elegant premium tailoring, an evening column or tailored coat, and refined materials. The garment carries the animal's colors, pattern, and proportions.",
  casual_street:
    "Casual streetwear. A contemporary wearable set with a jacket, overshirt, or trousers, using the animal's colors and pattern as cloth. Modern and practical.",
  youth_couture:
    "Youth couture for a child or young person. Age-appropriate knit or cotton clothing, cheerful and modest, with a small motif drawn from the animal. No sexualized styling and no adult cut.",
};

export function sampleCopy(animal: CatalogueAnimal, style: PersistedSampleStyle): StyleBrief {
  const label = persistedSampleStyles.find((item) => item.style === style)?.label ?? style;
  const colors = animal.swatches.map((swatch) => `${swatch.name} ${swatch.hex}`).join(", ");
  const title = `${label} · ${animal.commonName}`.slice(0, 160);
  const description = `${label} inspired by the ${animal.commonName} (${animal.scientificName}). ${animal.summary} Colours: ${colors}. It is a fashion design, not a picture of the animal.`.slice(0, 1800);
  return { title, description, direction: styleDirections[style] };
}

export function pilotPrompt(animal: CatalogueAnimal, style: PersistedSampleStyle): string {
  if (!catalogueAnimals.some((item) => item.slug === animal.slug)) throw new Error("catalogue_animal_missing");
  const brief = sampleCopy(animal, style);
  const swatches = animal.swatches.map((swatch) => `${swatch.name} ${swatch.hex}`).join(", ");
  return [
    "Animoda editorial fashion photograph. Show one finished garment on a person in a quiet atelier. The animal inspires the cloth, colour, pattern, and silhouette. Do not depict the living animal, a wildlife scene, or a nature documentary.",
    `Species inspiration: ${animal.commonName}, ${animal.scientificName}. ${animal.summary} Design reading: ${animal.designTitle}. ${animal.designBody}`,
    `Catalogue colours: ${swatches}.`,
    brief.direction,
    "No text, logo, watermark, or caption. Photographed with soft atelier light, full garment visible, portrait framing.",
  ].join(" ");
}

export function pilotPromptRecord(animal: CatalogueAnimal, style: FashionSampleStyle): { prompt: string; hash: string } {
  const prompt = pilotPrompt(animal, style);
  return { prompt, hash: promptHash(prompt) };
}

export const pilotStyles = persistedSampleStyles;
