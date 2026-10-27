import { readFileSync } from "node:fs";
import { loadFashionSampleReport } from "@/server/fashion-samples/repository";
import { runCatalogueFashionSamples } from "@/server/fashion-samples/pilot-run";

const env: Record<string, string | undefined> = { ...process.env };
for (const line of readFileSync(".env", "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const index = trimmed.indexOf("=");
  const key = trimmed.slice(0, index);
  const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
  if (!env[key]) env[key] = value;
}

const generate = process.argv.includes("--generate");
const regenerate = process.argv.includes("--regenerate");
const report = await loadFashionSampleReport();
if (!report.ok) {
  console.log(`report=${report.error}`);
  process.exitCode = 1;
} else {
  const summary = report.report;
  console.log(
    `animals=${summary.catalogueAnimals} expected=${summary.expectedSamples} completed=${summary.completedSamples} pending=${summary.pendingSamples} failed=${summary.failedSamples} missing=${summary.missingSamples} inconsistent=${summary.inconsistentRecords}`,
  );
}

if (!generate && !regenerate) {
  console.log("report-only. Pass --generate to fill missing styles, or --regenerate to replace stored styles.");
  process.exit(process.exitCode ?? 0);
}

const results = await runCatalogueFashionSamples(env, undefined, { regenerate });
const completed = results.filter((result) => result.action === "completed").length;
const skipped = results.filter((result) => result.action === "skipped").length;
const failed = results.filter((result) => result.action === "failed");
console.log(`run completed=${completed} skipped=${skipped} failed=${failed.length}`);
for (const result of failed) console.log(`failed ${result.animalId} ${result.style} ${result.errorCode}`);
if (failed.length > 0) process.exitCode = 1;
