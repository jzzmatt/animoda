import type { Metadata } from "next";
import { PhotoStep } from "@/components/studio/photo-step";

export const metadata: Metadata = {
  title: "Your photograph",
  description: "Add a portrait for this Animoda Studio visit. Framing practices open before a photograph is captured or uploaded. The photograph stays in this browser.",
};

export default function StudioPhotoPage() {
  return <PhotoStep />;
}
