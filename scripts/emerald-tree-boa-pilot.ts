import { readFileSync } from "node:fs";
import { runEmeraldTreeBoaPilot } from "@/server/fashion-samples/pilot-run";

const env: Record<string, string | undefined> = { ...process.env };
for (const line of readFileSync(".env", "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const index = trimmed.indexOf("=");
  const key = trimmed.slice(0, index);
  const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
  if (!env[key]) env[key] = value;
}

const results = await runEmeraldTreeBoaPilot(env);
for (const result of results) {
  console.log(`${result.style} ${result.action} id=${result.id ?? ""} path=${result.imagePath ?? ""} error=${result.errorCode ?? ""}`);
}
if (results.some((result) => result.action === "failed")) process.exitCode = 1;
