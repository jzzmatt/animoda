import { readFileSync, writeFileSync } from "node:fs";
import { catalogueAnimals } from "../src/content/catalogue";
import { assessCatalogueVariants, planPhase6b2, type AuditedSampleRecord } from "../src/content/fashion-samples";
import { FASHION_SAMPLE_BUCKET, publicSampleUrl } from "../src/server/fashion-samples/model";
import { isPng } from "../src/server/fashion-samples/pilot";
import { toAuditedSampleRecord } from "../src/server/fashion-samples/views";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "../src/server/supabase/server";

type QueryRow = {
  id: string;
  animal_id: string;
  style: string;
  title: string | null;
  description: string | null;
  generation_status: string;
  image_path: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  prompt_hash: string | null;
  created_at: string;
  updated_at: string;
};

function loadEnvFile() {
  const text = readFileSync(".env", "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function listStoragePaths(supabase: ReturnType<typeof createSupabaseServiceClient>, prefix: string): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  while (true) {
    const listed = await supabase.storage.from(FASHION_SAMPLE_BUCKET).list(prefix, { limit: 100, offset });
    if (listed.error) throw new Error(`storage_list_failed:${prefix}`);
    const entries = listed.data ?? [];
    for (const entry of entries) {
      const child = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id) paths.push(child);
      else paths.push(...(await listStoragePaths(supabase, child)));
    }
    if (entries.length < 100) break;
    offset += entries.length;
  }
  return paths;
}

async function pngCheck(url: string): Promise<{ retrieved: boolean; width: number | null; height: number | null; status: number }> {
  const response = await fetch(url, { headers: { Range: "bytes=0-31" } });
  const bytes = new Uint8Array(await response.arrayBuffer());
  const retrieved = (response.ok || response.status === 206) && isPng(bytes);
  if (!retrieved || bytes.byteLength < 24) return { retrieved, width: null, height: null, status: response.status };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { retrieved, width: view.getUint32(16), height: view.getUint32(20), status: response.status };
}

async function main() {
  loadEnvFile();
  const config = readSupabaseServerConfig();
  if (!config) throw new Error("supabase_not_configured");
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, animal_id, style, title, description, generation_status, image_path, generation_model, prompt_version, prompt_hash, created_at, updated_at");
  if (listed.error || !listed.data) throw new Error("sample_query_failed");
  const rows = listed.data as QueryRow[];
  const storagePaths = await listStoragePaths(supabase, "");
  const storageSet = new Set(storagePaths);
  const records: AuditedSampleRecord[] = [];
  const objects: {
    id: string;
    animalId: string;
    style: string;
    imagePath: string | null;
    objectExists: boolean;
    imageRetrieved: boolean;
    width: number | null;
    height: number | null;
    httpStatus: number | null;
  }[] = [];
  for (const row of rows) {
    const objectExists = Boolean(row.image_path && storageSet.has(row.image_path));
    let imageRetrieved = false;
    let width: number | null = null;
    let height: number | null = null;
    let httpStatus: number | null = null;
    if (row.image_path && objectExists) {
      const check = await pngCheck(publicSampleUrl(config.url, row.image_path));
      imageRetrieved = check.retrieved;
      width = check.width;
      height = check.height;
      httpStatus = check.status;
    }
    records.push(toAuditedSampleRecord(row, { objectExists, imageRetrieved }));
    objects.push({
      id: row.id,
      animalId: row.animal_id,
      style: row.style,
      imagePath: row.image_path,
      objectExists,
      imageRetrieved,
      width,
      height,
      httpStatus,
    });
  }
  const animalIds = catalogueAnimals.map((animal) => animal.slug);
  const decisions = assessCatalogueVariants(animalIds, records, (path) => publicSampleUrl(config.url, path));
  const plan = planPhase6b2(decisions, records);
  const counts = { reusable: 0, missing: 0, invalid: 0, ambiguous: 0 };
  for (const decision of decisions) counts[decision.assessment] += 1;
  const referenced = new Set(rows.map((row) => row.image_path).filter((path): path is string => Boolean(path)));
  const unreferenced = storagePaths.filter((path) => !referenced.has(path));
  const report = {
    generatedAt: new Date().toISOString(),
    animalCount: animalIds.length,
    databaseRows: rows.length,
    storageObjects: storagePaths.length,
    unreferencedStorageObjects: unreferenced.length,
    retrieval: {
      referencedObjects: objects.filter((item) => item.objectExists).length,
      pngRetrieved: objects.filter((item) => item.imageRetrieved).length,
      missingObjects: objects.filter((item) => item.imagePath && !item.objectExists).length,
    },
    counts,
    phase6b2: {
      keep: plan.keep.length,
      holdForReview: plan.holdForReview.length,
      generate: plan.generate.length,
      resume: plan.resume.length,
    },
    providerCalled: false,
    objectsDeleted: false,
    objectsOverwritten: false,
    migrationApplied: false,
    decisions: decisions.map((decision) => ({
      animalId: decision.animalId,
      audience: decision.audience,
      style: decision.style,
      assessment: decision.assessment,
      mapping: decision.mapping,
      sampleId: decision.sampleId,
      heldSampleIds: decision.heldSampleIds,
    })),
    objects,
  };
  writeFileSync("docs/reports/phase-6b1-fashion-sample-audit.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        animals: report.animalCount,
        rows: report.databaseRows,
        storage: report.storageObjects,
        counts: report.counts,
        retrieval: report.retrieval,
        phase6b2: report.phase6b2,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "audit_failed");
  process.exit(1);
});
