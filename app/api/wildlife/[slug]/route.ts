import { NextResponse } from "next/server";
import { animalBySlug } from "@/content/catalogue";
import { isCountryCode, loadWildlife } from "@/server/wildlife";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!animalBySlug(slug)) {
    return NextResponse.json({ error: "Unknown species" }, { status: 404 });
  }
  const country = new URL(request.url).searchParams.get("country");
  if (country && !isCountryCode(country)) {
    return NextResponse.json({ error: "Unknown country" }, { status: 400 });
  }
  const report = await loadWildlife(slug, country);
  return NextResponse.json(report);
}
