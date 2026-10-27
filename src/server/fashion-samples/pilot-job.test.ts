import { describe, expect, it, vi } from "vitest";
import { ensureStoredAnimalSamples, readStoredAnimalSamples, type PilotRead, type PilotSampleFile } from "./pilot-job";
import { defaultGptImageModel, generateFashionPng, readImageModel, supportedGptImageModels } from "./openai-image";

const slug = "army-green-moth";
const samples: PilotSampleFile[] = [
  { style: "formal", imagePath: "animals/army-green-moth/formal/11111111-1111-4111-8111-111111111111.png", imageUrl: "https://example.supabase.co/storage/formal.png" },
  { style: "casual_street", imagePath: "animals/army-green-moth/casual_street/22222222-2222-4222-8222-222222222222.png", imageUrl: "https://example.supabase.co/storage/casual.png" },
  { style: "youth_couture", imagePath: "animals/army-green-moth/youth_couture/33333333-3333-4333-8333-333333333333.png", imageUrl: "https://example.supabase.co/storage/youth.png" },
];

const env = { OPENAI_API_KEY: "sk-test-secret-value", OPENAI_IMAGE_MODEL: "gpt-image-2.5-sunburst" };

describe("catalogue sample job", () => {
  it("accepts documented image models and defaults only when the value is empty", () => {
    for (const model of supportedGptImageModels) {
      expect(readImageModel({ OPENAI_IMAGE_MODEL: `  ${model}  ` })).toEqual({ ok: true, model, source: "configured" });
    }
    expect(readImageModel({})).toEqual({ ok: true, model: defaultGptImageModel, source: "default" });
    expect(readImageModel({ OPENAI_IMAGE_MODEL: "gpt-image-1" }).ok).toBe(false);
    expect(readImageModel({ OPENAI_IMAGE_MODEL: "gpt-image-test" }).ok).toBe(false);
    expect(readImageModel({ OPENAI_IMAGE_MODEL: "dall-e-3" }).ok).toBe(false);
  });

  it("stops before a provider call when the image key, model, or storage is absent", async () => {
    await expect(readStoredAnimalSamples(slug, {})).resolves.toEqual({ state: "unconfigured", reason: "openai" });
    await expect(readStoredAnimalSamples(slug, { OPENAI_API_KEY: "sk-test", OPENAI_IMAGE_MODEL: "gpt-image-1" })).resolves.toEqual({
      state: "unconfigured",
      reason: "openai_model",
    });
    await expect(readStoredAnimalSamples(slug, { OPENAI_API_KEY: "sk-test", OPENAI_IMAGE_MODEL: "gpt-image-2.5-flare" })).resolves.toEqual({
      state: "unconfigured",
      reason: "supabase",
    });
    await expect(readStoredAnimalSamples("not-an-animal", env)).resolves.toEqual({ state: "unconfigured", reason: "animal" });
    const result = await ensureStoredAnimalSamples(slug, { env: {} });
    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.message).toMatch(/OPENAI_API_KEY/);
    expect(JSON.stringify(result)).not.toContain("sk-");
  });

  it("does not call the provider when the three stored files are already readable", async () => {
    const generateMissing = vi.fn(async () => undefined);
    const read = vi.fn(async (): Promise<PilotRead> => ({ state: "stored", samples }));
    const result = await ensureStoredAnimalSamples(slug, { env, read, generateMissing });
    expect(generateMissing).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "completed", providerCalled: false, samples });
    if (result.status !== "completed") return;
    expect(result.message).toMatch(/Army green moth/);
    expect(result.message).toMatch(/No new image was requested/);
    expect(JSON.stringify(result)).not.toContain(env.OPENAI_API_KEY);
  });

  it("calls the provider only for a missing style and completes after the files read back", async () => {
    const generateMissing = vi.fn(async () => undefined);
    const reads: PilotRead[] = [
      { state: "incomplete", missing: ["casual_street"] },
      { state: "stored", samples },
    ];
    const read = vi.fn(async (): Promise<PilotRead> => reads.shift() ?? { state: "stored", samples });
    const result = await ensureStoredAnimalSamples(slug, { env, read, generateMissing });
    expect(generateMissing).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: "completed", providerCalled: true });
    if (result.status !== "completed") return;
    expect(result.message).toMatch(/OpenAI returned the missing PNG files/);
    expect(result.message).toMatch(/Army green moth/);
  });

  it("fails a missing sample without a generator and does not claim completion", async () => {
    const read = vi.fn(async (): Promise<PilotRead> => ({ state: "incomplete", missing: ["formal"] }));
    const result = await ensureStoredAnimalSamples("emerald-tree-boa", { env, read });
    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.message).toMatch(/No new image was requested/);
    expect(result.message).toMatch(/not completed/);
  });

  it("replaces stored files only when replacement is requested", async () => {
    const generateMissing = vi.fn(async () => undefined);
    const read = vi.fn(async (): Promise<PilotRead> => ({ state: "stored", samples }));
    const result = await ensureStoredAnimalSamples(slug, { env, read, generateMissing, replaceStored: true });
    expect(generateMissing).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: "completed", providerCalled: true });
  });
});

describe("OpenAI image request", () => {
  it("posts one PNG generation and never returns the key", async () => {
    const original = globalThis.fetch;
    const seen: { url: string; authorization: string; body: unknown }[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      seen.push({
        url: String(input),
        authorization: new Headers(init?.headers).get("authorization") ?? "",
        body: JSON.parse(String(init?.body)),
      });
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from("not-a-png").toString("base64") }] }), { status: 200 });
    }) as typeof fetch;
    await expect(generateFashionPng({ apiKey: env.OPENAI_API_KEY, model: "gpt-image-2.5-sunburst", prompt: "a garment" })).rejects.toThrow(/openai_invalid_image/);
    globalThis.fetch = original;
    expect(seen).toHaveLength(1);
    expect(seen[0]?.url).toBe("https://api.openai.com/v1/images/generations");
    expect(seen[0]?.authorization).toBe(`Bearer ${env.OPENAI_API_KEY}`);
    expect(seen[0]?.body).toMatchObject({ model: "gpt-image-2.5-sunburst", size: "1024x1536", output_format: "png", n: 1 });
    expect(JSON.stringify(seen[0]?.body)).not.toContain(env.OPENAI_API_KEY);
  });
});
