import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalProfile } from "@/components/catalogue/animal-profile";
import { PublicShell } from "@/components/layout/public-shell";
import { animalBySlug, catalogueAnimals } from "@/content/catalogue";
import { loadPublicFashionSamples } from "@/server/fashion-samples/views";
import { loadWildlife } from "@/server/wildlife";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogueAnimals.map((animal) => ({ slug: animal.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const animal = animalBySlug(slug);
  if (!animal) return { title: "Animal" };
  return {
    title: animal.commonName,
    description: `${animal.commonName}, ${animal.scientificName}. ${animal.summary} Taxonomy and occurrence records are cited from GBIF.`,
  };
}

export default async function AnimalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const animal = animalBySlug(slug);
  if (!animal) notFound();
  const [wildlife, fashionSamples] = await Promise.all([loadWildlife(slug), loadPublicFashionSamples(slug)]);
  return (
    <PublicShell>
      <AnimalProfile animal={animal} wildlife={wildlife} fashionSamples={fashionSamples ?? []} />
    </PublicShell>
  );
}
