import { describe, expect, it } from "vitest";
import { framingPracticeImageNames, framingPractices } from "./framing-practices";

describe("framing practices", () => {
  it("keeps the four reference sections and their checklists", () => {
    expect(framingPractices.map((practice) => practice.title)).toEqual([
      "Upright stance",
      "Frontal light",
      "Full torso view",
      "Neutral gaze",
    ]);
    expect(framingPractices.map((practice) => practice.description)).toEqual([
      "Stand straight with relaxed shoulders.",
      "Avoid harsh backlighting or heavy cast shadows.",
      "Keep the waistline and collarbones in the frame.",
      "A direct gaze makes the collar area easier to see.",
    ]);
    expect(framingPractices.every((practice) => practice.checklist.length === 4)).toBe(true);
    expect(JSON.stringify(framingPractices)).not.toMatch(/99\.4|98%|biometric/);
  });

  it("uses a separate image for every correct and incorrect example", () => {
    const sources = framingPractices.flatMap((practice) => [practice.correct.src, practice.incorrect.src]);
    expect(new Set(sources).size).toBe(8);
    expect(sources.map((src) => src.split("/").at(-1))).toEqual([...framingPracticeImageNames]);
  });
});
