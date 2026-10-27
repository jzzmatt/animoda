import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../app/api/studio/jobs/[id]/route";
import { POST } from "../../app/api/studio/jobs/route";
import { EMERALD_TREE_BOA_SLUG } from "@/content/persisted-samples";
import { ensureEmeraldTreeBoaPilot } from "@/server/fashion-samples/pilot-job";
import { runCatalogueFashionSamples } from "@/server/fashion-samples/pilot-run";
import { sampleDirections } from "@/studio/session";
import { animalBySlug } from "@/content/catalogue";
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
  return { ...actual, ensureEmeraldTreeBoaPilot: vi.fn(actual.ensureEmeraldTreeBoaPilot) };
});

vi.mock("@/server/fashion-samples/pilot-run", () => ({
  runCatalogueFashionSamples: vi.fn(async () => []),
}));

const isolatedEnv = [
  "FASHION_CONCEPT_API_KEY",
  "VIRTUAL_TRY_ON_API_KEY",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const visit = "11111111-1111-4111-8111-111111111111";
const otherVisit = "22222222-2222-4222-8222-222222222222";
const conceptKey = "super-secret-concept-key";
const tryOnKey = "super-secret-try-on-key";

function conceptRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return {
    visitId: visit,
    kind: "concept",
    animalSlug: "plains-zebra",
    audience: "Women",
    directionId: "zebra-gown",
    setting: "All Silhouettes",
    ...overrides,
  };
}

function tryOnRequest(overrides: Partial<StudioJobRequest> = {}): StudioJobRequest {
  return { ...conceptRequest(), kind: "try-on", ...overrides };
}

describe("studio jobs", () => {
  const savedEnv: Partial<Record<(typeof isolatedEnv)[number], string | undefined>> = {};

  beforeEach(() => {
    resetStudioJobsForTests();
    vi.mocked(ensureEmeraldTreeBoaPilot).mockReset();
    vi.mocked(runCatalogueFashionSamples).mockReset();
    vi.mocked(ensureEmeraldTreeBoaPilot).mockResolvedValue({
      status: "completed",
      samples: [],
      providerCalled: false,
      message: "Stored pilot. No new image was requested.",
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

  it("runs a labelled mock concept job and keeps the selected design", () => {
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job).toMatchObject({
      status: "pending",
      mode: "mock",
      label: "Labelled mock",
      referenceDirectionId: "zebra-gown",
      composite: null,
      providerCalled: false,
      referencePreserved: true,
    });
    expect(created.job.message).toMatch(/Labelled mock/);
    expect(created.job.message).toMatch(/selected design remains the reference/);
    expect(JSON.stringify(created.job)).not.toMatch(/99\.4|98%|biometric|guaranteed/i);

    const running = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs);
    expect(running?.status).toBe("generating");
    expect(running?.referenceDirectionId).toBe("zebra-gown");

    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    const zebra = animalBySlug("plains-zebra");
    if (!zebra || !done) throw new Error("fixture missing");
    expect(done.status).toBe("mock_completed");
    expect(done.providerCalled).toBe(false);
    expect(done.storedSamples).toBeNull();
    expect(done.message).toMatch(/No provider was called/);
    expect(done.message).toMatch(/Emerald tree boa/);
    expect(done.directionIds).toEqual(sampleDirections(zebra, "Women", "All Silhouettes").map((item) => item.id));
    expect(done.directionIds).toEqual(["zebra-gown", "zebra-trench"]);
    expect(done.referenceDirectionId).toBe("zebra-gown");
    expect(done.composite).toBeNull();
    expect(done.quota).toEqual({ kind: "concept", used: 1, limit: mockJobQuota, remaining: mockJobQuota - 1 });
  });

  it("keeps a children's concept on the children's direction", () => {
    const created = createStudioJob(conceptRequest({ audience: "Girls", directionId: "zebra-kids" }), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.directionIds).toEqual(["zebra-kids"]);
    expect(done?.referenceDirectionId).toBe("zebra-kids");
    expect(createStudioJob(conceptRequest({ audience: "Girls", directionId: "zebra-gown" }), 2_000).ok).toBe(false);
  });

  it("returns a labelled mock try-on with no composite", () => {
    const created = createStudioJob(tryOnRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.status).toBe("mock_completed");
    expect(done?.directionIds).toEqual(["zebra-gown"]);
    expect(done?.referenceDirectionId).toBe("zebra-gown");
    expect(done?.composite).toBeNull();
    expect(done?.providerCalled).toBe(false);
    expect(done?.message).toMatch(/no composite/i);
    expect(done?.message).toMatch(/browser/);
    expect(createStudioJob(tryOnRequest({ directionId: null }), 2_000).ok).toBe(false);
  });

  it("fails a keyed job without sending the key or calling a provider", () => {
    process.env.FASHION_CONCEPT_API_KEY = `  ${conceptKey}  `;
    process.env.VIRTUAL_TRY_ON_API_KEY = "   ";
    const concept = createStudioJob(conceptRequest(), 1_000);
    expect(concept.ok).toBe(true);
    if (!concept.ok) return;
    expect(concept.job.status).toBe("failed");
    expect(concept.job.mode).toBe("unconfigured");
    expect(concept.job.label).toBe("Provider not chosen");
    expect(concept.job.providerCalled).toBe(false);
    expect(concept.job.referenceDirectionId).toBe("zebra-gown");
    expect(concept.job.message).toMatch(/not the image provider/);
    expect(concept.job.message).toMatch(/No request was sent/);
    expect(JSON.stringify(concept.job)).not.toContain(conceptKey);
    expect(readStudioJob(concept.job.id, visit, 9_000)?.status).toBe("failed");

    delete process.env.FASHION_CONCEPT_API_KEY;
    process.env.VIRTUAL_TRY_ON_API_KEY = tryOnKey;
    const tryOn = createStudioJob(tryOnRequest({ visitId: otherVisit }), 1_000);
    expect(tryOn.ok).toBe(true);
    if (!tryOn.ok) return;
    expect(tryOn.job.mode).toBe("unconfigured");
    expect(JSON.stringify(tryOn.job)).not.toContain(tryOnKey);
    const stillMock = createStudioJob(conceptRequest({ visitId: otherVisit }), 1_000);
    expect(stillMock.ok && stillMock.job.mode).toBe("mock");
    expect(JSON.stringify(stillMock)).not.toContain(tryOnKey);
  });

  it("stops one job kind at the visit quota and leaves the other kind open", () => {
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

  it("hides a job from another visit and rejects a photograph", () => {
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

  it("accepts a mock through the route and refuses another visit", async () => {
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest()),
      }),
    );
    expect(response.status).toBe(202);
    const body = (await response.json()) as { id: string; status: string; referenceDirectionId: string; composite: null; mode: string };
    expect(body.referenceDirectionId).toBe("zebra-gown");
    expect(body.composite).toBeNull();
    expect(body.mode).toBe("mock");
    expect(["pending", "generating", "mock_completed"]).toContain(body.status);
    expect(ensureEmeraldTreeBoaPilot).not.toHaveBeenCalled();
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
    expect(JSON.stringify(portraitBody)).not.toContain("base64");
  });

  it("keeps army green moth on a mock even when the image key is set", async () => {
    const imageKey = "sk-test-secret-value";
    process.env.OPENAI_API_KEY = imageKey;
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
    const created = createStudioJob(conceptRequest({ animalSlug: "army-green-moth", directionId: null }), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    expect(done?.status).toBe("mock_completed");
    expect(done?.mode).toBe("mock");
    expect(done?.providerCalled).toBe(false);
    expect(done?.message).toMatch(/No provider was called/);
    expect(done?.message).toMatch(/Emerald tree boa/);
    expect(JSON.stringify(done)).not.toContain(imageKey);

    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: "army-green-moth", directionId: null, visitId: otherVisit })),
      }),
    );
    expect(response.status).toBe(202);
    expect(ensureEmeraldTreeBoaPilot).not.toHaveBeenCalled();
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain(imageKey);
  });

  it("does not complete the boa pilot until stored files are confirmed", () => {
    const created = createStudioJob(conceptRequest({ animalSlug: EMERALD_TREE_BOA_SLUG, directionId: null }), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job.status).toBe("failed");
    expect(created.job.label).toBe("Configuration error");
    expect(created.job.providerCalled).toBe(false);
    expect(created.job.message).toMatch(/OPENAI_API_KEY/);
    expect(readStudioJob(created.job.id, visit, 9_000)?.status).toBe("failed");

    process.env.OPENAI_API_KEY = "sk-test-secret-value";
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
    const ready = createStudioJob(conceptRequest({ animalSlug: EMERALD_TREE_BOA_SLUG, directionId: null, visitId: otherVisit }), 2_000);
    expect(ready.ok).toBe(true);
    if (!ready.ok) return;
    expect(ready.job).toMatchObject({ status: "pending", mode: "pilot", label: "Stored pilot", providerCalled: false, storedSamples: null });
    expect(ready.job.message).toMatch(/No image has been requested yet/);
    expect(readStudioJob(ready.job.id, otherVisit, 9_000)?.status).toBe("pending");

    const samples = [
      { style: "formal" as const, imagePath: "animals/emerald-tree-boa/formal/11111111-1111-4111-8111-111111111111.png", imageUrl: "https://example.supabase.co/formal.png" },
      { style: "casual_street" as const, imagePath: "animals/emerald-tree-boa/casual_street/22222222-2222-4222-8222-222222222222.png", imageUrl: "https://example.supabase.co/casual.png" },
      { style: "youth_couture" as const, imagePath: "animals/emerald-tree-boa/youth_couture/33333333-3333-4333-8333-333333333333.png", imageUrl: "https://example.supabase.co/youth.png" },
    ];
    const applied = applyPilotOutcome(ready.job.id, otherVisit, {
      status: "completed",
      samples,
      providerCalled: false,
      message: "Stored pilot. No new image was requested.",
    });
    expect(applied?.status).toBe("completed");
    expect(applied?.providerCalled).toBe(false);
    expect(applied?.storedSamples).toEqual(samples.map(({ style, imagePath }) => ({ style, imagePath })));
    expect(JSON.stringify(applied)).not.toContain("sk-test-secret-value");
  });

  it("confirms a stored boa pilot through the route without requesting a new image", async () => {
    process.env.OPENAI_API_KEY = "sk-test-secret-value";
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: EMERALD_TREE_BOA_SLUG, directionId: null })),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; providerCalled: boolean; mode: string };
    expect(body).toMatchObject({ status: "completed", mode: "pilot", providerCalled: false });
    expect(ensureEmeraldTreeBoaPilot).toHaveBeenCalledTimes(1);
    expect(runCatalogueFashionSamples).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("sk-test-secret-value");
  });

  it("passes only the boa slug when a missing pilot style must be generated", async () => {
    process.env.OPENAI_API_KEY = "sk-test-secret-value";
    process.env.OPENAI_IMAGE_MODEL = "gpt-image-test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "server-secret-test-value";
    vi.mocked(ensureEmeraldTreeBoaPilot).mockImplementation(async (env, deps) => {
      await deps?.generateMissing?.(env);
      return { status: "completed", samples: [], providerCalled: true, message: "Stored pilot. OpenAI returned the missing PNG files." };
    });
    const response = await POST(
      new Request("http://localhost/api/studio/jobs", {
        method: "POST",
        body: JSON.stringify(conceptRequest({ animalSlug: EMERALD_TREE_BOA_SLUG, directionId: null })),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; providerCalled: boolean };
    expect(body).toMatchObject({ status: "completed", providerCalled: true });
    expect(runCatalogueFashionSamples).toHaveBeenCalledTimes(1);
    expect(vi.mocked(runCatalogueFashionSamples).mock.calls[0]?.[1]).toEqual([EMERALD_TREE_BOA_SLUG]);
  });
});
