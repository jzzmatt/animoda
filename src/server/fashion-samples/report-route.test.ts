import { afterEach, describe, expect, it } from "vitest";
import { GET } from "../../../app/api/admin/fashion-samples/route";

const envKeys = ["FASHION_SAMPLE_ADMIN_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const previous = new Map<string, string | undefined>();

function rememberEnv() {
  for (const key of envKeys) previous.set(key, process.env[key]);
}

function restoreEnv() {
  for (const key of envKeys) {
    const value = previous.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("fashion sample report route", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("does not run when the admin token is absent", async () => {
    rememberEnv();
    delete process.env.FASHION_SAMPLE_ADMIN_TOKEN;
    const response = await GET(new Request("http://localhost/api/admin/fashion-samples"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "admin_token_not_configured" });
  });

  it("rejects a request that does not carry the admin token", async () => {
    rememberEnv();
    process.env.FASHION_SAMPLE_ADMIN_TOKEN = "test-admin-token";
    const response = await GET(
      new Request("http://localhost/api/admin/fashion-samples", {
        headers: { authorization: "Bearer wrong-token" },
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("stops before a database call when Supabase is not configured", async () => {
    rememberEnv();
    process.env.FASHION_SAMPLE_ADMIN_TOKEN = "test-admin-token";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const response = await GET(
      new Request("http://localhost/api/admin/fashion-samples", {
        headers: { authorization: "Bearer test-admin-token" },
      }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "supabase_not_configured" });
  });
});
