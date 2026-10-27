import type { Metadata } from "next";
import { FashionSampleStep } from "@/components/studio/fashion-sample-step";

export const metadata: Metadata = {
  title: "Fashion Samples",
  description: "Choose an available Fashion Sample for the selected animal.",
};

export default function StudioSamplePage() {
  return <FashionSampleStep />;
}
