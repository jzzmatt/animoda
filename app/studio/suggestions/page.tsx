import type { Metadata } from "next";
import { SuggestionsStep } from "@/components/studio/suggestions-step";

export const metadata: Metadata = {
  title: "Sample directions",
  description: "Review catalogue directions for the chosen animal and select one design. Checking stored samples confirms saved fashion images and generates only a missing style.",
};

export default function StudioSuggestionsPage() {
  return <SuggestionsStep />;
}
