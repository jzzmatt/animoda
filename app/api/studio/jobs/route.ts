import { NextResponse } from "next/server";
import { isFashionSampleAudience } from "@/content/fashion-samples";
import { confirmSelectedFashionSample } from "@/server/fashion-samples/views";
import { createStudioJob, parseStudioJobRequest, type VerifiedFashionSampleRef } from "@/server/studio-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mockRequested(): boolean {
  return process.env.ANIMODA_MOCK_GENERATION?.trim() === "1";
}

export async function POST(request: Request) {
  const raw = await request.text();
  const parsed = parseStudioJobRequest(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, quota: parsed.quota }, { status: parsed.status });
  }
  if (parsed.request.replaceStored) {
    return NextResponse.json(
      { error: "Replacing a Fashion Sample is not part of this step. No image was requested.", quota: null },
      { status: 400 },
    );
  }
  let verified: VerifiedFashionSampleRef | null = null;
  if (!mockRequested()) {
    const audience = parsed.request.audience.toLowerCase();
    if (!isFashionSampleAudience(audience) || !parsed.request.fashionSampleId) {
      return NextResponse.json({ error: "Choose an available Fashion Sample before continuing.", quota: null }, { status: 400 });
    }
    const confirmed = await confirmSelectedFashionSample({
      animalId: parsed.request.animalSlug,
      audience,
      sampleId: parsed.request.fashionSampleId,
    });
    if (!confirmed.ok) {
      return NextResponse.json({ error: confirmed.message, quota: null }, { status: 409 });
    }
    verified = { style: confirmed.sample.style, imagePath: confirmed.sample.imagePath };
  }
  const result = createStudioJob(parsed.request, Date.now(), verified);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, quota: result.quota }, { status: result.status });
  }
  const status = result.job.status === "pending" || result.job.status === "generating" ? 202 : 200;
  return NextResponse.json(result.job, { status });
}
