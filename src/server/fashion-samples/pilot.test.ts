import { describe, expect, it } from "vitest";
import { animalBySlug, catalogueAnimals } from "@/content/catalogue";
import { decidePilotStep, isPng, pilotPrompt, pilotStyles, sampleCopy } from "@/server/fashion-samples/pilot";

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(32).fill(1)]);

describe("catalogue fashion samples", () => {
  it("builds a different prompt for each catalogue animal and style", () => {
    const boa = animalBySlug("emerald-tree-boa")!;
    const zebra = animalBySlug("plains-zebra")!;
    const leopard = animalBySlug("leopard")!;
    const boaPrompts = pilotStyles.map((item) => pilotPrompt(boa, item.style));
    expect(new Set(boaPrompts).size).toBe(3);
    expect(boaPrompts[0]).toContain("Corallus caninus");
    expect(boaPrompts[0]).toContain("#1F7A45");
    expect(boaPrompts[2]).toMatch(/age-appropriate/i);
    expect(pilotPrompt(zebra, "formal")).toContain("Equus quagga");
    expect(pilotPrompt(zebra, "formal")).not.toBe(pilotPrompt(leopard, "formal"));
    expect(pilotPrompt(leopard, "casual_street")).toMatch(/rosette/i);
    expect(sampleCopy(zebra, "formal").title).not.toBe(sampleCopy(zebra, "casual_street").title);
    expect(catalogueAnimals).toHaveLength(37);
  });

  it("skips a completed stored sample and does not treat a missing file as finished", () => {
    expect(decidePilotStep({ generationStatus: "completed", imagePath: "animals/emerald-tree-boa/formal/x.png", objectExists: true })).toBe("skip");
    expect(decidePilotStep({ generationStatus: "failed", imagePath: "animals/emerald-tree-boa/formal/x.png", objectExists: true })).toBe("finish-stored");
    expect(decidePilotStep({ generationStatus: "completed", imagePath: "animals/emerald-tree-boa/formal/x.png", objectExists: false })).toBe("generate");
    expect(decidePilotStep(null)).toBe("generate");
  });

  it("accepts only a real png signature", () => {
    expect(isPng(png)).toBe(true);
    expect(isPng(Uint8Array.from([1, 2, 3, 4]))).toBe(false);
  });
});
