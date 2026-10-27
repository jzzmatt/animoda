import { animalBySlug, directionSettings, type SampleDirection } from "@/content/catalogue";
import { pilotConfigurationMessage, type PilotEnsureResult, type PilotSampleFile } from "@/server/fashion-samples/pilot-job";
import { readImageModel, readOpenAiApiKey } from "@/server/fashion-samples/openai-image";
import { readSupabaseServerConfig } from "@/server/supabase/server";
import {
  audienceMatches,
  isVisitId,
  sampleDirections,
  studioAudiences,
  type StudioAudience,
} from "@/studio/session";

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
export type StudioJobLabel = "Labelled mock" | "Stored samples" | "Configuration error" | "Try-on unavailable";

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
  directionId: string | null;
  setting: string | null;
  replaceStored: boolean;
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
  "This route does not accept a photograph. The portrait stays in the browser, and the selected design remains the reference.";

const allowedKeys = new Set(["visitId", "kind", "animalSlug", "audience", "directionId", "setting", "replaceStored"]);

export function resetStudioJobsForTests() {
  jobs.clear();
  usage.clear();
  visitOrder.length = 0;
}

function mockGenerationRequested(env?: Record<string, string | undefined>): boolean {
  const raw = env ? env.ANIMODA_MOCK_GENERATION : process.env.ANIMODA_MOCK_GENERATION;
  return raw?.trim() === "1";
}

function catalogueConfigReason(env?: Record<string, string | undefined>): "openai" | "openai_model" | "supabase" | null {
  if (!readOpenAiApiKey(env)) return "openai";
  if (!readImageModel(env).ok) return "openai_model";
  if (!readSupabaseServerConfig(env)) return "supabase";
  return null;
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
  const directionId = readString(record.directionId);
  const setting = readString(record.setting);
  if (record.replaceStored !== undefined && typeof record.replaceStored !== "boolean") {
    return { ok: false, status: 400, error: "The studio job request was not valid JSON.", quota: null };
  }
  if (animalSlug === "bad" || audience === "bad" || directionId === "bad" || setting === "bad" || !animalSlug || !audience) {
    return { ok: false, status: 400, error: "The animal, audience, or selected design is not valid.", quota: null };
  }
  if (!studioAudiences.includes(audience as StudioAudience)) {
    return { ok: false, status: 400, error: "Choose women, men, girls, boys, or unisex.", quota: null };
  }
  return {
    ok: true,
    request: {
      visitId: record.visitId,
      kind: record.kind,
      animalSlug,
      audience: audience as StudioAudience,
      directionId,
      setting,
      replaceStored: record.replaceStored === true,
    },
  };
}

function resolveSetting(value: string | null): (typeof directionSettings)[number] | null {
  if (value === null) return "All Silhouettes";
  return directionSettings.includes(value as (typeof directionSettings)[number])
    ? (value as (typeof directionSettings)[number])
    : null;
}

function findDirection(animalSlug: string, audience: StudioAudience, directionId: string | null): SampleDirection | null | "missing" | "unknown-animal" {
  const animal = animalBySlug(animalSlug);
  if (!animal) return "unknown-animal";
  if (directionId === null) return null;
  const direction = animal.directions.find((item) => item.id === directionId);
  if (!direction || !audienceMatches(direction.audience, audience)) return "missing";
  return direction;
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
  "Labelled mock. ANIMODA_MOCK_GENERATION is set, so no provider was called and this job does not count as a stored catalogue image. The catalogue directions are unchanged, and the selected design remains the reference.";

const mockTryOnMessage =
  "Labelled mock. ANIMODA_MOCK_GENERATION is set, so no virtual try-on provider was called and no composite was made. Your photograph stayed in the browser, and the selected design remains the reference.";

const tryOnUnavailableMessage =
  "Try-on unavailable. Virtual try-on does not call OpenAI, no photograph was sent, and no composite was made. Catalogue fashion images are stored separately. The selected design remains the reference.";

function cataloguePendingMessage(animalSlug: string): string {
  const name = animalBySlug(animalSlug)?.commonName ?? "this animal";
  return `Stored samples. The three ${name} styles are being checked in Supabase. No image has been requested yet. The catalogue directions are unchanged, and the selected design remains the reference.`;
}

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

function planConcept(env: Record<string, string | undefined> | undefined, animalSlug: string): Pick<StoredJob, "status" | "mode" | "label" | "message"> {
  if (mockGenerationRequested(env)) {
    return { status: "pending", mode: "mock", label: "Labelled mock", message: mockConceptMessage };
  }
  const reason = catalogueConfigReason(env);
  if (reason) {
    return { status: "failed", mode: "unconfigured", label: "Configuration error", message: pilotConfigurationMessage(reason) };
  }
  return { status: "pending", mode: "catalogue", label: "Stored samples", message: cataloguePendingMessage(animalSlug) };
}

function planTryOn(env: Record<string, string | undefined> | undefined): Pick<StoredJob, "status" | "mode" | "label" | "message"> {
  if (mockGenerationRequested(env)) {
    return { status: "pending", mode: "mock", label: "Labelled mock", message: mockTryOnMessage };
  }
  return { status: "failed", mode: "unconfigured", label: "Try-on unavailable", message: tryOnUnavailableMessage };
}

export function createStudioJob(request: StudioJobRequest, now = Date.now()): StudioJobResult {
  if (!isVisitId(request.visitId)) {
    return { ok: false, status: 400, error: "The studio visit is missing.", quota: null };
  }
  const animal = animalBySlug(request.animalSlug);
  if (!animal || !studioAudiences.includes(request.audience)) {
    return { ok: false, status: 400, error: "The animal or audience is not in this catalogue.", quota: null };
  }
  const setting = resolveSetting(request.setting);
  if (!setting) {
    return { ok: false, status: 400, error: "That silhouette is not part of the studio.", quota: null };
  }
  const direction = findDirection(request.animalSlug, request.audience, request.directionId);
  if (direction === "unknown-animal" || direction === "missing") {
    return {
      ok: false,
      status: 400,
      error: "That design is not a catalogue direction for this animal and audience. The selected design is unchanged.",
      quota: null,
    };
  }
  if (request.kind === "try-on" && !direction) {
    return { ok: false, status: 400, error: "Select a design before requesting a try-on preview.", quota: null };
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

  const plan = request.kind === "concept" ? planConcept(undefined, animal.slug) : planTryOn(undefined);
  const catalogueIds = sampleDirections(animal, request.audience, setting).map((item) => item.id);
  const referenceDirectionId = direction?.id ?? null;
  const directionIds = request.kind === "try-on" && referenceDirectionId ? [referenceDirectionId] : catalogueIds;
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
    directionIds,
    providerCalled: false,
    storedSamples: null,
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
          label: "Stored samples",
          providerCalled: outcome.providerCalled,
          storedSamples: outcome.samples.map((sample) => ({ style: sample.style, imagePath: sample.imagePath })),
          message: outcome.message,
          updatedAt: now,
        }
      : {
          ...current,
          status: "failed",
          label: outcome.message.startsWith("Configuration error") ? "Configuration error" : "Stored samples",
          providerCalled: false,
          storedSamples: null,
          message: outcome.message,
          updatedAt: now,
        };
  jobs.set(id, next);
  return toPublic(next);
}
