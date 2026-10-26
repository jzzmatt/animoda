import type { Metadata } from "next";
import { LookStep } from "@/components/studio/look-step";

export const metadata: Metadata = {
  title: "Selected design",
  description: "Keep the selected design beside your photograph. A try-on request asks OpenAI for a visualization. Without a server key, no try-on image is made.",
};

export default function StudioLookPage() {
  return <LookStep />;
}
