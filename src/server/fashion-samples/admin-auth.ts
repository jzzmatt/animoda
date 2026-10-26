import { createHash, timingSafeEqual } from "node:crypto";

export type AdminAuthorization = "ok" | "unconfigured" | "unauthorized";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function authorizeFashionSampleAdmin(
  authorizationHeader: string | null,
  env: Record<string, string | undefined> = process.env,
): AdminAuthorization {
  const expected = env.FASHION_SAMPLE_ADMIN_TOKEN?.trim() ?? "";
  if (!expected) return "unconfigured";
  const header = authorizationHeader?.trim() ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (!provided) return "unauthorized";
  const matches = timingSafeEqual(digest(provided), digest(expected));
  return matches ? "ok" : "unauthorized";
}
