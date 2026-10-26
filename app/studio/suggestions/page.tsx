import type { Metadata } from "next";
import { SuggestionsStep } from "@/components/studio/suggestions-step";

export const metadata: Metadata = {
  title: "Sample directions",
  description: "Review catalogue directions for the chosen animal and select one design. Regenerating runs a labelled mock job when no concept key is configured.",
};

export default function StudioSuggestionsPage() {
  return <SuggestionsStep />;
}
