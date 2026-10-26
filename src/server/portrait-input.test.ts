import { describe, expect, it } from "vitest";
import { decodePortraitDataUrl, pngStub } from "./portrait-input";

function dataUrl(bytes: Buffer, mime = "image/png") {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

describe("portrait input", () => {
  it("accepts a PNG whose header matches the declared type and size", () => {
    const decoded = decodePortraitDataUrl(dataUrl(pngStub(512, 768)));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.portrait).toMatchObject({ mediaType: "image/png", width: 512, height: 768 });
  });

  it("rejects a mismatched type, a tiny image, and a non-image payload", () => {
    expect(decodePortraitDataUrl(dataUrl(pngStub(512, 512), "image/jpeg")).ok).toBe(false);
    expect(decodePortraitDataUrl(dataUrl(pngStub(16, 16))).ok).toBe(false);
    const text = decodePortraitDataUrl("data:image/png;base64,aGVsbG8=");
    expect(text.ok).toBe(false);
    if (text.ok) return;
    expect(text.error).not.toMatch(/base64|aGVsbG8/);
  });
});
