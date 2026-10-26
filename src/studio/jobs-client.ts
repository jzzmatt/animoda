export const studioJobUnreachableMessage =
  "The studio job could not be reached. The catalogue directions are unchanged, and the selected design remains the reference.";

export type StudioJobKind = "concept" | "try-on";
export type StudioJobStatus = "queued" | "running" | "succeeded" | "failed";

export type StudioJobImage = {
  directionId: string;
  href: string;
};

export type StudioJobView = {
  id: string | null;
  kind: StudioJobKind | null;
  status: StudioJobStatus;
  mode: "openai" | "demo" | "unconfigured" | null;
  label: string;
  referenceDirectionId: string | null;
  directionIds: string[];
  images: StudioJobImage[];
  composite: string | null;
  message: string;
  quota: { kind: StudioJobKind; used: number; limit: number; remaining: number } | null;
};

export type StudioJobPollInput = {
  visitId: string;
  kind: StudioJobKind;
  animalSlug: string;
  audience: string;
  directionId: string | null;
  setting?: string | null;
  portraitDataUrl?: string | null;
  intervalMs?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  onUpdate?: (job: StudioJobView) => void;
};

const statuses = new Set<StudioJobStatus>(["queued", "running", "succeeded", "failed"]);

/** The catalogue selection wins. A job may echo another id; this visit does not adopt it. */
export function keptDirectionId(current: string | null, job: { referenceDirectionId: string | null } | null): string | null {
  return job?.referenceDirectionId === current ? current : current;
}

function failedView(input: StudioJobPollInput, message: string, quota: StudioJobView["quota"] = null): StudioJobView {
  return {
    id: null,
    kind: input.kind,
    status: "failed",
    mode: null,
    label: quota ? "Visit quota" : "Studio job",
    referenceDirectionId: input.directionId,
    directionIds: [],
    images: [],
    composite: null,
    message,
    quota,
  };
}

function readQuota(value: unknown): StudioJobView["quota"] {
  if (!value || typeof value !== "object") return null;
  const quota = value as Record<string, unknown>;
  if (quota.kind !== "concept" && quota.kind !== "try-on") return null;
  if (typeof quota.used !== "number" || typeof quota.limit !== "number" || typeof quota.remaining !== "number") return null;
  return { kind: quota.kind, used: quota.used, limit: quota.limit, remaining: quota.remaining };
}

function viewFromPayload(value: unknown, input: StudioJobPollInput): StudioJobView | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.status !== "string" || !statuses.has(record.status as StudioJobStatus)) return null;
  if (typeof record.message !== "string") return null;
  const directionIds = Array.isArray(record.directionIds)
    ? record.directionIds.filter((item): item is string => typeof item === "string")
    : [];
  return {
    id: typeof record.id === "string" ? record.id : null,
    kind: record.kind === "concept" || record.kind === "try-on" ? record.kind : input.kind,
    status: record.status as StudioJobStatus,
    mode: record.mode === "openai" || record.mode === "demo" || record.mode === "unconfigured" ? record.mode : null,
    label: typeof record.label === "string" ? record.label : "Studio job",
    referenceDirectionId: typeof record.referenceDirectionId === "string" ? record.referenceDirectionId : input.directionId,
    directionIds,
    images: readImages(record.images),
    composite: sameOriginImage(record.composite),
    message: record.message,
    quota: readQuota(record.quota),
  };
}

function sameOriginImage(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/api/studio/jobs/")) return null;
  if (value.includes("..") || value.includes("://") || value.includes("data:")) return null;
  return value;
}

function readImages(value: unknown): StudioJobImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const href = sameOriginImage(record.href);
    if (!href || typeof record.directionId !== "string") return [];
    return [{ directionId: record.directionId, href }];
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollStudioJob(input: StudioJobPollInput): Promise<StudioJobView> {
  const payload: Record<string, unknown> = {
    visitId: input.visitId,
    kind: input.kind,
    animalSlug: input.animalSlug,
    audience: input.audience,
    directionId: input.directionId,
    setting: input.setting ?? null,
  };
  if (input.kind === "try-on" && input.portraitDataUrl) payload.portrait = input.portraitDataUrl;
  const body = JSON.stringify(payload);
  if (input.kind !== "try-on" && body.includes("data:image")) {
    return failedView(input, "This browser did not send the photograph with a concept request. The selected design remains the reference.");
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const intervalMs = input.intervalMs ?? 200;
  const timeoutMs = input.timeoutMs ?? 8000;
  let response: Response;
  try {
    response = await fetchImpl("/api/studio/jobs", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return failedView(input, studioJobUnreachableMessage);
  }

  const created = await readJson(response);
  if (!response.ok) {
    const error =
      created && typeof created === "object" && typeof (created as { error?: unknown }).error === "string"
        ? (created as { error: string }).error
        : studioJobUnreachableMessage;
    const quota = created && typeof created === "object" ? readQuota((created as { quota?: unknown }).quota) : null;
    return failedView(input, error, quota);
  }

  let job = viewFromPayload(created, input);
  if (!job) return failedView(input, "The studio job response was not usable. The selected design remains the reference.");
  input.onUpdate?.(job);
  const started = Date.now();
  while ((job.status === "queued" || job.status === "running") && job.id) {
    if (Date.now() - started >= timeoutMs) break;
    await wait(intervalMs);
    let next: Response;
    try {
      next = await fetchImpl(`/api/studio/jobs/${encodeURIComponent(job.id)}?visitId=${encodeURIComponent(input.visitId)}`, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      return failedView(input, studioJobUnreachableMessage);
    }
    const bodyJson = await readJson(next);
    if (!next.ok) {
      const error =
        bodyJson && typeof bodyJson === "object" && typeof (bodyJson as { error?: unknown }).error === "string"
          ? (bodyJson as { error: string }).error
          : studioJobUnreachableMessage;
      return failedView(input, error);
    }
    const parsed = viewFromPayload(bodyJson, input);
    if (!parsed) return failedView(input, "The studio job response was not usable. The selected design remains the reference.");
    job = parsed;
    input.onUpdate?.(job);
  }
  if (job.status === "queued" || job.status === "running") {
    return {
      ...job,
      status: "failed",
      label: "Studio job",
      message: "The studio job did not finish in this page. The selected design remains the reference.",
    };
  }
  return job;
}
