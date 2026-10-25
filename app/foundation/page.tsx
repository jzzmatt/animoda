import type { Metadata } from "next";
import { FoundationGallery } from "@/components/foundation/foundation-gallery";

export const metadata: Metadata = {
  title: "Design foundation",
  description: "Animoda colour, type, and interface primitives from the approved Stitch design system.",
};

export default function FoundationPage() {
  return <FoundationGallery />;
}
