import { createHash } from "node:crypto";

export const FASHION_SAMPLE_BUCKET = "animoda-fashion-samples";

export const fashionSampleStyles = ["formal", "casual_street", "youth_couture"] as const;

export type FashionSampleStyle = (typeof fashionSampleStyles)[number];

export const fashionSampleStatuses = ["pending", "generating", "completed", "failed"] as const;

export type FashionSampleStatus = (typeof fashionSampleStatuses)[number];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sampleIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isFashionSampleStyle(value: string): value is FashionSampleStyle {
  return (fashionSampleStyles as readonly string[]).includes(value);
}

export function isFashionSampleStatus(value: string): value is FashionSampleStatus {
  return (fashionSampleStatuses as readonly string[]).includes(value);
}

export function expectedSampleCount(animalIds: readonly string[]): number {
  return animalIds.length * fashionSampleStyles.length;
}

export function sampleObjectPath(animalId: string, style: FashionSampleStyle, sampleId: string): string {
  if (!slugPattern.test(animalId) || !sampleIdPattern.test(sampleId)) {
    throw new Error("invalid_sample_path");
  }
  return `animals/${animalId}/${style}/${sampleId}.png`;
}

export function pathMatchesSample(animalId: string, style: FashionSampleStyle, sampleId: string, imagePath: string): boolean {
  return imagePath === `animals/${animalId}/${style}/${sampleId}.png`;
}

/** Public catalogue URL derived from the stored object path. The path remains the source of truth. */
export function publicSampleUrl(supabaseUrl: string, imagePath: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  const path = imagePath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${FASHION_SAMPLE_BUCKET}/${path}`;
}

export function promptHash(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

export type StoredSample = {
  id: string;
  animalId: string;
  style: string;
  generationStatus: string;
  imagePath: string | null;
  promptHash: string;
  errorCode: string | null;
};

export type SamplePlan =
  | { action: "create" }
  | { action: "skip"; reason: "completed" }
  | {
      action: "resume";
      reason: "pending" | "generating" | "failed" | "missing-object" | "regenerate";
    };

/**
 * Decides whether a catalogue pair needs a new row, can resume the same row, or must be left alone.
 * A changed prompt does not regenerate a completed sample. Regeneration is explicit.
 */
export function planSample(
  existing: Pick<StoredSample, "generationStatus" | "imagePath" | "promptHash"> & { objectExists: boolean } | null,
  options: { regenerate: boolean },
): SamplePlan {
  if (!existing) return { action: "create" };
  if (options.regenerate) return { action: "resume", reason: "regenerate" };
  if (existing.generationStatus === "completed") {
    if (existing.imagePath && existing.objectExists) return { action: "skip", reason: "completed" };
    return { action: "resume", reason: "missing-object" };
  }
  if (existing.generationStatus === "pending") return { action: "resume", reason: "pending" };
  if (existing.generationStatus === "generating") return { action: "resume", reason: "generating" };
  if (existing.generationStatus === "failed") return { action: "resume", reason: "failed" };
  return { action: "resume", reason: "failed" };
}

export type FashionSampleReport = {
  catalogueAnimals: number;
  expectedSamples: number;
  completedSamples: number;
  pendingSamples: number;
  failedSamples: number;
  missingSamples: number;
  missingImages: number;
  duplicateRecords: number;
  inconsistentRecords: number;
  missing: { animalId: string; style: FashionSampleStyle }[];
  duplicateKeys: { animalId: string; style: string; ids: string[] }[];
  inconsistent: { id: string; animalId: string; style: string; reason: string }[];
  errors: { id: string; errorCode: string }[];
};

function verifiedCompleted(row: StoredSample, verifiedPaths: ReadonlySet<string>): boolean {
  if (row.generationStatus !== "completed" || !row.imagePath || !isFashionSampleStyle(row.style)) return false;
  if (!pathMatchesSample(row.animalId, row.style, row.id, row.imagePath)) return false;
  return verifiedPaths.has(row.imagePath);
}

export function buildFashionSampleReport(input: {
  animalIds: readonly string[];
  rows: readonly StoredSample[];
  verifiedPaths: ReadonlySet<string>;
}): FashionSampleReport {
  const missing: FashionSampleReport["missing"] = [];
  const duplicateKeys: FashionSampleReport["duplicateKeys"] = [];
  const inconsistent: FashionSampleReport["inconsistent"] = [];
  const errors: FashionSampleReport["errors"] = [];
  let completedSamples = 0;
  let pendingSamples = 0;
  let failedSamples = 0;
  let missingImages = 0;

  const grouped = new Map<string, StoredSample[]>();
  for (const row of input.rows) {
    const key = `${row.animalId}\u0000${row.style}`;
    const list = grouped.get(key);
    if (list) list.push(row);
    else grouped.set(key, [row]);
    if (row.errorCode) errors.push({ id: row.id, errorCode: row.errorCode });
  }

  const seen = new Set<string>();
  for (const animalId of input.animalIds) {
    for (const style of fashionSampleStyles) {
      const key = `${animalId}\u0000${style}`;
      seen.add(key);
      const rows = grouped.get(key) ?? [];
      if (rows.length === 0) {
        missing.push({ animalId, style });
        continue;
      }
      if (rows.length > 1) {
        duplicateKeys.push({ animalId, style, ids: rows.map((row) => row.id) });
        continue;
      }
      const row = rows[0];
      if (!row) continue;
      if (verifiedCompleted(row, input.verifiedPaths)) {
        completedSamples += 1;
        continue;
      }
      if (row.generationStatus === "completed") {
        missingImages += 1;
        inconsistent.push({ id: row.id, animalId, style, reason: "completed_without_stored_object" });
        continue;
      }
      if (row.generationStatus === "pending" || row.generationStatus === "generating") {
        if (row.imagePath && !input.verifiedPaths.has(row.imagePath)) missingImages += 1;
        pendingSamples += 1;
        continue;
      }
      if (row.generationStatus === "failed") {
        failedSamples += 1;
        continue;
      }
      inconsistent.push({ id: row.id, animalId, style, reason: "unrecognized_status" });
    }
  }

  for (const [key, rows] of grouped) {
    if (seen.has(key)) continue;
    for (const row of rows) {
      inconsistent.push({
        id: row.id,
        animalId: row.animalId,
        style: row.style,
        reason: "outside_catalogue",
      });
    }
  }

  return {
    catalogueAnimals: input.animalIds.length,
    expectedSamples: expectedSampleCount(input.animalIds),
    completedSamples,
    pendingSamples,
    failedSamples,
    missingSamples: missing.length,
    missingImages,
    duplicateRecords: duplicateKeys.reduce((sum, item) => sum + item.ids.length, 0),
    inconsistentRecords: inconsistent.length,
    missing,
    duplicateKeys,
    inconsistent,
    errors,
  };
}
