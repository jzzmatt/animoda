import { animalBySlug } from "@/content/catalogue";
import { sampleFitsAudience, type FashionSampleStyleId } from "@/content/fashion-samples";
import {
  clearStoredDraft,
  emptyDraft,
  newVisitId,
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
  if (!stored.visitId) stored.visitId = newVisitId();
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
      return {
        ...current,
        animalSlug: slug,
        fashionSampleId: same ? current.fashionSampleId : null,
        fashionSampleStyle: same ? current.fashionSampleStyle : null,
        quotationNoted: false,
      };
    });
  },
  setAudience(audience: StudioAudience) {
    update((current) => {
      const audienceId = audience.toLowerCase();
      const keep =
        current.fashionSampleStyle && (audienceId === "men" || audienceId === "women" || audienceId === "kids")
          ? sampleFitsAudience(audienceId, current.fashionSampleStyle)
          : false;
      return {
        ...current,
        audience,
        fashionSampleId: keep ? current.fashionSampleId : null,
        fashionSampleStyle: keep ? current.fashionSampleStyle : null,
      };
    });
  },
  setFashionSample(input: { id: string; style: FashionSampleStyleId }) {
    update((current) => {
      const audienceId = current.audience.toLowerCase();
      if (audienceId !== "men" && audienceId !== "women" && audienceId !== "kids") return current;
      if (!sampleFitsAudience(audienceId, input.style)) return current;
      return { ...current, fashionSampleId: input.id, fashionSampleStyle: input.style, quotationNoted: false };
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
    publish({ ...emptyDraft(), visitId: newVisitId() }, true);
  },
};
