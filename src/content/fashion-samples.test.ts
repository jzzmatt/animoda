import { describe, expect, it } from "vitest";
import {
  assessAnimalVariants,
  assessCatalogueVariants,
  fashionSampleVariants,
  kidsLegacyMappingReason,
  planPhase6b2,
  stylesForAudience,
  toPublicFashionSample,
  type AuditedSampleRecord,
} from "./fashion-samples";

const animalId = "plains-zebra";

function row(overrides: Partial<AuditedSampleRecord> & Pick<AuditedSampleRecord, "id" | "style">): AuditedSampleRecord {
  return {
    animalId,
    audience: null,
    generationStatus: "completed",
    imagePath: `animals/${animalId}/${overrides.style}/${overrides.id}.png`,
    title: `${overrides.style} title`,
    description: `${overrides.style} description`,
    generationModel: "gpt-image-2.5-sunburst",
    promptVersion: "catalogue-1",
    promptHash: "a".repeat(64),
    objectExists: true,
    imageRetrieved: true,
    ...overrides,
  };
}

describe("fashion sample variants", () => {
  it("offers men and women two styles and kids only youth couture", () => {
    expect(stylesForAudience("men")).toEqual(["formal", "casual_street"]);
    expect(stylesForAudience("women")).toEqual(["formal", "casual_street"]);
    expect(stylesForAudience("kids")).toEqual(["youth_couture"]);
    expect(fashionSampleVariants).toHaveLength(5);
    expect(kidsLegacyMappingReason).toContain("youth_couture");
  });

  it("reuses a verified youth row for kids and does not assign formal or casual to men or women", () => {
    const formal = row({ id: "11111111-1111-4111-8111-111111111111", style: "formal" });
    const casual = row({ id: "22222222-2222-4222-8222-222222222222", style: "casual_street" });
    const youth = row({ id: "33333333-3333-4333-8333-333333333333", style: "youth_couture" });
    const decisions = assessAnimalVariants(animalId, [formal, casual, youth], (path) => `https://example.test/${path}`);
    const byKey = Object.fromEntries(decisions.map((item) => [`${item.audience}:${item.style}`, item]));

    expect(byKey["kids:youth_couture"]?.assessment).toBe("reusable");
    expect(byKey["kids:youth_couture"]?.mapping).toBe("legacy_youth");
    expect(byKey["kids:youth_couture"]?.sampleId).toBe(youth.id);
    expect(byKey["kids:youth_couture"]?.imageUrl).toContain(youth.imagePath ?? "");
    expect(byKey["men:formal"]?.assessment).toBe("ambiguous");
    expect(byKey["women:formal"]?.assessment).toBe("ambiguous");
    expect(byKey["men:casual_street"]?.assessment).toBe("ambiguous");
    expect(byKey["women:casual_street"]?.assessment).toBe("ambiguous");
    for (const key of ["men:formal", "women:formal", "men:casual_street", "women:casual_street"]) {
      expect(byKey[key]?.sampleId).toBeNull();
      expect(byKey[key]?.imageUrl).toBeNull();
      expect(byKey[key]?.heldSampleIds.length).toBe(1);
    }
  });

  it("marks a target missing when no row exists for that style", () => {
    const decisions = assessAnimalVariants(animalId, []);
    expect(decisions.map((item) => item.assessment)).toEqual(["missing", "missing", "missing", "missing", "missing"]);
  });

  it("keeps an explicit men's formal sample on men and leaves women missing", () => {
    const formal = row({
      id: "11111111-1111-4111-8111-111111111111",
      style: "formal",
      audience: "men",
    });
    const decisions = assessAnimalVariants(animalId, [formal]);
    const men = decisions.find((item) => item.audience === "men" && item.style === "formal");
    const women = decisions.find((item) => item.audience === "women" && item.style === "formal");
    expect(men?.assessment).toBe("reusable");
    expect(men?.mapping).toBe("explicit");
    expect(women?.assessment).toBe("missing");
    expect(women?.heldSampleIds).toEqual([]);
  });

  it("does not treat a broken stored object as a ready fashion sample", () => {
    const youth = row({
      id: "33333333-3333-4333-8333-333333333333",
      style: "youth_couture",
      objectExists: true,
      imageRetrieved: false,
    });
    const decision = assessAnimalVariants(animalId, [youth]).find((item) => item.audience === "kids");
    expect(decision?.assessment).toBe("invalid");
    expect(decision?.presentation).toBe("unavailable");
    expect(decision?.sampleId).toBeNull();
    expect(toPublicFashionSample(decision!).imageUrl).toBeNull();
  });

  it("shows preparation in progress without calling the row reusable", () => {
    const youth = row({
      id: "33333333-3333-4333-8333-333333333333",
      style: "youth_couture",
      generationStatus: "generating",
      objectExists: false,
      imageRetrieved: false,
      imagePath: null,
    });
    const decision = assessAnimalVariants(animalId, [youth]).find((item) => item.audience === "kids");
    expect(decision?.assessment).toBe("invalid");
    expect(decision?.presentation).toBe("preparing");
    expect(decision?.sampleId).toBeNull();
  });

  it("holds ambiguous variants out of the generation plan and keeps reusable ones", () => {
    const formal = row({ id: "11111111-1111-4111-8111-111111111111", style: "formal" });
    const youth = row({ id: "33333333-3333-4333-8333-333333333333", style: "youth_couture" });
    const broken = row({
      id: "44444444-4444-4444-8444-444444444444",
      style: "casual_street",
      animalId: "lion",
      imagePath: "animals/lion/casual_street/44444444-4444-4444-8444-444444444444.png",
      objectExists: false,
      imageRetrieved: false,
    });
    const decisions = assessCatalogueVariants([animalId, "lion"], [formal, youth, broken]);
    const plan = planPhase6b2(decisions, [formal, youth, broken]);
    expect(plan.keep.map((item) => `${item.animalId}:${item.audience}:${item.style}`)).toEqual([
      `${animalId}:kids:youth_couture`,
    ]);
    expect(plan.holdForReview.map((item) => `${item.animalId}:${item.audience}:${item.style}`)).toEqual([
      `${animalId}:men:formal`,
      `${animalId}:women:formal`,
      "lion:men:casual_street",
      "lion:women:casual_street",
    ]);
    expect(plan.generate.map((item) => `${item.animalId}:${item.audience}:${item.style}`)).toContain(
      "lion:kids:youth_couture",
    );
    expect(plan.generate.some((item) => item.assessment === "ambiguous" || item.assessment === "reusable")).toBe(false);
    expect(plan.resume).toEqual([]);
  });
});
