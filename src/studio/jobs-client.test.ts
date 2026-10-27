import { describe, expect, it } from "vitest";
import { keptDirectionId, pollStudioJob, studioJobUnreachableMessage, type StudioJobView } from "./jobs-client";

const visit = "11111111-1111-4111-8111-111111111111";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("studio job client", () => {
  it("keeps the selected design when a job echoes a different id", () => {
    expect(keptDirectionId("zebra-gown", { referenceDirectionId: "zebra-tuxedo" })).toBe("zebra-gown");
    expect(keptDirectionId(null, { referenceDirectionId: "zebra-gown" })).toBeNull();
    expect(studioJobUnreachableMessage).not.toMatch(/99\.4|98%|biometric|guaranteed/i);
  });

  it("posts the visit and the selected design without a photograph", async () => {
    const posted: unknown[] = [];
    const queued = {
      id: "job_11111111-1111-4111-8111-111111111111",
      kind: "try-on",
      status: "pending",
      mode: "mock",
      label: "Labelled mock",
      referenceDirectionId: "zebra-tuxedo",
      directionIds: ["zebra-gown"],
      composite: "https://example.invalid/composite.png",
      message: "Labelled mock. No composite was made.",
      quota: { kind: "try-on", used: 1, limit: 8, remaining: 7 },
    };
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        posted.push(JSON.parse(String(init.body)));
        return json(queued, 202);
      }
      return json({ ...queued, status: "mock_completed", composite: "https://example.invalid/composite.png" });
    }) as typeof fetch;

    const updates: StudioJobView[] = [];
    const result = await pollStudioJob({
      visitId: visit,
      kind: "try-on",
      animalSlug: "plains-zebra",
      audience: "Women",
      directionId: "zebra-gown",
      intervalMs: 0,
      timeoutMs: 1000,
      fetchImpl,
      onUpdate: (job) => updates.push(job),
    });

    expect(posted).toEqual([
      {
        visitId: visit,
        kind: "try-on",
        animalSlug: "plains-zebra",
        audience: "Women",
        directionId: "zebra-gown",
        setting: null,
      },
    ]);
    expect(JSON.stringify(posted)).not.toContain("data:image");
    expect(result.composite).toBeNull();
    expect(result.status).toBe("mock_completed");
    expect(result.directionIds).toEqual(["zebra-gown"]);
    expect(keptDirectionId("zebra-gown", result)).toBe("zebra-gown");
    expect(updates.map((job) => job.status)).toEqual(["pending", "mock_completed"]);
    expect(result.quota?.remaining).toBe(7);
  });

  it("reports a visit quota without inventing a composite", async () => {
    const fetchImpl = (async () =>
      json(
        {
          error: "This visit has used its 8 labelled try-on jobs. The selected design is unchanged.",
          quota: { kind: "try-on", used: 8, limit: 8, remaining: 0 },
        },
        429,
      )) as typeof fetch;
    const result = await pollStudioJob({
      visitId: visit,
      kind: "try-on",
      animalSlug: "plains-zebra",
      audience: "Women",
      directionId: "zebra-gown",
      fetchImpl,
    });
    expect(result.status).toBe("failed");
    expect(result.label).toBe("Visit quota");
    expect(result.composite).toBeNull();
    expect(result.referenceDirectionId).toBe("zebra-gown");
    expect(result.quota?.remaining).toBe(0);
  });
});
