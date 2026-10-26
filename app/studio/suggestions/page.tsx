import type { Metadata } from "next";
import { SuggestionsStep } from "@/components/studio/suggestions-step";

export const metadata: Metadata = {
  title: "Sample directions",
  description: "Review catalogue directions for the chosen animal and select one design. Regenerating asks OpenAI for a concept. A missing server key leaves the catalogue images in place.",
};

export default function StudioSuggestionsPage() {
  return <SuggestionsStep />;
}
