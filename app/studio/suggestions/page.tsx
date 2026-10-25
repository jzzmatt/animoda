import type { Metadata } from "next";
import { SuggestionsStep } from "@/components/studio/suggestions-step";

export const metadata: Metadata = {
  title: "Sample directions",
  description: "Review catalogue directions for the chosen animal and select one design. A concept provider is not connected.",
};

export default function StudioSuggestionsPage() {
  return <SuggestionsStep />;
}
