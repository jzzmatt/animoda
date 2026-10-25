import type { Metadata } from "next";
import { AnimalStep } from "@/components/studio/animal-step";

export const metadata: Metadata = {
  title: "Choose an animal",
  description: "Choose a catalogue species and who the look is for. Girls and boys use age-appropriate directions.",
};

export default function StudioAnimalPage() {
  return <AnimalStep />;
}
