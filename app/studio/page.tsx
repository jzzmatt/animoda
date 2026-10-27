import type { Metadata } from "next";
import { AnimalStep } from "@/components/studio/animal-step";

export const metadata: Metadata = {
  title: "Choose an animal",
  description: "Choose an animal from the Animoda catalogue. The next step is a Fashion Sample.",
};

export default function StudioAnimalPage() {
  return <AnimalStep />;
}
