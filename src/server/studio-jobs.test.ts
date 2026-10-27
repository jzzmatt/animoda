import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../app/api/studio/jobs/[id]/route";
import { POST } from "../../app/api/studio/jobs/route";
import { ensureStoredAnimalSamples } from "@/server/fashion-samples/pilot-job";
import { runCatalogueFashionSamples } from "@/server/fashion-samples/pilot-run";
import { confirmSelectedFashionSample } from "@/server/fashion-samples/views";
import {
  applyPilotOutcome,
  createStudioJob,
  mockJobQuota,
  mockQueuedMs,
  mockRunMs,
  parseStudioJobRequest,
  readStudioJob,
  resetStudioJobsForTests,
  type StudioJobRequest,
} from "./studio-jobs";

vi.mock("@/server/fashion-samples/pilot-job", async () => {
  const actual = await vi.importActual<typeof import("@/server/fashion-samples/pilot-job")>("@/server/fashion-samples/pilot-job");
  return { ...actual, ensureStoredAnimalSamples: vi.fn(actual.ensureStoredAnimalSamples) };
});

vi.mock("@/server/fashion-samples/pilot-run", () => ({
  runCatalogueFashionSamples: vi.fn(async () => []),
}));

vi.mock("@/server/fashion-samples/views", () => ({
  confirmSelectedFashionSample: vi.fn(async () => ({
    ok: true,
    sample: {
      sampleId: "33333333-3333-4333-8333-333333333333",
      animalId: "plains-zebra",
      audience: "kids",
      style: "youth_couture",
      imagePath: "animals/plains-zebra/youth_couture/33333333-3333-4333-8333-333333333333.png",
      imageUrl: "https://example.supabase.co/youth.png",
      title: "Youth Couture",
    },
  })),
}));

const sampleId = "33333333-3333-4333-8333-333333333333";

const isolatedEnv = [
  "FASHION_CONCEPT_API_KEY",
  "VIRTUAL_TRY_ON_API_KEY",
  "FASHION_SAMPLE_ADMIN_TOKEN",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANIMODA_MOCK_GENERATION",
] as const;

const visit = "11111111-1111-4111-8111-111111111111";
const otherVisit = "22222222-2222-4222-8222-222222222222";
const conceptKey = "super-secret-concept-key";
const imageKey = "sk-test-secret-value";

function conceptRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return {
    visitId: visit,
    kind: "concept",
    animalSlug: "plains-zebra",
    audience: "Kids",
    fashionSampleId: sampleId,
    replaceStored: false,
    ...overrides,
  };
}

function tryOnRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return { ...conceptRequest(), kind: "try-on", ...overrides };
}

function configureImageProvider() {
  process.env.OPENAI_API_KEY = imageKey;
  process.env.OPENAI_IMAGE_MODEL = "gpt-image-2.5-sunburst";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
}

describe("studio jobs", () => {
  const savedEnv: Partial<Record<(typeof isolatedEnv)[number], string | undefined>> = {};

  beforeEach(() => {
    resetStudioJobsForTests();
    vi.mocked(ensureStoredAnimalSamples).mockReset();
    vi.mocked(confirmSelectedFashionSample).mockClear();
    vi.mocked(runCatalogueFashionSamples).mockReset();
    vi.mocked(ensureStoredAnimalSamples).mockResolvedValue({
      status: "completed",
      samples: [],
      providerCalled: false,
      message: "Stored samples. No new image was requested.",
    });
    for (const name of isolatedEnv) {
      savedEnv[name] = process.env[name];
      delete process.env[name];
    }
  });

  afterEach(() => {
    for (const name of isolatedEnv) {
      const value = savedEnv[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("runs a labelled mock only when the mock flag is set", () => {
    process.env.ANIMODA_MOCK_GENERATION = "1";
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job).toMatchObject({
      status: "pending",
      mode: "mock",
      label: "Labelled mock",
      referenceDirectionId: sampleId,
      composite: null,
      providerCalled: false,
      referencePreserved: true,
    });
    expect(created.job.message).toMatch(/Labelled mock/);
    expect(created.job.message).toMatch(/does not count as a real Fashion Sample/);

    const running = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs);
    expect(running?.status).toBe("generating");
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    if (!done) throw new Error("fixture missing");
    expect(done.status).toBe("mock_completed");
    expect(done.providerCalled).toBe(false);
    expect(done.storedSamples).toBeNull();
    expect(done.directionIds).toEqual([]);
    expect(done.quota).toEqual({ kind: "concept", used: 1, limit: mockJobQuota, remaining: mockJobQuota - 1 });
  });

  it("fails a concept job when the image key is missing", () => {
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job.status).toBe("failed");
    expect(created.job.label).toBe("Try-on unavailable");
    expect(created.job.providerCalled).toBe(false);
    expect(created.job.message).toMatch(/No provider was called/);
    expect(readStudioJob(created.job.id, visit, 9_000)?.status).toBe("failed");
  });

  it("keeps the selected fashion sample id and rejects a missing one", () => {
    process.env.ANIMODA_MOCK_GENERATION = "1";
    const created = createStudioJob(conceptRequest({ audience: "Kids" }), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.referenceDirectionId).toBe(sampleId);
    expect(done?.storedSamples).toBeNull();
    expect(createStudioJob(conceptRequest({ fashionSampleId: null }), 2_000).ok).toBe(false);
  });

  it("does not make a try-on composite", () => {
    const created = createStudioJob(tryOnRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job.status).toBe("failed");
    expect(created.job.label).toBe("Try-on unavailable");
    expect(created.job.providerCalled).toBe(false);
    expect(created.job.composite).toBeNull();
    expect(created.job.message).toMatch(/no composite/i);
    expect(created.job.message).toMatch(/photograph/i);
    expect(createStudioJob(tryOnRequest({ fashionSampleId: null }), 2_000).ok).toBe(false);

    process.env.ANIMODA_MOCK_GENERATION = "1";
    const mock = createStudioJob(tryOnRequest({ visitId: otherVisit }), 3_000);
    expect(mock.ok).toBe(true);
    if (!mock.ok) return;
    const done = readStudioJob(mock.job.id, otherVisit, 3_000 + mockQueuedMs + mockRunMs);
    expect(done?.status).toBe("mock_completed");
    expect(done?.composite).toBeNull();
  });

  it("ignores the retired concept and try-on keys", () => {
    process.env.FASHION_CONCEPT_API_KEY = `  ${conceptKey}  `;
    process.env.VIRTUAL_TRY_ON_API_KEY = "try-on-secret";
    const concept = createStudioJob(conceptRequest(), 1_000);
    expect(concept.ok).toBe(true);
    if (!concept.ok) return;
    expect(concept.job.status).toBe("failed");
    expect(concept.job.message).toMatch(/No provider was called/);
    expect(JSON.stringify(concept.job)).not.toContain(conceptKey);
    expect(JSON.stringify(concept.job)).not.toContain("try-on-secret");
  });

  it("rejects an unsupported image model and does not call a provider", async () => {
    process.env.OPENAI_API_KEY = imageKey;
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-1";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: "army-green-moth" })),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; message: string; providerCalled: boolean };
    expect(body.status).toBe("failed");
    expect(body.providerCalled).toBe(false);
    expect(body.message).toMatch(/No provider was called/);
    expect(ensureStoredAnimalSamples).not.toHaveBeenCalled();
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain(imageKey);
  });

  it("stops one job kind at the visit quota and leaves the other kind open", () => {
    process.env.ANIMODA_MOCK_GENERATION = "1";
    for (let index = 0; index < mockJobQuota; index += 1) {
      const job = createStudioJob(conceptRequest(), index);
      expect(job.ok).toBe(true);
    }
    const blocked = createStudioJob(conceptRequest(), 50);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.status).toBe(429);
    expect(blocked.quota).toEqual({ kind: "concept", used: mockJobQuota, limit: mockJobQuota, remaining: 0 });
    expect(createStudioJob(tryOnRequest(), 60).ok).toBe(true);
    expect(createStudioJob(conceptRequest({ visitId: otherVisit }), 70).ok).toBe(true);
  });

  it("hides a job from another visit and rejects a photograph", () => {
    process.env.ANIMODA_MOCK_GENERATION = "1";
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(readStudioJob(created.job.id, otherVisit, 5_000)).toBeNull();
    expect(readStudioJob("not-a-job", visit, 5_000)).toBeNull();

    const portrait = JSON.stringify({ ...conceptRequest(), photoDataUrl: "data:image/jpeg;base64,abc" });
    const parsed = parseStudioJobRequest(portrait);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.status).toBe(400);
    expect(parsed.error).toMatch(/photograph/);
    expect(parsed.error).not.toContain("base64");
  });

  it("does not generate an image when a fashion sample is confirmed", async () => {
    configureImageProvider();
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: "army-green-moth" })),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; providerCalled: boolean; message: string };
    expect(body.providerCalled).toBe(false);
    expect(body.status).toBe("failed");
    expect(body.message).toMatch(/No provider was called/);
    expect(confirmSelectedFashionSample).toHaveBeenCalledTimes(1);
    expect(ensureStoredAnimalSamples).not.toHaveBeenCalled();
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain(imageKey);
  });

  it("refuses to replace a fashion sample and does not call a provider", async () => {
    configureImageProvider();
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: "plains-zebra", replaceStored: true })),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/No image was requested/);
    expect(confirmSelectedFashionSample).not.toHaveBeenCalled();
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();
    expect(ensureStoredAnimalSamples).not.toHaveBeenCalled();
  });

  it("does not mark a personalized request as a completed generated image", () => {
    configureImageProvider();
    const ready = createStudioJob(conceptRequest({ animalSlug: "emerald-tree-boa" }), 2_000, {
      style: "youth_couture",
      imagePath: "animals/emerald-tree-boa/youth_couture/33333333-3333-4333-8333-333333333333.png",
    });
    expect(ready.ok).toBe(true);
    if (!ready.ok) return;
    expect(ready.job.providerCalled).toBe(false);
    expect(ready.job.status).toBe("failed");
    expect(ready.job.storedSamples).toEqual([
      {
        style: "youth_couture",
        imagePath: "animals/emerald-tree-boa/youth_couture/33333333-3333-4333-8333-333333333333.png",
      },
    ]);
    expect(
      applyPilotOutcome(ready.job.id, visit, { status: "completed", samples: [], providerCalled: true, message: "generated" }),
    ).toBeNull();
    expect(JSON.stringify(ready.job)).not.toContain(imageKey);
  });

  it("accepts a mock through the route and refuses another visit", async () => {
    process.env.ANIMODA_MOCK_GENERATION = "1";
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest()),
      }),
    );
    expect(response.status).toBe(202);
    const body = (await response.json()) as { id: string; status: string; referenceDirectionId: string; composite: null; mode: string };
    expect(body.referenceDirectionId).toBe(sampleId);
    expect(body.composite).toBeNull();
    expect(body.mode).toBe("mock");
    expect(["pending", "generating", "mock_completed"]).toContain(body.status);
    expect(ensureStoredAnimalSamples).not.toHaveBeenCalled();
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();

    const hidden = await GET(new Request(`http://localhost/api/studio/jobs/${body.id}?visitId=${otherVisit}`), {
      params: Promise.resolve({ id: body.id }),
    });
    expect(hidden.status).toBe(404);

    const portrait = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify({ ...tryOnRequest(), image: "data:image/png;base64,portrait" }),
      }),
    );
    expect(portrait.status).toBe(400);
    const portraitBody = (await portrait.json()) as { error: string };
    expect(portraitBody.error).toMatch(/photograph/);
    expect(JSON.stringify(portraitBody)).not.toContain("data:image");
  });
});
