import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage } from "@/components/public/editorial-image";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { animalInspirations, routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Animal Catalog",
  description: "Sample animal inspirations. The searchable catalogue and map open in Phase 3.",
};

export default function AnimalsPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Phase 3"
        title="Animal catalogue"
        lede="Search, filters, animal profiles, fashion inspiration, and the geographic explorer open in Phase 3. The eight specimens below are the landing samples. “120+ species” on the home page is an illustrative label, not a live count."
      >
        <TextSection title="Sample specimens">
          <ul className="grid grid-cols-2 gap-gutter sm:grid-cols-4">
            {animalInspirations.map((animal) => (
              <li key={animal.name} className="flex flex-col gap-space-xs">
                <span className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container">
                  <EditorialImage src={animal.image} alt={animal.alt} sizes="(min-width: 640px) 20vw, 40vw" />
                </span>
                <span className="font-label-md text-label-md text-primary">{animal.name}</span>
                <span className="font-body-sm text-body-sm">{animal.meta}</span>
              </li>
            ))}
          </ul>
          <p>
            Scientific names on the lookbook, such as Equus quagga, are labels from the approved design. Phase 3 will cite GBIF or iNaturalist before a range is shown. A selected country does not make an animal native there.
          </p>
          <p>
            <Link href={routes.home} className="font-label-md text-label-md text-secondary hover:text-primary">
              Return to Discover
            </Link>
          </p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
