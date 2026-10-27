import type { Metadata } from "next";
import { LookStep } from "@/components/studio/look-step";

export const metadata: Metadata = {
  title: "Selected design",
  description: "Keep the selected design beside your photograph. A try-on request does not upload the photograph or make a composite.",
};

export default function StudioLookPage() {
  return <LookStep />;
}
