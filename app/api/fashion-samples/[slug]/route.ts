import { NextResponse } from "next/server";
import { loadPublicFashionSamples } from "@/server/fashion-samples/views";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const samples = await loadPublicFashionSamples(slug);
  if (!samples) return NextResponse.json({ error: "unknown_animal" }, { status: 404 });
  return NextResponse.json({ samples });
}
