import { describe, expect, it } from "vitest";
import { animalBySlug } from "@/content/catalogue";
import {
  audienceMatches,
  emptyDraft,
  isVisitId,
  maxPhotoBytes,
  missingFor,
  normalizeDraft,
  photoRejection,
  sampleDirections,
} from "./session";

describe("studio session", () => {
  it("rejects a photograph that is not a still image or is too large", () => {
    expect(photoRejection({ type: "image/gif", size: 100 })).toMatch(/JPG, PNG, or WebP/);
    expect(photoRejection({ type: "image/jpeg", size: maxPhotoBytes + 1 })).toMatch(/25MB/);
    expect(photoRejection({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(photoRejection({ type: "image/webp", size: 2048 })).toBeNull();
  });

  it("keeps women's, men's, children's, and unisex directions apart", () => {
    const zebra = animalBySlug("plains-zebra");
    const tiger = animalBySlug("tiger");
    if (!zebra || !tiger) throw new Error("catalogue fixtures missing");

    expect(sampleDirections(zebra, "Women", "All Silhouettes").map((item) => item.id)).toEqual([
      "zebra-gown",
      "zebra-trench",
    ]);
    expect(sampleDirections(zebra, "Men", "Formal").map((item) => item.id)).toEqual(["zebra-tuxedo"]);
    expect(sampleDirections(zebra, "Girls", "All Silhouettes").map((item) => item.id)).toEqual(["zebra-kids"]);
    expect(sampleDirections(zebra, "Boys", "Youth Couture").map((item) => item.id)).toEqual(["zebra-kids"]);
    expect(sampleDirections(zebra, "Unisex", "All Silhouettes").map((item) => item.id)).toEqual(["zebra-trench"]);
    expect(sampleDirections(tiger, "Women", "All Silhouettes")).toEqual([]);
    expect(sampleDirections(tiger, "Girls", "All Silhouettes").map((item) => item.id)).toEqual(["tiger-bomber"]);
    expect(audienceMatches("Women · Formal", "Men")).toBe(false);
  });

  it("keeps the selected fashion sample across the studio steps and clears it when the audience no longer fits", () => {
    const draft = emptyDraft();
    expect(missingFor("animal", draft)).toBeNull();
    expect(missingFor("sample", draft)).toBe("animal");
    draft.animalSlug = "plains-zebra";
    draft.audience = "Kids";
    expect(missingFor("photo", draft)).toBe("sample");
    draft.fashionSampleId = "33333333-3333-4333-8333-333333333333";
    draft.fashionSampleStyle = "youth_couture";
    expect(missingFor("photo", draft)).toBeNull();
    expect(missingFor("look", draft)).toBe("photo");
    draft.photoDataUrl = "data:image/jpeg;base64,abc";
    expect(missingFor("look", draft)).toBeNull();
    draft.audience = "Men";
    expect(missingFor("photo", normalizeDraft(draft))).toBe("sample");
  });

  it("does not turn an old direction id into a fashion sample", () => {
    const draft = normalizeDraft({
      photoDataUrl: "data:image/png;base64,abc",
      photoName: "portrait.png",
      animalSlug: "not-a-species",
      audience: "Boys",
      directionId: "zebra-gown",
      fashionSampleId: "33333333-3333-4333-8333-333333333333",
      fashionSampleStyle: "formal",
      savedThisVisit: true,
      visitId: "11111111-1111-4111-8111-111111111111",
    });
    expect(draft.animalSlug).toBeNull();
    expect(draft.audience).toBe("Kids");
    expect(draft.fashionSampleId).toBeNull();
    expect(draft.fashionSampleStyle).toBeNull();
    expect(draft.savedThisVisit).toBe(true);
    expect(draft.visitId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("drops a visit id that is not a UUID", () => {
    expect(isVisitId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(normalizeDraft({ visitId: "not-a-visit", animalSlug: "plains-zebra" }).visitId).toBeNull();
  });
});
