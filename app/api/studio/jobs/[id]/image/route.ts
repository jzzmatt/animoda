import { NextResponse } from "next/server";
import { readStudioJobImage } from "@/server/studio-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const visitId = url.searchParams.get("visitId") ?? "";
  const slot = Number(url.searchParams.get("slot"));
  const image = readStudioJobImage(id, visitId, slot);
  if (!image) {
    return NextResponse.json({ error: "Unknown studio image." }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(image.bytes), {
    status: 200,
    headers: {
      "content-type": image.mediaType,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
