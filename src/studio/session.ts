import {
  animalBySlug,
  directionSettings,
  type CatalogueAnimal,
  type SampleDirection,
} from "@/content/catalogue";

export const studioAudiences = ["Women", "Men", "Girls", "Boys", "Unisex"] as const;
export type StudioAudience = (typeof studioAudiences)[number];

export const studioSteps = [
  { id: "photo", href: "/studio", label: "1. Photo" },
  { id: "animal", href: "/studio/animal", label: "2. Choose Animal" },
  { id: "suggestions", href: "/studio/suggestions", label: "3. Suggestions" },
  { id: "look", href: "/studio/look", label: "4. Try-On" },
  { id: "couturier", href: "/studio/next", label: "5. Couturier" },
] as const;

export type StudioStepId = (typeof studioSteps)[number]["id"];
export type DirectionSetting = (typeof directionSettings)[number];

export const maxPhotoBytes = 25 * 1024 * 1024;
export const acceptedPhotoTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const conceptProviderMessage =
  "A concept provider is not connected, so these sample directions cannot be regenerated. The list is unchanged.";

export const tryOnUnavailableMessage =
  "The try-on provider is not connected. Your photograph and the selected design stay separate, and the design you selected remains the reference.";

export type StudioDraft = {
  photoDataUrl: string | null;
  photoName: string | null;
  animalSlug: string | null;
  audience: StudioAudience;
  directionId: string | null;
  savedThisVisit: boolean;
  quotationNoted: boolean;
};

export function emptyDraft(): StudioDraft {
  return {
    photoDataUrl: null,
    photoName: null,
    animalSlug: null,
    audience: "Unisex",
    directionId: null,
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

export function audienceMatches(label: string, audience: StudioAudience): boolean {
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
  audience: StudioAudience,
  setting: DirectionSetting,
): SampleDirection[] {
  return animal.directions.filter((direction) => {
    if (!audienceMatches(direction.audience, audience)) return false;
    if (setting === "All Silhouettes") return true;
    return direction.setting === setting;
  });
}

export function directionStillFits(draft: StudioDraft): boolean {
  if (!draft.animalSlug || !draft.directionId) return false;
  const animal = animalBySlug(draft.animalSlug);
  const direction = animal?.directions.find((item) => item.id === draft.directionId);
  if (!direction) return false;
  return audienceMatches(direction.audience, draft.audience);
}

export function missingFor(step: StudioStepId, draft: StudioDraft): "photo" | "animal" | "suggestions" | null {
  const hasPhoto = Boolean(draft.photoDataUrl);
  const hasAnimal = Boolean(draft.animalSlug && animalBySlug(draft.animalSlug));
  const hasDirection = directionStillFits(draft);
  if (step === "photo") return null;
  if (!hasPhoto) return "photo";
  if (step === "animal") return null;
  if (!hasAnimal) return "animal";
  if (step === "suggestions") return null;
  if (!hasDirection) return "suggestions";
  return null;
}

const storageKey = "animoda-studio";

function asAudience(value: unknown): StudioAudience {
  return studioAudiences.includes(value as StudioAudience) ? (value as StudioAudience) : "Unisex";
}

export function normalizeDraft(value: unknown): StudioDraft {
  if (!value || typeof value !== "object") return emptyDraft();
  const parsed = value as Partial<StudioDraft>;
  const animalSlug = typeof parsed.animalSlug === "string" && animalBySlug(parsed.animalSlug) ? parsed.animalSlug : null;
  const draft: StudioDraft = {
    photoDataUrl: typeof parsed.photoDataUrl === "string" && parsed.photoDataUrl.startsWith("data:image/") ? parsed.photoDataUrl : null,
    photoName: typeof parsed.photoName === "string" ? parsed.photoName.slice(0, 180) : null,
    animalSlug,
    audience: asAudience(parsed.audience),
    directionId: typeof parsed.directionId === "string" ? parsed.directionId : null,
    savedThisVisit: parsed.savedThisVisit === true,
    quotationNoted: parsed.quotationNoted === true,
  };
  if (!directionStillFits(draft)) draft.directionId = null;
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

export async function requestTryOnPreview(): Promise<{ ok: false; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: false, message: tryOnUnavailableMessage };
}
