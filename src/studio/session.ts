import {
  animalBySlug,
  directionSettings,
  type CatalogueAnimal,
  type SampleDirection,
} from "@/content/catalogue";
import { isFashionSampleAudience, sampleFitsAudience, type FashionSampleStyleId } from "@/content/fashion-samples";

export const catalogueAudiences = ["Women", "Men", "Girls", "Boys", "Unisex"] as const;
export type CatalogueAudience = (typeof catalogueAudiences)[number];

export const studioAudiences = ["Women", "Men", "Kids"] as const;
export type StudioAudience = (typeof studioAudiences)[number];

export const studioSteps = [
  { id: "animal", href: "/studio", label: "1. Animal" },
  { id: "sample", href: "/studio/sample", label: "2. Fashion Sample" },
  { id: "photo", href: "/studio/photo", label: "3. Photograph" },
  { id: "look", href: "/studio/look", label: "4. Your Look" },
] as const;

export type StudioStepId = (typeof studioSteps)[number]["id"];
export type DirectionSetting = (typeof directionSettings)[number];

export const maxPhotoBytes = 25 * 1024 * 1024;
export const acceptedPhotoTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const visitPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVisitId(value: string): boolean {
  return visitPattern.test(value);
}

export function newVisitId(): string {
  return crypto.randomUUID();
}

export type StudioDraft = {
  visitId: string | null;
  photoDataUrl: string | null;
  photoName: string | null;
  animalSlug: string | null;
  audience: StudioAudience;
  fashionSampleId: string | null;
  fashionSampleStyle: FashionSampleStyleId | null;
  savedThisVisit: boolean;
  quotationNoted: boolean;
};

export function emptyDraft(): StudioDraft {
  return {
    visitId: null,
    photoDataUrl: null,
    photoName: null,
    animalSlug: null,
    audience: "Women",
    fashionSampleId: null,
    fashionSampleStyle: null,
    savedThisVisit: false,
    quotationNoted: false,
  };
}

export function photoRejection(file: { type: string; size: number }): string | null {
  if (!acceptedPhotoTypes.includes(file.type as (typeof acceptedPhotoTypes)[number])) {
    return "Choose a JPG, PNG, or WebP photograph.";
  }
  if (file.size > maxPhotoBytes) {
    return "That file is larger than 25MB. Choose a smaller photograph.";
  }
  if (file.size <= 0) {
    return "That file is empty. Choose a photograph.";
  }
  return null;
}

export function audienceMatches(label: string, audience: CatalogueAudience): boolean {
  const value = label.toLowerCase();
  const youth = /\b(kid|kids|youth|child|children)\b/.test(value);
  const women = /\bwomen\b/.test(value);
  const men = /\bmen\b/.test(value);
  const unisex = /\bunisex\b/.test(value);
  if (audience === "Girls" || audience === "Boys") return youth;
  if (audience === "Unisex") return unisex;
  if (audience === "Women") return women || unisex;
  return (men && !women) || unisex;
}

export function sampleDirections(
  animal: CatalogueAnimal,
  audience: CatalogueAudience,
  setting: DirectionSetting,
): SampleDirection[] {
  return animal.directions.filter((direction) => {
    if (!audienceMatches(direction.audience, audience)) return false;
    if (setting === "All Silhouettes") return true;
    return direction.setting === setting;
  });
}

const sampleIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function fashionSampleStillFits(draft: StudioDraft): boolean {
  if (!draft.animalSlug || !animalBySlug(draft.animalSlug)) return false;
  if (!draft.fashionSampleId || !sampleIdPattern.test(draft.fashionSampleId) || !draft.fashionSampleStyle) return false;
  const audienceId = draft.audience.toLowerCase();
  if (!isFashionSampleAudience(audienceId)) return false;
  return sampleFitsAudience(audienceId, draft.fashionSampleStyle);
}

export function missingFor(step: StudioStepId, draft: StudioDraft): "animal" | "sample" | "photo" | null {
  const hasAnimal = Boolean(draft.animalSlug && animalBySlug(draft.animalSlug));
  const hasSample = fashionSampleStillFits(draft);
  const hasPhoto = Boolean(draft.photoDataUrl);
  if (step === "animal") return null;
  if (!hasAnimal) return "animal";
  if (step === "sample") return null;
  if (!hasSample) return "sample";
  if (step === "photo") return null;
  if (!hasPhoto) return "photo";
  return null;
}

const storageKey = "animoda-studio";

function asAudience(value: unknown): StudioAudience {
  if (value === "Girls" || value === "Boys" || value === "Kids") return "Kids";
  if (value === "Men") return "Men";
  return "Women";
}

function asStyle(value: unknown): FashionSampleStyleId | null {
  if (value === "formal" || value === "casual_street" || value === "youth_couture") return value;
  return null;
}

export function normalizeDraft(value: unknown): StudioDraft {
  if (!value || typeof value !== "object") return emptyDraft();
  const parsed = value as Partial<StudioDraft>;
  const animalSlug = typeof parsed.animalSlug === "string" && animalBySlug(parsed.animalSlug) ? parsed.animalSlug : null;
  const draft: StudioDraft = {
    visitId: typeof parsed.visitId === "string" && isVisitId(parsed.visitId) ? parsed.visitId : null,
    photoDataUrl: typeof parsed.photoDataUrl === "string" && parsed.photoDataUrl.startsWith("data:image/") ? parsed.photoDataUrl : null,
    photoName: typeof parsed.photoName === "string" ? parsed.photoName.slice(0, 180) : null,
    animalSlug,
    audience: asAudience(parsed.audience),
    fashionSampleId: typeof parsed.fashionSampleId === "string" && sampleIdPattern.test(parsed.fashionSampleId) ? parsed.fashionSampleId : null,
    fashionSampleStyle: asStyle(parsed.fashionSampleStyle),
    savedThisVisit: parsed.savedThisVisit === true,
    quotationNoted: parsed.quotationNoted === true,
  };
  if (!fashionSampleStillFits(draft)) {
    draft.fashionSampleId = null;
    draft.fashionSampleStyle = null;
  }
  if (!draft.photoDataUrl) draft.photoName = null;
  return draft;
}

export function readStoredDraft(): StudioDraft {
  if (typeof sessionStorage === "undefined") return emptyDraft();
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return emptyDraft();
    return normalizeDraft(JSON.parse(raw));
  } catch {
    return emptyDraft();
  }
}

export function writeStoredDraft(draft: StudioDraft): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredDraft() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* Private browsing can reject storage. The in-memory visit still clears. */
  }
}
