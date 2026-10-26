import { readFile } from "node:fs/promises";
import path from "node:path";
import { animalBySlug, directionSettings, type SampleDirection } from "@/content/catalogue";
import {
  audienceMatches,
  isVisitId,
  sampleDirections,
  studioAudiences,
  type StudioAudience,
} from "@/studio/session";
import {
  createOpenAiFashionProvider,
  defaultOpenAiImageModel,
  FashionImageError,
  wearerFor,
  type FashionImageProvider,
  type GeneratedImage,
  type ImageReference,
} from "./fashion-image-provider";
import { decodePortraitDataUrl, type DecodedPortrait, type PortraitMediaType } from "./portrait-input";

export const mockJobQuota = 8;
export const mockQueuedMs = 250;
export const mockRunMs = 500;
const maxConceptBodyChars = 2048;
const maxTryOnBodyChars = 9_000_000;
const maxJobs = 500;
const maxVisits = 2000;
const maxConceptsPerJob = 2;
const jobIdPattern = /^job_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const studioJobKinds = ["concept", "try-on"] as const;
export type StudioJobKind = (typeof studioJobKinds)[number];
export type StudioJobStatus = "queued" | "running" | "succeeded" | "failed";
export type StudioJobMode = "openai" | "demo" | "unconfigured";

export type StudioQuota = {
  kind: StudioJobKind;
  used: number;
  limit: number;
  remaining: number;
};

export type StudioJobImage = {
  directionId: string;
  href: string;
  mediaType: PortraitMediaType;
};

export type PublicStudioJob = {
  id: string;
  kind: StudioJobKind;
  status: StudioJobStatus;
  mode: StudioJobMode;
  label: "OpenAI" | "Labelled demo" | "Configuration";
  animalSlug: string;
  audience: StudioAudience;
  referenceDirectionId: string | null;
  directionIds: string[];
  images: StudioJobImage[];
  composite: string | null;
  providerCalled: boolean;
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
  portrait: DecodedPortrait | null;
};

export type StudioJobFailure = {
  ok: false;
  status: number;
  error: string;
  quota: StudioQuota | null;
};

export type StudioJobResult = { ok: true; job: PublicStudioJob } | StudioJobFailure;

type StoredImage = {
  directionId: string;
  mediaType: PortraitMediaType;
  bytes: Buffer;
};

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
  images: StoredImage[];
  providerCalled: boolean;
  message: string;
  createdAt: number;
  updatedAt: number;
  quota: StudioQuota;
};

const jobs = new Map<string, StoredJob>();
const usage = new Map<string, { concept: number; "try-on": number }>();
const visitOrder: string[] = [];
const conceptAssets = new Map<string, ImageReference>();
const inflight = new Set<Promise<void>>();
let providerOverride: FashionImageProvider | undefined;

const allowedKeys = new Set(["visitId", "kind", "animalSlug", "audience", "directionId", "setting", "portrait"]);

const configurationMessage =
  "OpenAI is not configured on this server. Set OPENAI_API_KEY. No image request was sent, and the selected design is unchanged.";

export function resetStudioJobsForTests() {
  jobs.clear();
  usage.clear();
  visitOrder.length = 0;
  conceptAssets.clear();
  inflight.clear();
  providerOverride = undefined;
}

export function setStudioImageProviderForTests(provider: FashionImageProvider) {
  providerOverride = provider;
}

export function flushStudioJobs(): Promise<void> {
  return Promise.all([...inflight]).then(() => undefined);
}

function readString(value: unknown): string | null | "bad" {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return "bad";
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return "bad";
  return trimmed;
}

export function parseStudioJobRequest(raw: string): { ok: true; request: StudioJobRequest } | StudioJobFailure {
  if (raw.length > maxTryOnBodyChars) {
    return { ok: false, status: 400, error: "The studio job request is too large.", quota: null };
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
      return {
        ok: false,
        status: 400,
        error: "This route does not accept that field. The portrait stays out of a concept request, and the selected design remains the reference.",
        quota: null,
      };
    }
  }
  if (record.kind !== "try-on" && raw.length > maxConceptBodyChars) {
    return { ok: false, status: 400, error: "The studio job request is too large.", quota: null };
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
  if (animalSlug === "bad" || audience === "bad" || directionId === "bad" || setting === "bad" || !animalSlug || !audience) {
    return { ok: false, status: 400, error: "The animal, audience, or selected design is not valid.", quota: null };
  }
  if (!studioAudiences.includes(audience as StudioAudience)) {
    return { ok: false, status: 400, error: "Choose women, men, girls, boys, or unisex.", quota: null };
  }
  if (record.kind !== "try-on" && record.portrait !== undefined) {
    return {
      ok: false,
      status: 400,
      error: "A concept request does not accept a photograph. The portrait stays in this browser.",
      quota: null,
    };
  }
  let portrait: DecodedPortrait | null = null;
  if (record.kind === "try-on" && record.portrait !== undefined && record.portrait !== null) {
    if (typeof record.portrait !== "string") {
      return { ok: false, status: 400, error: "The photograph could not be read.", quota: null };
    }
    const decoded = decodePortraitDataUrl(record.portrait);
    if (!decoded.ok) return { ok: false, status: 400, error: decoded.error, quota: null };
    portrait = decoded.portrait;
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
      portrait,
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
    for (const key of conceptAssets.keys()) {
      if (key.startsWith(`${oldest}:`)) conceptAssets.delete(key);
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

function resolveRuntime(): { mode: StudioJobMode; provider: FashionImageProvider | null; label: PublicStudioJob["label"] } {
  if (providerOverride) return { mode: "openai", provider: providerOverride, label: "OpenAI" };
  const flag = (process.env.ANIMODA_IMAGE_PROVIDER ?? "").trim().toLowerCase();
  if (flag === "demo") return { mode: "demo", provider: null, label: "Labelled demo" };
  if (flag && flag !== "openai") return { mode: "unconfigured", provider: null, label: "Configuration" };
  const apiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!apiKey) return { mode: "unconfigured", provider: null, label: "Configuration" };
  const model = (process.env.OPENAI_IMAGE_MODEL ?? "").trim() || defaultOpenAiImageModel;
  return { mode: "openai", provider: createOpenAiFashionProvider({ apiKey, model }), label: "OpenAI" };
}

function demoMessage(kind: StudioJobKind): string {
  if (kind === "concept") {
    return "Labelled demo. ANIMODA_IMAGE_PROVIDER=demo, so this job does not call OpenAI and does not invent a concept image. The catalogue directions are unchanged, and the selected design remains the reference.";
  }
  return "Labelled demo. ANIMODA_IMAGE_PROVIDER=demo, so this job does not call OpenAI and no try-on image was made. Your photograph stayed in this browser, and the selected design remains the reference.";
}

function quotaMessage(kind: StudioJobKind): string {
  const name = kind === "concept" ? "concept" : "try-on";
  return `This visit has used its ${mockJobQuota} ${name} jobs. The limit is held in memory for this server process and is not an account quota. The selected design is unchanged.`;
}

function imageHref(job: StoredJob, slot: number): string {
  const params = new URLSearchParams({ visitId: job.visitId, slot: String(slot) });
  return `/api/studio/jobs/${job.id}/image?${params.toString()}`;
}

function toPublic(job: StoredJob): PublicStudioJob {
  const images = job.images.map((image, slot) => ({
    directionId: image.directionId,
    href: imageHref(job, slot),
    mediaType: image.mediaType,
  }));
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
    images,
    composite: job.kind === "try-on" && images[0] ? images[0].href : null,
    providerCalled: job.providerCalled,
    referencePreserved: true,
    message: job.message,
    createdAt: new Date(job.createdAt).toISOString(),
    updatedAt: new Date(job.updatedAt).toISOString(),
    quota: { ...job.quota },
  };
}

function settle(job: StoredJob, now: number): StoredJob {
  if (job.status === "succeeded" || job.status === "failed" || job.mode !== "demo") return job;
  const age = now - job.createdAt;
  if (age >= mockQueuedMs + mockRunMs) return { ...job, status: "succeeded", updatedAt: now };
  if (age >= mockQueuedMs && job.status === "queued") return { ...job, status: "running", updatedAt: now };
  return job;
}

function conceptTargets(animalSlug: string, audience: StudioAudience, setting: (typeof directionSettings)[number], selectedId: string | null) {
  const animal = animalBySlug(animalSlug);
  if (!animal) return [];
  const list = sampleDirections(animal, audience, setting);
  if (list.length <= maxConceptsPerJob) return list;
  const selected = list.find((item) => item.id === selectedId);
  const rest = list.filter((item) => item.id !== selected?.id);
  return selected ? [selected, ...rest].slice(0, maxConceptsPerJob) : list.slice(0, maxConceptsPerJob);
}

async function readPublicImage(publicPath: string | undefined): Promise<ImageReference | null> {
  if (!publicPath || !publicPath.startsWith("/") || publicPath.includes("..")) return null;
  const mediaType = publicPath.endsWith(".png")
    ? "image/png"
    : publicPath.endsWith(".webp")
      ? "image/webp"
      : publicPath.endsWith(".jpg") || publicPath.endsWith(".jpeg")
        ? "image/jpeg"
        : null;
  if (!mediaType) return null;
  const root = path.resolve(process.cwd(), "public");
  const full = path.resolve(root, publicPath.slice(1));
  if (!full.startsWith(`${root}${path.sep}`)) return null;
  try {
    const bytes = await readFile(full);
    if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024) return null;
    return { bytes, mediaType, filename: path.basename(full) };
  } catch {
    return null;
  }
}

function failJob(id: string, message: string, providerCalled: boolean) {
  const current = jobs.get(id);
  if (!current) return;
  jobs.set(id, {
    ...current,
    status: "failed",
    providerCalled,
    message,
    images: [],
    updatedAt: Date.now(),
  });
}

function startOpenAiJob(job: StoredJob, request: StudioJobRequest, provider: FashionImageProvider) {
  const task = executeOpenAiJob(job.id, request, provider).finally(() => {
    inflight.delete(task);
  });
  inflight.add(task);
}

async function executeOpenAiJob(id: string, request: StudioJobRequest, provider: FashionImageProvider) {
  const current = jobs.get(id);
  if (!current || current.status === "failed") return;
  jobs.set(id, { ...current, status: "running", updatedAt: Date.now() });
  try {
    if (request.kind === "concept") await executeConcept(id, request, provider);
    else await executeTryOn(id, request, provider);
  } catch (error) {
    const message = error instanceof FashionImageError ? error.message : "The OpenAI image request failed. No image was saved.";
    const providerCalled = !(error instanceof FashionImageError && (error.kind === "configuration" || error.kind === "unavailable-model"));
    failJob(id, message.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 300), providerCalled);
  }
}

async function executeConcept(id: string, request: StudioJobRequest, provider: FashionImageProvider) {
  const animal = animalBySlug(request.animalSlug);
  const setting = resolveSetting(request.setting);
  if (!animal || !setting) {
    failJob(id, "The animal or silhouette is no longer available. No image was generated.", false);
    return;
  }
  const targets = conceptTargets(request.animalSlug, request.audience, setting, request.directionId);
  if (targets.length === 0) {
    failJob(id, "There is no catalogue direction for this animal and audience, so OpenAI was not asked for a concept.", false);
    return;
  }
  const images: StoredImage[] = [];
  for (const direction of targets) {
    const reference = await readPublicImage(direction.image);
    const generated = await provider.generateConcept({
      animalName: animal.commonName,
      scientificName: animal.scientificName,
      characteristics: animal.designBody || animal.summary,
      colors: animal.swatches.map((swatch) => swatch.name).join(", ") || animal.color,
      garmentTitle: direction.title,
      garmentDescription: direction.body,
      textile: direction.textile,
      occasion: direction.setting,
      wearer: wearerFor(request.audience),
      audience: request.audience,
      reference,
    });
    if (reference && generated.bytes.equals(reference.bytes)) {
      throw new FashionImageError("OpenAI returned the reference image unchanged. It was not saved as a new concept.", "unchanged");
    }
    const stored = { directionId: direction.id, mediaType: generated.mediaType, bytes: generated.bytes };
    images.push(stored);
    conceptAssets.set(`${request.visitId}:${direction.id}`, {
      bytes: generated.bytes,
      mediaType: generated.mediaType,
      filename: `${direction.id}.jpg`,
    });
  }
  const latest = jobs.get(id);
  if (!latest) return;
  jobs.set(id, {
    ...latest,
    status: "succeeded",
    providerCalled: true,
    images,
    directionIds: images.map((image) => image.directionId),
    message:
      "OpenAI returned a fashion concept. It is a visualization inspired by the animal, not a garment in stock and not a tailoring measurement. The selected design id is unchanged.",
    updatedAt: Date.now(),
  });
}

async function executeTryOn(id: string, request: StudioJobRequest, provider: FashionImageProvider) {
  if (!request.portrait || !request.directionId) {
    failJob(id, "Add a photograph and select one design before a try-on. No image request was sent.", false);
    return;
  }
  const animal = animalBySlug(request.animalSlug);
  const direction = animal?.directions.find((item) => item.id === request.directionId);
  if (!animal || !direction) {
    failJob(id, "The selected design is no longer available. No try-on was requested.", false);
    return;
  }
  const generated = conceptAssets.get(`${request.visitId}:${direction.id}`);
  const garment = generated ?? (await readPublicImage(direction.image));
  if (!garment) {
    failJob(id, "The selected design has no garment image to send. No try-on was requested.", false);
    return;
  }
  const result: GeneratedImage = await provider.editTryOn({
    portrait: { bytes: request.portrait.bytes, mediaType: request.portrait.mediaType, filename: "portrait.jpg" },
    garment,
    garmentTitle: direction.title,
    textile: direction.textile,
    wearer: wearerFor(request.audience),
  });
  if (result.bytes.equals(request.portrait.bytes) || result.bytes.equals(garment.bytes)) {
    failJob(
      id,
      "OpenAI returned an unchanged input image. That is not a try-on visualization, so it was discarded.",
      true,
    );
    return;
  }
  const latest = jobs.get(id);
  if (!latest) return;
  jobs.set(id, {
    ...latest,
    status: "succeeded",
    providerCalled: true,
    images: [{ directionId: direction.id, mediaType: result.mediaType, bytes: result.bytes }],
    directionIds: [direction.id],
    message:
      "OpenAI returned a try-on visualization. It is not a tailoring measurement, a fit promise, or a manufacturing specification. The selected design id is unchanged.",
    updatedAt: Date.now(),
  });
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
  if (request.kind === "try-on" && !request.portrait) {
    return {
      ok: false,
      status: 400,
      error: "Add a photograph before requesting a try-on. No image request was sent.",
      quota: null,
    };
  }

  const runtime = resolveRuntime();
  const catalogueIds = sampleDirections(animal, request.audience, setting).map((item) => item.id);
  const referenceDirectionId = direction?.id ?? null;
  const directionIds = request.kind === "try-on" && referenceDirectionId ? [referenceDirectionId] : catalogueIds;
  const base = {
    id: `job_${crypto.randomUUID()}`,
    visitId: request.visitId,
    kind: request.kind,
    animalSlug: animal.slug,
    audience: request.audience,
    referenceDirectionId,
    directionIds,
    images: [] as StoredImage[],
    createdAt: now,
    updatedAt: now,
  };

  if (runtime.mode === "unconfigured") {
    const job: StoredJob = {
      ...base,
      status: "failed",
      mode: "unconfigured",
      label: "Configuration",
      providerCalled: false,
      message: configurationMessage,
      quota: quotaSnapshot(request.visitId, request.kind, usedCount(request.visitId, request.kind)),
    };
    rememberJob(job);
    return { ok: true, job: toPublic(job) };
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

  const job: StoredJob = {
    ...base,
    status: "queued",
    mode: runtime.mode,
    label: runtime.label,
    providerCalled: false,
    message: runtime.mode === "demo" ? demoMessage(request.kind) : "OpenAI is preparing the image. The selected design id stays unchanged.",
    quota: quotaSnapshot(request.visitId, request.kind, nextUsed),
  };
  rememberJob(job);
  if (runtime.mode === "openai" && runtime.provider) startOpenAiJob(job, request, runtime.provider);
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

export function readStudioJobImage(id: string, visitId: string, slot: number): { bytes: Buffer; mediaType: PortraitMediaType } | null {
  if (!jobIdPattern.test(id) || !isVisitId(visitId) || !Number.isInteger(slot) || slot < 0) return null;
  const current = jobs.get(id);
  if (!current || current.visitId !== visitId || current.status !== "succeeded") return null;
  const image = current.images[slot];
  if (!image) return null;
  return { bytes: image.bytes, mediaType: image.mediaType };
}
