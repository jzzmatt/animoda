import { readFileSync } from "node:fs";
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

const results = await runCatalogueFashionSamples(env);
const completed = results.filter((result) => result.action === "completed").length;
const skipped = results.filter((result) => result.action === "skipped").length;
const failed = results.filter((result) => result.action === "failed");
console.log(`completed=${completed} skipped=${skipped} failed=${failed.length}`);
for (const result of failed) console.log(`failed ${result.animalId} ${result.style} ${result.errorCode}`);
if (failed.length > 0) process.exitCode = 1;
