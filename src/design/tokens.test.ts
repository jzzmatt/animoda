import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandColors, brokenStitchTokens, screenColors, spacing, typeScale } from "./tokens";

const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8").toLowerCase();

describe("Animoda design tokens", () => {
  it("keeps every approved screen colour in the stylesheet", () => {
    for (const hex of Object.values(screenColors)) {
      expect(css).toContain(hex.toLowerCase());
    }
  });

  it("keeps the written brand earth and terracotta hexes", () => {
    expect(css).toContain(brandColors.earth.toLowerCase());
    expect(css).toContain(brandColors.terracotta.toLowerCase());
    expect(css).toContain(brandColors.forest.toLowerCase());
  });

  it("drops the invalid Stitch border-warm token", () => {
    expect(css).not.toContain(brokenStitchTokens["border-warm"].toLowerCase());
    expect(css).not.toMatch(/--color-border-warm\s*:/);
  });

  it("publishes the Stitch type scale and spacing", () => {
    for (const step of Object.values(typeScale)) {
      expect(css).toContain(step.size);
      expect(css).toContain(step.lineHeight);
      expect(css).toContain(step.tracking);
    }
    for (const value of Object.values(spacing)) {
      expect(css).toContain(value);
    }
  });
});
