import { animalBySlug } from "@/content/catalogue";
import type { FashionSampleStyleId } from "@/content/fashion-samples";
import type { PilotEnsureResult, PilotSampleFile } from "@/server/fashion-samples/pilot-job";
import { isVisitId, studioAudiences, type StudioAudience } from "@/studio/session";

export const mockJobQuota = 8;
export const mockQueuedMs = 250;
export const mockRunMs = 500;
const maxBodyChars = 2048;
const maxJobs = 500;
const maxVisits = 2000;
const jobIdPattern = /^job_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const studioJobKinds = ["concept", "try-on"] as const;
export type StudioJobKind = (typeof studioJobKinds)[number];
export type StudioJobStatus = "pending" | "generating" | "completed" | "mock_completed" | "failed";
export type StudioJobMode = "mock" | "catalogue" | "unconfigured";
export type StudioJobLabel = "Labelled mock" | "Try-on unavailable";

export type StoredPilotSample = Pick<PilotSampleFile, "style" | "imagePath">;

export type StudioQuota = {
  kind: StudioJobKind;
  used: number;
  limit: number;
  remaining: number;
};

export type PublicStudioJob = {
  id: string;
  kind: StudioJobKind;
  status: StudioJobStatus;
  mode: StudioJobMode;
  label: StudioJobLabel;
  animalSlug: string;
  audience: StudioAudience;
  referenceDirectionId: string | null;
  directionIds: string[];
  composite: null;
  providerCalled: boolean;
  storedSamples: StoredPilotSample[] | null;
  referencePreserved: true;
  message: string;
  createdAt: string;
  updatedAt: string;
  quota: StudioQuota;
};

export type StudioJobRequest = {
  visitId: string;
  kind: StudioJobKind;
  animalSlug: string;
  audience: StudioAudience;
  fashionSampleId: string | null;
  replaceStored: boolean;
};

export type VerifiedFashionSampleRef = {
  style: FashionSampleStyleId;
  imagePath: string;
};

export type StudioJobFailure = {
  ok: false;
  status: number;
  error: string;
  quota: StudioQuota | null;
};

export type StudioJobResult = { ok: true; job: PublicStudioJob } | StudioJobFailure;

type StoredJob = {
  id: string;
  visitId: string;
  kind: StudioJobKind;
  status: StudioJobStatus;
  mode: StudioJobMode;
  label: PublicStudioJob["label"];
  animalSlug: string;
  audience: StudioAudience;
  referenceDirectionId: string | null;
  directionIds: string[];
  providerCalled: boolean;
  storedSamples: StoredPilotSample[] | null;
  message: string;
  createdAt: number;
  updatedAt: number;
  quota: StudioQuota;
};

const jobs = new Map<string, StoredJob>();
const usage = new Map<string, { concept: number; "try-on": number }>();
const visitOrder: string[] = [];

const portraitError =
  "This route does not accept a photograph. The portrait stays in the browser, and the selected Fashion Sample remains the reference.";

const sampleIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowedKeys = new Set(["visitId", "kind", "animalSlug", "audience", "fashionSampleId", "replaceStored"]);

export function resetStudioJobsForTests() {
  jobs.clear();
  usage.clear();
  visitOrder.length = 0;
}

function mockGenerationRequested(env?: Record<string, string | undefined>): boolean {
  const raw = env ? env.ANIMODA_MOCK_GENERATION : process.env.ANIMODA_MOCK_GENERATION;
  return raw?.trim() === "1";
}

function readString(value: unknown): string | null | "bad" {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return "bad";
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return "bad";
  return trimmed;
}

export function parseStudioJobRequest(raw: string): { ok: true; request: StudioJobRequest } | StudioJobFailure {
  if (raw.length > maxBodyChars || raw.includes("data:image") || raw.includes("data:application")) {
    return { ok: false, status: 400, error: portraitError, quota: null };
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: "The studio job request was not valid JSON.", quota: null };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, status: 400, error: "The studio job request must be an object.", quota: null };
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, status: 400, error: portraitError, quota: null };
    }
  }
  if (typeof record.visitId !== "string" || !isVisitId(record.visitId)) {
    return { ok: false, status: 400, error: "The studio visit is missing.", quota: null };
  }
  if (record.kind !== "concept" && record.kind !== "try-on") {
    return { ok: false, status: 400, error: "The studio job kind must be concept or try-on.", quota: null };
  }
  const animalSlug = readString(record.animalSlug);
  const audience = readString(record.audience);
  const fashionSampleId = readString(record.fashionSampleId);
  if (record.replaceStored !== undefined && typeof record.replaceStored !== "boolean") {
    return { ok: false, status: 400, error: "The studio job request was not valid JSON.", quota: null };
  }
  if (animalSlug === "bad" || audience === "bad" || fashionSampleId === "bad" || !animalSlug || !audience) {
    return { ok: false, status: 400, error: "The animal, audience, or Fashion Sample is not valid.", quota: null };
  }
  if (!studioAudiences.includes(audience as StudioAudience)) {
    return { ok: false, status: 400, error: "Choose Men, Women, or Kids.", quota: null };
  }
  if (!fashionSampleId || !sampleIdPattern.test(fashionSampleId)) {
    return { ok: false, status: 400, error: "Choose an available Fashion Sample before continuing.", quota: null };
  }
  return {
    ok: true,
    request: {
      visitId: record.visitId,
      kind: record.kind,
      animalSlug,
      audience: audience as StudioAudience,
      fashionSampleId,
      replaceStored: record.replaceStored === true,
    },
  };
}

function quotaSnapshot(visitId: string, kind: StudioJobKind, used: number): StudioQuota {
  return { kind, used, limit: mockJobQuota, remaining: Math.max(0, mockJobQuota - used) };
}

function usedCount(visitId: string, kind: StudioJobKind): number {
  return usage.get(visitId)?.[kind] ?? 0;
}

function rememberVisit(visitId: string) {
  if (!visitOrder.includes(visitId)) visitOrder.push(visitId);
  while (visitOrder.length > maxVisits) {
    const oldest = visitOrder.shift();
    if (!oldest) break;
    usage.delete(oldest);
    for (const [id, job] of jobs) {
      if (job.visitId === oldest) jobs.delete(id);
    }
  }
}

function rememberJob(job: StoredJob) {
  jobs.set(job.id, job);
  while (jobs.size > maxJobs) {
    const oldest = jobs.keys().next().value;
    if (!oldest) break;
    jobs.delete(oldest);
  }
}

const mockConceptMessage =
  "Labelled mock. ANIMODA_MOCK_GENERATION is set, so no provider was called and this job does not count as a real Fashion Sample. The selected Fashion Sample remains the reference.";

const mockTryOnMessage =
  "Labelled mock. ANIMODA_MOCK_GENERATION is set, so no provider was called and no composite was made. Your photograph stayed in the browser, and the selected Fashion Sample remains the reference.";

const tryOnUnavailableMessage =
  "Personalized fashion was not generated. No provider was called, the photograph was not uploaded, and no composite was made. The selected Fashion Sample remains the reference.";

function quotaMessage(kind: StudioJobKind): string {
  const name = kind === "concept" ? "concept" : "try-on";
  return `This visit has used its ${mockJobQuota} labelled ${name} jobs. The limit is held in memory for this server process and is not an account quota. The selected design is unchanged.`;
}

function toPublic(job: StoredJob): PublicStudioJob {
  return {
    id: job.id,
    kind: job.kind,
    status: job.status,
    mode: job.mode,
    label: job.label,
    animalSlug: job.animalSlug,
    audience: job.audience,
    referenceDirectionId: job.referenceDirectionId,
    directionIds: [...job.directionIds],
    composite: null,
    providerCalled: job.providerCalled,
    storedSamples: job.storedSamples ? job.storedSamples.map((sample) => ({ ...sample })) : null,
    referencePreserved: true,
    message: job.message,
    createdAt: new Date(job.createdAt).toISOString(),
    updatedAt: new Date(job.updatedAt).toISOString(),
    quota: { ...job.quota },
  };
}

function settle(job: StoredJob, now: number): StoredJob {
  if (job.status === "completed" || job.status === "mock_completed" || job.status === "failed" || job.mode !== "mock") return job;
  const age = now - job.createdAt;
  if (age >= mockQueuedMs + mockRunMs) {
    return { ...job, status: "mock_completed", updatedAt: now };
  }
  if (age >= mockQueuedMs && job.status === "pending") {
    return { ...job, status: "generating", updatedAt: now };
  }
  return job;
}

function planConcept(env: Record<string, string | undefined> | undefined): Pick<StoredJob, "status" | "mode" | "label" | "message"> {
  if (mockGenerationRequested(env)) {
    return { status: "pending", mode: "mock", label: "Labelled mock", message: mockConceptMessage };
  }
  return { status: "failed", mode: "unconfigured", label: "Try-on unavailable", message: tryOnUnavailableMessage };
}

function planTryOn(env: Record<string, string | undefined> | undefined): Pick<StoredJob, "status" | "mode" | "label" | "message"> {
  if (mockGenerationRequested(env)) {
    return { status: "pending", mode: "mock", label: "Labelled mock", message: mockTryOnMessage };
  }
  return { status: "failed", mode: "unconfigured", label: "Try-on unavailable", message: tryOnUnavailableMessage };
}

export function createStudioJob(
  request: StudioJobRequest,
  now = Date.now(),
  verified: VerifiedFashionSampleRef | null = null,
): StudioJobResult {
  if (!isVisitId(request.visitId)) {
    return { ok: false, status: 400, error: "The studio visit is missing.", quota: null };
  }
  if (request.replaceStored) {
    return {
      ok: false,
      status: 400,
      error: "Replacing a Fashion Sample is not part of this step. No image was requested.",
      quota: null,
    };
  }
  const animal = animalBySlug(request.animalSlug);
  if (!animal || !studioAudiences.includes(request.audience)) {
    return { ok: false, status: 400, error: "The animal or audience is not in this catalogue.", quota: null };
  }
  if (!request.fashionSampleId || !sampleIdPattern.test(request.fashionSampleId)) {
    return { ok: false, status: 400, error: "Choose an available Fashion Sample before continuing.", quota: null };
  }

  rememberVisit(request.visitId);
  const used = usedCount(request.visitId, request.kind);
  if (used >= mockJobQuota) {
    return {
      ok: false,
      status: 429,
      error: quotaMessage(request.kind),
      quota: quotaSnapshot(request.visitId, request.kind, used),
    };
  }

  const nextUsed = used + 1;
  const row = usage.get(request.visitId) ?? { concept: 0, "try-on": 0 };
  row[request.kind] = nextUsed;
  usage.set(request.visitId, row);

  const plan = request.kind === "concept" ? planConcept(undefined) : planTryOn(undefined);
  const referenceDirectionId = request.fashionSampleId;
  const job: StoredJob = {
    id: `job_${crypto.randomUUID()}`,
    visitId: request.visitId,
    kind: request.kind,
    status: plan.status,
    mode: plan.mode,
    label: plan.label,
    animalSlug: animal.slug,
    audience: request.audience,
    referenceDirectionId,
    directionIds: [],
    providerCalled: false,
    storedSamples: plan.mode === "mock" || !verified ? null : [{ style: verified.style, imagePath: verified.imagePath }],
    message: plan.message,
    createdAt: now,
    updatedAt: now,
    quota: quotaSnapshot(request.visitId, request.kind, nextUsed),
  };
  rememberJob(job);
  return { ok: true, job: toPublic(job) };
}

export function readStudioJob(id: string, visitId: string, now = Date.now()): PublicStudioJob | null {
  if (!jobIdPattern.test(id) || !isVisitId(visitId)) return null;
  const current = jobs.get(id);
  if (!current || current.visitId !== visitId) return null;
  const next = settle(current, now);
  if (next !== current) jobs.set(id, next);
  return toPublic(next);
}

/** Records a pilot result. A completed status requires samples that were already read back. */
export function applyPilotOutcome(id: string, visitId: string, outcome: PilotEnsureResult, now = Date.now()): PublicStudioJob | null {
  if (!jobIdPattern.test(id) || !isVisitId(visitId)) return null;
  const current = jobs.get(id);
  if (!current || current.visitId !== visitId || current.mode !== "catalogue" || !animalBySlug(current.animalSlug)) return null;
  const next: StoredJob =
    outcome.status === "completed"
      ? {
          ...current,
          status: "completed",
          label: "Try-on unavailable",
          providerCalled: outcome.providerCalled,
          storedSamples: outcome.samples.map((sample) => ({ style: sample.style, imagePath: sample.imagePath })),
          message: outcome.message,
          updatedAt: now,
        }
      : {
          ...current,
          status: "failed",
          label: "Try-on unavailable",
          providerCalled: false,
          storedSamples: null,
          message: outcome.message,
          updatedAt: now,
        };
  jobs.set(id, next);
  return toPublic(next);
}
