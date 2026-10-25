import type { Metadata } from "next";
import { NextStep } from "@/components/studio/next-step";

export const metadata: Metadata = {
  title: "Next steps",
  description: "Save this studio visit or note a manufacturing question. Nothing is sent, paid, or shipped.",
};

export default function StudioNextPage() {
  return <NextStep />;
}