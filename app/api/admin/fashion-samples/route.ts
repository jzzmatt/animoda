import { NextResponse } from "next/server";
import { authorizeFashionSampleAdmin } from "@/server/fashion-samples/admin-auth";
import { loadFashionSampleReport } from "@/server/fashion-samples/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = authorizeFashionSampleAdmin(request.headers.get("authorization"));
  if (authorization === "unconfigured") {
    return NextResponse.json({ error: "admin_token_not_configured" }, { status: 503 });
  }
  if (authorization === "unauthorized") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await loadFashionSampleReport();
  if (!result.ok) {
    const status = result.error === "supabase_not_configured" ? 503 : 502;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json(result.report);
}
