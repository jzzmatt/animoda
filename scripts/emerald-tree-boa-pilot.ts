import { readFileSync } from "node:fs";
import { EMERALD_TREE_BOA_SLUG } from "@/content/persisted-samples";
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

const results = await runCatalogueFashionSamples(env, [EMERALD_TREE_BOA_SLUG]);
for (const result of results) {
  console.log(`${result.style} ${result.action} id=${result.id ?? ""} path=${result.imagePath ?? ""} error=${result.errorCode ?? ""}`);
}
if (results.some((result) => result.action === "failed")) process.exitCode = 1;
