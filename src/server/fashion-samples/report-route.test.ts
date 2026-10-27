import { describe, expect, it } from "vitest";
import { GET } from "../../../app/api/admin/fashion-samples/route";

describe("fashion sample report route", () => {
  it("does not open the report over HTTP", async () => {
    const response = await GET(
      new Request("http://localhost/api/admin/fashion-samples", {
        headers: { authorization: "Bearer sk-test-value" },
      }),
    );
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "admin_not_available" });
    expect(JSON.stringify(body)).not.toContain("sk-test-value");
  });
});
