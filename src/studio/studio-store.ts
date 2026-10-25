import { animalBySlug } from "@/content/catalogue";
import {
  audienceMatches,
  clearStoredDraft,
  emptyDraft,
  readStoredDraft,
  writeStoredDraft,
  type StudioAudience,
  type StudioDraft,
} from "./session";

const storageWarning = "This browser did not keep the studio visit. It remains available until you leave the page.";

export type StudioSnapshot = {
  draft: StudioDraft;
  ready: boolean;
  storageWarning: string | null;
};

const initialSnapshot: StudioSnapshot = { draft: emptyDraft(), ready: false, storageWarning: null };
let snapshot: StudioSnapshot = initialSnapshot;
let loaded = false;
const eventName = "animoda-studio";

function publish(draft: StudioDraft, ready: boolean) {
  const stored = ready ? writeStoredDraft(draft) : true;
  snapshot = { draft, ready, storageWarning: stored ? null : storageWarning };
  if (typeof window !== "undefined") window.dispatchEvent(new Event(eventName));
}

export function ensureStudioLoaded(animal: string | null) {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = readStoredDraft();
  if (!stored.animalSlug && animal && animalBySlug(animal)) stored.animalSlug = animal;
  publish(stored, true);
}

export function subscribeStudio(onStoreChange: () => void) {
  window.addEventListener(eventName, onStoreChange);
  return () => window.removeEventListener(eventName, onStoreChange);
}

export function getStudioSnapshot() {
  return snapshot;
}

export function getServerStudioSnapshot() {
  return initialSnapshot;
}

function update(recipe: (draft: StudioDraft) => StudioDraft) {
  publish(recipe(snapshot.draft), true);
}

export const studioActions = {
  setPhoto(input: { dataUrl: string; name: string }) {
    update((current) => ({ ...current, photoDataUrl: input.dataUrl, photoName: input.name }));
  },
  clearPhoto() {
    update((current) => ({ ...current, photoDataUrl: null, photoName: null }));
  },
  setAnimal(slug: string) {
    update((current) => {
      if (!animalBySlug(slug)) return current;
      const same = current.animalSlug === slug;
      return { ...current, animalSlug: slug, directionId: same ? current.directionId : null, quotationNoted: false };
    });
  },
  setAudience(audience: StudioAudience) {
    update((current) => {
      const animal = current.animalSlug ? animalBySlug(current.animalSlug) : undefined;
      const direction = animal?.directions.find((item) => item.id === current.directionId);
      const keep = direction ? audienceMatches(direction.audience, audience) : false;
      return { ...current, audience, directionId: keep ? current.directionId : null };
    });
  },
  setDirection(id: string) {
    update((current) => {
      const animal = current.animalSlug ? animalBySlug(current.animalSlug) : undefined;
      const direction = animal?.directions.find((item) => item.id === id);
      if (!direction || !audienceMatches(direction.audience, current.audience)) return current;
      return { ...current, directionId: id, quotationNoted: false };
    });
  },
  saveVisit() {
    update((current) => ({ ...current, savedThisVisit: true }));
  },
  noteQuotation() {
    update((current) => ({ ...current, quotationNoted: true }));
  },
  reset() {
    clearStoredDraft();
    loaded = true;
    publish(emptyDraft(), true);
  },
};
