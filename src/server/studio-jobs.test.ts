import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "../../app/api/studio/jobs/[id]/route";
import { POST } from "../../app/api/studio/jobs/route";
import { sampleDirections } from "@/studio/session";
import { animalBySlug } from "@/content/catalogue";
import {
  createStudioJob,
  mockJobQuota,
  mockQueuedMs,
  mockRunMs,
  parseStudioJobRequest,
  readStudioJob,
  resetStudioJobsForTests,
  type StudioJobRequest,
} from "./studio-jobs";

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
  beforeEach(() => {
    resetStudioJobsForTests();
    delete process.env.FASHION_CONCEPT_API_KEY;
    delete process.env.VIRTUAL_TRY_ON_API_KEY;
  });

  afterEach(() => {
    delete process.env.FASHION_CONCEPT_API_KEY;
    delete process.env.VIRTUAL_TRY_ON_API_KEY;
  });

  it("runs a labelled mock concept job and keeps the selected design", () => {
    const created = createStudioJob(conceptRequest(), 1_000);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.job).toMatchObject({
      status: "queued",
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
    expect(running?.status).toBe("running");
    expect(running?.referenceDirectionId).toBe("zebra-gown");

    const done = readStudioJob(created.job.id, visit, 1_000 + mockQueuedMs + mockRunMs);
    const zebra = animalBySlug("plains-zebra");
    if (!zebra || !done) throw new Error("fixture missing");
    expect(done.status).toBe("succeeded");
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
    expect(done?.status).toBe("succeeded");
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
    expect(concept.job.mode).toBe("key-without-provider");
    expect(concept.job.label).toBe("Provider not chosen");
    expect(concept.job.providerCalled).toBe(false);
    expect(concept.job.referenceDirectionId).toBe("zebra-gown");
    expect(concept.job.message).toMatch(/no concept provider/);
    expect(concept.job.message).toMatch(/No request was sent/);
    expect(JSON.stringify(concept.job)).not.toContain(conceptKey);
    expect(readStudioJob(concept.job.id, visit, 9_000)?.status).toBe("failed");

    delete process.env.FASHION_CONCEPT_API_KEY;
    process.env.VIRTUAL_TRY_ON_API_KEY = tryOnKey;
    const tryOn = createStudioJob(tryOnRequest({ visitId: otherVisit }), 1_000);
    expect(tryOn.ok).toBe(true);
    if (!tryOn.ok) return;
    expect(tryOn.job.mode).toBe("key-without-provider");
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
    expect(["queued", "running", "succeeded"]).toContain(body.status);

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
});
