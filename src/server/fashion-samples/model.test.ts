import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogueAnimals } from "@/content/catalogue";
import { authorizeFashionSampleAdmin } from "./admin-auth";
import {
  buildFashionSampleReport,
  expectedSampleCount,
  fashionSampleStyles,
  pathMatchesSample,
  planSample,
  promptHash,
  publicSampleUrl,
  sampleObjectPath,
  type StoredSample,
} from "./model";
import { readSupabaseServerConfig } from "../supabase/server";

const sampleId = "11111111-1111-4111-8111-111111111111";

function row(overrides: Partial<StoredSample> = {}): StoredSample {
  const animalId = overrides.animalId ?? "plains-zebra";
  const style = overrides.style ?? "formal";
  const id = overrides.id ?? sampleId;
  return {
    id,
    animalId,
    style,
    generationStatus: "completed",
    imagePath: `animals/${animalId}/${style}/${id}.png`,
    promptHash: promptHash("formal plains zebra"),
    errorCode: null,
    ...overrides,
  };
}

describe("fashion sample persistence rules", () => {
  it("counts one sample for each catalogue animal and style", () => {
    const ids = catalogueAnimals.map((animal) => animal.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(37);
    expect(fashionSampleStyles).toHaveLength(3);
    expect(expectedSampleCount(ids)).toBe(111);
  });

  it("builds a stable object path and a public url from that path", () => {
    const path = sampleObjectPath("plains-zebra", "casual_street", sampleId);
    expect(path).toBe(`animals/plains-zebra/casual_street/${sampleId}.png`);
    expect(pathMatchesSample("plains-zebra", "casual_street", sampleId, path)).toBe(true);
    expect(publicSampleUrl("https://example.supabase.co/", path)).toBe(
      `https://example.supabase.co/storage/v1/object/public/animoda-fashion-samples/${path}`,
    );
  });

  it("rejects an animal id or sample id that cannot form a storage path", () => {
    expect(() => sampleObjectPath("../plains-zebra", "formal", sampleId)).toThrow("invalid_sample_path");
    expect(() => sampleObjectPath("plains-zebra", "formal", "not-a-uuid")).toThrow("invalid_sample_path");
  });

  it("skips a completed sample whose stored object exists", () => {
    expect(
      planSample(
        { generationStatus: "completed", imagePath: "animals/lion/formal/x.png", objectExists: true, promptHash: "a" },
        { regenerate: false },
      ),
    ).toEqual({ action: "skip", reason: "completed" });
  });

  it("does not regenerate a completed sample when only the prompt hash changes", () => {
    expect(
      planSample(
        { generationStatus: "completed", imagePath: "animals/lion/formal/x.png", objectExists: true, promptHash: "old" },
        { regenerate: false },
      ),
    ).toEqual({ action: "skip", reason: "completed" });
  });

  it("resumes the same row for incomplete work, a missing object, or an explicit regenerate", () => {
    expect(planSample(null, { regenerate: false })).toEqual({ action: "create" });
    expect(
      planSample(
        { generationStatus: "pending", imagePath: null, objectExists: false, promptHash: "a" },
        { regenerate: false },
      ),
    ).toEqual({ action: "resume", reason: "pending" });
    expect(
      planSample(
        { generationStatus: "generating", imagePath: null, objectExists: false, promptHash: "a" },
        { regenerate: false },
      ),
    ).toEqual({ action: "resume", reason: "generating" });
    expect(
      planSample(
        { generationStatus: "failed", imagePath: null, objectExists: false, promptHash: "a" },
        { regenerate: false },
      ),
    ).toEqual({ action: "resume", reason: "failed" });
    expect(
      planSample(
        { generationStatus: "completed", imagePath: "animals/lion/formal/x.png", objectExists: false, promptHash: "a" },
        { regenerate: false },
      ),
    ).toEqual({ action: "resume", reason: "missing-object" });
    expect(
      planSample(
        { generationStatus: "completed", imagePath: "animals/lion/formal/x.png", objectExists: true, promptHash: "a" },
        { regenerate: true },
      ),
    ).toEqual({ action: "resume", reason: "regenerate" });
  });

  it("counts a sample as completed only when the row and the storage object agree", () => {
    const animals = ["plains-zebra", "lion"];
    const completed = row();
    const missingObject = row({
      id: "22222222-2222-4222-8222-222222222222",
      style: "casual_street",
      imagePath: "animals/plains-zebra/casual_street/22222222-2222-4222-8222-222222222222.png",
    });
    const pending = row({
      id: "33333333-3333-4333-8333-333333333333",
      style: "youth_couture",
      generationStatus: "pending",
      imagePath: null,
    });
    const failed = row({
      id: "44444444-4444-4444-8444-444444444444",
      animalId: "lion",
      style: "formal",
      generationStatus: "failed",
      imagePath: null,
      errorCode: "generation_failed",
    });
    const report = buildFashionSampleReport({
      animalIds: animals,
      rows: [completed, missingObject, pending, failed],
      verifiedPaths: new Set([completed.imagePath ?? ""]),
    });

    expect(report.catalogueAnimals).toBe(2);
    expect(report.expectedSamples).toBe(6);
    expect(report.completedSamples).toBe(1);
    expect(report.pendingSamples).toBe(1);
    expect(report.failedSamples).toBe(1);
    expect(report.missingSamples).toBe(2);
    expect(report.missingImages).toBe(1);
    expect(report.inconsistent.map((item) => item.reason)).toEqual(["completed_without_stored_object"]);
    expect(report.errors).toEqual([{ id: failed.id, errorCode: "generation_failed" }]);
    expect(report.missing).toEqual([
      { animalId: "lion", style: "casual_street" },
      { animalId: "lion", style: "youth_couture" },
    ]);
  });

  it("reports duplicate rows and rows whose path does not match the animal and style", () => {
    const first = row();
    const second = row({ id: "22222222-2222-4222-8222-222222222222" });
    const mismatched = row({
      id: "33333333-3333-4333-8333-333333333333",
      animalId: "lion",
      style: "formal",
      imagePath: "animals/giraffe/formal/33333333-3333-4333-8333-333333333333.png",
    });
    const report = buildFashionSampleReport({
      animalIds: ["plains-zebra", "lion"],
      rows: [first, second, mismatched],
      verifiedPaths: new Set([mismatched.imagePath ?? ""]),
    });

    expect(report.completedSamples).toBe(0);
    expect(report.duplicateRecords).toBe(2);
    expect(report.duplicateKeys[0]?.ids).toEqual([first.id, second.id]);
    expect(report.inconsistent).toEqual([
      {
        id: mismatched.id,
        animalId: "lion",
        style: "formal",
        reason: "completed_without_stored_object",
      },
    ]);
  });

  it("keeps the migration limited to the catalogue sample tables and the public sample bucket", () => {
    const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20261026154153_animal_fashion_samples.sql"), "utf8");
    expect(sql).toContain("create table public.animal_fashion_samples");
    expect(sql).toContain("unique (animal_id, style)");
    expect(sql).toContain("animoda-fashion-samples");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("generation_status = 'completed'");
    expect(sql.toLowerCase()).not.toContain("drop table");
    expect(sql).not.toContain("service_role");
    expect(sql).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/);
  });
});

describe("supabase server configuration", () => {
  it("stays unset when the project url or service role key is missing", () => {
    expect(readSupabaseServerConfig({})).toBeNull();
    expect(readSupabaseServerConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toBeNull();
    expect(readSupabaseServerConfig({ SUPABASE_SERVICE_ROLE_KEY: "server-side-service-role-key" })).toBeNull();
  });

  it("accepts an https project url and a server key without returning the key in the url", () => {
    const config = readSupabaseServerConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co/rest/v1/",
      SUPABASE_SERVICE_ROLE_KEY: "server-side-service-role-key",
    });
    expect(config?.url).toBe("https://example.supabase.co");
    expect(config?.serviceRoleKey).toBe("server-side-service-role-key");
    expect(JSON.stringify({ url: config?.url })).not.toContain("server-side-service-role-key");
  });

  it("accepts the dashboard url and secret key names", () => {
    const config = readSupabaseServerConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "sb_secret_server_side_key_value",
    });
    expect(config?.url).toBe("https://example.supabase.co");
    expect(config?.serviceRoleKey).toBe("sb_secret_server_side_key_value");
  });

  it("rejects a publishable key used as the server credential", () => {
    expect(
      readSupabaseServerConfig({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SECRET_KEY: "sb_publishable_not_a_server_key",
      }),
    ).toBeNull();
  });

  it("rejects a non-https url and a short key", () => {
    expect(
      readSupabaseServerConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "server-side-service-role-key",
      }),
    ).toBeNull();
    expect(
      readSupabaseServerConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "short-key",
      }),
    ).toBeNull();
  });

  it("does not accept a browser token as catalogue administration", () => {
    expect(authorizeFashionSampleAdmin(null)).toBe("unavailable");
    expect(authorizeFashionSampleAdmin("Bearer test-admin-token")).toBe("unavailable");
    expect(authorizeFashionSampleAdmin("Bearer sk-test-value")).toBe("unavailable");
  });
});
