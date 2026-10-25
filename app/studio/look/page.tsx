import type { Metadata } from "next";
import { LookStep } from "@/components/studio/look-step";

export const metadata: Metadata = {
  title: "Selected design",
  description: "Keep the selected design beside your photograph. The try-on provider is not connected.",
};

export default function StudioLookPage() {
  return <LookStep />;
}
