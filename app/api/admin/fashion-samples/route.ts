import { NextResponse } from "next/server";
import { authorizeFashionSampleAdmin } from "@/server/fashion-samples/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  authorizeFashionSampleAdmin(request.headers.get("authorization"));
  return NextResponse.json(
    { error: "admin_not_available" },
    { status: 403 },
  );
}
