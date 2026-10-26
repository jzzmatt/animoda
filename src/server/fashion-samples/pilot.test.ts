import { describe, expect, it } from "vitest";
import { animalBySlug } from "@/content/catalogue";
import { EMERALD_TREE_BOA_SLUG } from "@/content/persisted-samples";
import { decidePilotStep, isPng, pilotBrief, pilotPrompt, pilotStyles } from "@/server/fashion-samples/pilot";

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(32).fill(1)]);

describe("emerald tree boa pilot", () => {
  it("uses the catalogue slug and refuses every other animal", () => {
    const animal = animalBySlug(EMERALD_TREE_BOA_SLUG);
    expect(animal?.commonName).toBe("Emerald tree boa");
    expect(animal?.scientificName).toBe("Corallus caninus");
    expect(() => pilotPrompt(animalBySlug("plains-zebra")!, "formal")).toThrow("pilot_animal_refused");
  });

  it("writes three different fashion prompts from the boa record", () => {
    const animal = animalBySlug(EMERALD_TREE_BOA_SLUG)!;
    const prompts = pilotStyles.map((item) => pilotPrompt(animal, item.style));
    expect(new Set(prompts).size).toBe(3);
    for (const prompt of prompts) {
      expect(prompt).toContain("Corallus caninus");
      expect(prompt).toContain("#1F7A45");
      expect(prompt).toContain("fashion");
      expect(prompt.toLowerCase()).not.toContain("plains zebra");
    }
    expect(prompts[2]).toMatch(/age-appropriate/i);
    expect(pilotBrief("formal").title).not.toBe(pilotBrief("casual_street").title);
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
