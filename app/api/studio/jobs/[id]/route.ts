import { NextResponse } from "next/server";
import { readStudioJob } from "@/server/studio-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const visitId = new URL(request.url).searchParams.get("visitId") ?? "";
  const job = readStudioJob(id, visitId);
  if (!job) {
    return NextResponse.json({ error: "Unknown studio job." }, { status: 404 });
  }
  return NextResponse.json(job);
}
