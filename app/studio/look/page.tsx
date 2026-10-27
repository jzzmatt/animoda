import type { Metadata } from "next";
import { LookStep } from "@/components/studio/look-step";

export const metadata: Metadata = {
  title: "Selected design",
  description: "Keep the selected design beside your photograph. A try-on request finishes as mock completed when no try-on provider is chosen, and no composite is made.",
};

export default function StudioLookPage() {
  return <LookStep />;
}
