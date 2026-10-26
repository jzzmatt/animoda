import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as getJob } from "../../app/api/studio/jobs/[id]/route";
import { GET as getImage } from "../../app/api/studio/jobs/[id]/image/route";
import { POST } from "../../app/api/studio/jobs/route";
import { sampleDirections } from "@/studio/session";
import { animalBySlug } from "@/content/catalogue";
import { FashionImageError, type FashionImageProvider, type GeneratedImage } from "./fashion-image-provider";
import { pngStub } from "./portrait-input";
import {
  createStudioJob,
  flushStudioJobs,
  mockJobQuota,
  mockQueuedMs,
  mockRunMs,
  parseStudioJobRequest,
  readStudioJob,
  resetStudioJobsForTests,
  setStudioImageProviderForTests,
  type StudioJobRequest,
} from "./studio-jobs";

const visit = "11111111-1111-4111-8111-111111111111";
const otherVisit = "22222222-2222-4222-8222-222222222222";
const secret = "sk-test-secret-value";

function jpeg(marker: number): Buffer {
  const bytes = Buffer.alloc(64, marker);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  return bytes;
}

function portrait() {
  return { bytes: pngStub(512, 768), mediaType: "image/png" as const, width: 512, height: 768 };
}

function conceptRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return {
    visitId: visit,
    kind: "concept",
    animalSlug: "plains-zebra",
    audience: "Women",
    directionId: "zebra-gown",
    setting: "All Silhouettes",
    portrait: null,
    ...overrides,
  };
}

function tryOnRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return { ...conceptRequest(), kind: "try-on", portrait: portrait(), ...overrides };
}

function provider(image: GeneratedImage, calls: string[] = []): FashionImageProvider {
  return {
    id: "openai",
    async generateConcept() {
      calls.push("concept");
      return image;
    },
    async editTryOn() {
      calls.push("try-on");
      return image;
    },
  };
}

describe("studio jobs", () => {
  beforeEach(() => {
    resetStudioJobsForTests();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_IMAGE_MODEL;
    delete process.env.ANIMODA_IMAGE_PROVIDER;
    delete process.env.FASHION_CONCEPT_API_KEY;
    delete process.env.VIRTUAL_TRY_ON_API_KEY;
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_IMAGE_MODEL;
    delete process.env.ANIMODA_IMAGE_PROVIDER;
    delete process.env.FASHION_CONCEPT_API_KEY;
    delete process.env.VIRTUAL_TRY_ON_API_KEY;
  });

  it("fails closed when OpenAI is not configured and does not spend quota", () => {
    process.env.FASHION_CONCEPT_API_KEY = secret;
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job).toMatchObject({
      status: "failed",
      mode: "unconfigured",
      label: "Configuration",
      referenceDirectionId: "zebra-gown",
      images: [],
      composite: null,
      providerCalled: false,
      referencePreserved: true,
    });
    expect(created.job.message).toMatch(/Set OPENAI_API_KEY/);
    expect(created.job.message).toMatch(/No image request was sent/);
    expect(created.job.quota.used).toBe(0);
    expect(JSON.stringify(created.job)).not.toContain(secret);
    expect(readStudioJob(created.job.id, visit, 9_000)?.status).toBe("failed");
    expect(createStudioJob(conceptRequest(), 2_000).ok).toBe(true);
  });

  it("runs an explicitly labelled demo without inventing an image", () => {
    process.env.ANIMODA_IMAGE_PROVIDER = "demo";
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job).toMatchObject({
      status: "queued",
      mode: "demo",
      label: "Labelled demo",
      composite: null,
      providerCalled: false,
    });
    expect(created.job.message).toMatch(/Labelled demo/);
    expect(created.job.message).toMatch(/does not call OpenAI/);
    expect(created.job.message).not.toMatch(/guaranteed/i);

    const running = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs);
    expect(running?.status).toBe("running");
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    const zebra = animalBySlug("plains-zebra");
    if (!zebra || !done) throw new Error("fixture missing");
    expect(done.status).toBe("succeeded");
    expect(done.images).toEqual([]);
    expect(done.directionIds).toEqual(sampleDirections(zebra, "Women", "All Silhouettes").map((item) => item.id));
    expect(done.directionIds).toEqual(["zebra-gown", "zebra-trench"]);
    expect(done.referenceDirectionId).toBe("zebra-gown");
    expect(done.quota).toEqual({ kind: "concept", used: 1, limit: mockJobQuota, remaining: mockJobQuota - 1 });
  });

  it("keeps a children's demo concept on the children's direction", () => {
    process.env.ANIMODA_IMAGE_PROVIDER = "demo";
    const created = createStudioJob(conceptRequest({ audience: "Girls", directionId: "zebra-kids" }), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.directionIds).toEqual(["zebra-kids"]);
    expect(done?.referenceDirectionId).toBe("zebra-kids");
    expect(done?.images).toEqual([]);
    expect(createStudioJob(conceptRequest({ audience: "Girls", directionId: "zebra-gown" }), 2_000).ok).toBe(false);
  });

  it("returns a labelled demo try-on with no composite", () => {
    process.env.ANIMODA_IMAGE_PROVIDER = "demo";
    const created = createStudioJob(tryOnRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.status).toBe("succeeded");
    expect(done?.directionIds).toEqual(["zebra-gown"]);
    expect(done?.composite).toBeNull();
    expect(done?.providerCalled).toBe(false);
    expect(done?.message).toMatch(/no try-on image was made/i);
    expect(done?.message).toMatch(/browser/);
    expect(createStudioJob(tryOnRequest({ directionId: null, portrait: portrait() }), 2_000).ok).toBe(false);
    expect(createStudioJob(tryOnRequest({ portrait: null }), 3_000).ok).toBe(false);
  });

  it("saves OpenAI concept and try-on bytes only for the owning visit", async () => {
    const calls: string[] = [];
    const conceptBytes = jpeg(9);
    setStudioImageProviderForTests(provider({ bytes: conceptBytes, mediaType: "image/jpeg" }, calls));
    const concept = createStudioJob(conceptRequest(), 1_000);
    expect(concept.ok).toBe(true);
    if (!concept.ok) return;
    await flushStudioJobs();
    const done = readStudioJob(concept.job.id, visit, 5_000);
    expect(done?.status).toBe("succeeded");
    expect(done?.mode).toBe("openai");
    expect(done?.providerCalled).toBe(true);
    expect(done?.referenceDirectionId).toBe("zebra-gown");
    expect(done?.images.map((image) => image.directionId)).toEqual(["zebra-gown", "zebra-trench"]);
    expect(done?.images.every((image) => image.href.startsWith(`/api/studio/jobs/${concept.job.id}/image?`))).toBe(true);
    expect(done?.composite).toBeNull();
    expect(JSON.stringify(done)).not.toContain(conceptBytes.toString("base64"));
    expect(calls).toEqual(["concept", "concept"]);

    const tryOnBytes = jpeg(4);
    setStudioImageProviderForTests(provider({ bytes: tryOnBytes, mediaType: "image/jpeg" }, calls));
    const tryOn = createStudioJob(tryOnRequest(), 2_000);
    expect(tryOn.ok).toBe(true);
    if (!tryOn.ok) return;
    await flushStudioJobs();
    const preview = readStudioJob(tryOn.job.id, visit, 6_000);
    expect(preview?.status).toBe("succeeded");
    expect(preview?.composite).toMatch(/^\/api\/studio\/jobs\//);
    expect(preview?.message).toMatch(/not a tailoring measurement/);
    expect(JSON.stringify(preview)).not.toContain(secret);

    const image = await getImage(new Request(`http://localhost${preview?.composite}`), {
      params: Promise.resolve({ id: tryOn.job.id }),
    });
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/jpeg");
    expect(image.headers.get("cache-control")).toBe("private, no-store");
    const body = Buffer.from(await image.arrayBuffer());
    expect(body.equals(tryOnBytes)).toBe(true);
    expect(body.equals(portrait().bytes)).toBe(false);

    const hidden = await getImage(
      new Request(`http://localhost/api/studio/jobs/${tryOn.job.id}/image?visitId=${otherVisit}&slot=0`),
      { params: Promise.resolve({ id: tryOn.job.id }) },
    );
    expect(hidden.status).toBe(404);
  });

  it("discards an unchanged try-on and records provider failures without the key", async () => {
    const photo = portrait();
    setStudioImageProviderForTests(provider({ bytes: photo.bytes, mediaType: "image/png" }));
    const unchanged = createStudioJob(tryOnRequest({ portrait: photo }), 1_000);
    expect(unchanged.ok).toBe(true);
    if (!unchanged.ok) return;
    await flushStudioJobs();
    const failed = readStudioJob(unchanged.job.id, visit, 2_000);
    expect(failed?.status).toBe("failed");
    expect(failed?.composite).toBeNull();
    expect(failed?.message).toMatch(/unchanged input image/);
    expect(failed?.providerCalled).toBe(true);

    setStudioImageProviderForTests({
      id: "openai",
      async generateConcept() {
        throw new FashionImageError(`OpenAI rate-limited this request. Wait and try again. No image was saved. ${secret}`, "rate-limit");
      },
      async editTryOn() {
        return { bytes: jpeg(8), mediaType: "image/jpeg" };
      },
    });
    const limited = createStudioJob(conceptRequest(), 3_000);
    expect(limited.ok).toBe(true);
    if (!limited.ok) return;
    await flushStudioJobs();
    const limitedJob = readStudioJob(limited.job.id, visit, 4_000);
    expect(limitedJob?.status).toBe("failed");
    expect(limitedJob?.message).toMatch(/rate-limited/);
    expect(JSON.stringify(limitedJob)).not.toContain(secret);

    setStudioImageProviderForTests({
      id: "openai",
      async generateConcept() {
        throw new FashionImageError("The image model is not available to this OpenAI account. No image was generated.", "unavailable-model");
      },
      async editTryOn() {
        return { bytes: jpeg(8), mediaType: "image/jpeg" };
      },
    });
    const missing = createStudioJob(conceptRequest(), 5_000);
    expect(missing.ok).toBe(true);
    if (!missing.ok) return;
    await flushStudioJobs();
    const missingJob = readStudioJob(missing.job.id, visit, 6_000);
    expect(missingJob?.status).toBe("failed");
    expect(missingJob?.providerCalled).toBe(false);
    expect(missingJob?.images).toEqual([]);
  });

  it("stops one job kind at the visit quota and leaves the other kind open", () => {
    process.env.ANIMODA_IMAGE_PROVIDER = "demo";
    for (let index = 0; index < mockJobQuota; index += 1) {
      const job = createStudioJob(conceptRequest(), index);
      expect(job.ok).toBe(true);
    }
    const blocked = createStudioJob(conceptRequest(), 50);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.status).toBe(429);
    expect(blocked.quota).toEqual({ kind: "concept", used: mockJobQuota, limit: mockJobQuota, remaining: 0 });
    expect(blocked.error).toMatch(/not an account quota/);
    expect(blocked.error).not.toMatch(/99\.4|98%/);
    expect(createStudioJob(tryOnRequest(), 60).ok).toBe(true);
    expect(createStudioJob(conceptRequest({ visitId: otherVisit }), 70).ok).toBe(true);
  });

  it("hides a job from another visit and rejects a concept photograph", () => {
    process.env.ANIMODA_IMAGE_PROVIDER = "demo";
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(readStudioJob(created.job.id, otherVisit, 5_000)).toBeNull();
    expect(readStudioJob("not-a-job", visit, 5_000)).toBeNull();

    const portraitUrl = `data:image/png;base64,${pngStub(512, 768).toString("base64")}`;
    const parsed = parseStudioJobRequest(JSON.stringify({ ...conceptRequest(), portrait: portraitUrl }));
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.status).toBe(400);
    expect(parsed.error).toMatch(/photograph/);
    expect(parsed.error).not.toContain("base64");

    const mismatched = parseStudioJobRequest(
      JSON.stringify({ ...tryOnRequest(), portrait: `data:image/jpeg;base64,${pngStub(512, 768).toString("base64")}` }),
    );
    expect(mismatched.ok).toBe(false);
    if (mismatched.ok) return;
    expect(mismatched.error).toMatch(/does not match/);
    expect(mismatched.error).not.toContain("iVBORw0KGgo");
  });

  it("accepts an unconfigured job through the route and refuses another visit", async () => {
    const conceptBody: Record<string, unknown> = { ...conceptRequest() };
    delete conceptBody.portrait;
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptBody),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; status: string; referenceDirectionId: string; composite: null; mode: string };
    expect(body.referenceDirectionId).toBe("zebra-gown");
    expect(body.composite).toBeNull();
    expect(body.mode).toBe("unconfigured");
    expect(body.status).toBe("failed");

    const hidden = await getJob(new Request(`http://localhost/api/studio/jobs/${body.id}?visitId=${otherVisit}`), {
      params: Promise.resolve({ id: body.id }),
    });
    expect(hidden.status).toBe(404);

    const extra = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify({ ...tryOnRequest(), image: "data:image/png;base64,portrait" }),
      }),
    );
    expect(extra.status).toBe(400);
    const extraBody = (await extra.json()) as { error: string };
    expect(extraBody.error).toMatch(/does not accept that field/);
    expect(JSON.stringify(extraBody)).not.toContain("data:image");
    expect(JSON.stringify(extraBody)).not.toContain("base64");
  });
});
