import { NextResponse } from "next/server";
import { createStudioJob, parseStudioJobRequest } from "@/server/studio-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  const parsed = parseStudioJobRequest(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, quota: parsed.quota }, { status: parsed.status });
  }
  const result = createStudioJob(parsed.request);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, quota: result.quota }, { status: result.status });
  }
  const status = result.job.status === "queued" || result.job.status === "running" ? 202 : 200;
  return NextResponse.json(result.job, { status });
}
