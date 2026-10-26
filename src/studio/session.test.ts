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

  it("blocks later steps until the visit has a portrait, an animal, and a selected design", () => {
    const draft = emptyDraft();
    expect(missingFor("animal", draft)).toBe("photo");
    draft.photoDataUrl = "data:image/jpeg;base64,abc";
    expect(missingFor("suggestions", draft)).toBe("animal");
    draft.animalSlug = "plains-zebra";
    draft.audience = "Women";
    expect(missingFor("look", draft)).toBe("suggestions");
    draft.directionId = "zebra-gown";
    expect(missingFor("couturier", draft)).toBeNull();
    draft.audience = "Boys";
    expect(missingFor("look", draft)).toBe("suggestions");
  });

  it("drops a stored design that no longer belongs to the animal and audience", () => {
    const draft = normalizeDraft({
      photoDataUrl: "data:image/png;base64,abc",
      photoName: "portrait.png",
      animalSlug: "not-a-species",
      audience: "Men",
      directionId: "zebra-gown",
      savedThisVisit: true,
      visitId: "11111111-1111-4111-8111-111111111111",
    });
    expect(draft.animalSlug).toBeNull();
    expect(draft.directionId).toBeNull();
    expect(draft.savedThisVisit).toBe(true);
    expect(draft.visitId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("drops a visit id that is not a UUID", () => {
    expect(isVisitId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(normalizeDraft({ visitId: "not-a-visit", animalSlug: "plains-zebra" }).visitId).toBeNull();
  });
});
