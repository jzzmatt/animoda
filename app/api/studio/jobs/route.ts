import { NextResponse } from "next/server";
import { ensureStoredAnimalSamples } from "@/server/fashion-samples/pilot-job";
import { runCatalogueFashionSamples } from "@/server/fashion-samples/pilot-run";
import { applyPilotOutcome, createStudioJob, parseStudioJobRequest } from "@/server/studio-jobs";

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
  let job = result.job;
  if (job.mode === "catalogue" && job.kind === "concept") {
    const slug = job.animalSlug;
    const outcome = await ensureStoredAnimalSamples(slug, {
      replaceStored: parsed.request.replaceStored,
      generateMissing: async () => {
        await runCatalogueFashionSamples(undefined, [slug], { regenerate: parsed.request.replaceStored });
      },
    });
    const applied = applyPilotOutcome(job.id, parsed.request.visitId, outcome);
    if (applied) job = applied;
  }
  const status = job.status === "pending" || job.status === "generating" ? 202 : 200;
  return NextResponse.json(job, { status });
}
