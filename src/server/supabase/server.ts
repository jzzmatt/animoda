import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string;
};

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Reads the server configuration. Returns null when either required value is absent. Never logs the key. */
export function readSupabaseServerConfig(
  env: Record<string, string | undefined> = process.env,
): SupabaseServerConfig | null {
  const url = clean(env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = clean(env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceRoleKey) return null;
  if (!URL.canParse(url)) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return null;
  if (serviceRoleKey.length < 20) return null;
  return { url: parsed.origin, serviceRoleKey };
}

export function createSupabaseServiceClient(config: SupabaseServerConfig): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Supabase service access is server-only.");
  }
  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
