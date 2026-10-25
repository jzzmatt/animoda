import type { Metadata } from "next";
import { PhotoStep } from "@/components/studio/photo-step";

export const metadata: Metadata = {
  title: "Your photograph",
  description: "Add a portrait for this Animoda Studio visit. The photograph stays in this browser and is not uploaded.",
};

export default function StudioPhotoPage() {
  return <PhotoStep />;
}
