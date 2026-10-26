"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimalSilhouette } from "@/components/catalogue/animal-silhouette";
import { EditorialImage } from "@/components/public/editorial-image";
import { catalogueAnimals, catalogueGroups, filterCatalogue, type CatalogueGroup } from "@/content/catalogue";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor, studioAudiences } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";
import { BlockedStep } from "./blocked-step";

export function AnimalStep() {
  const studio = useStudio();
  const [text, setText] = useState("");
  const [group, setGroup] = useState<CatalogueGroup>("All Animals");
  const animals = useMemo(
    () => filterCatalogue(catalogueAnimals, { text, group, region: "All regions", color: "All tones", sort: "common" }),
    [text, group],
  );

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("animal", studio);
  if (needed) return <BlockedStep needed={needed} />;

  const selected = catalogueAnimals.find((animal) => animal.slug === studio.animalSlug);

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Step 2 of 5 · Atelier selection</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          Choose your animal muse
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          Choose an entry from this catalogue. The screen’s count of 248 species is illustrative. This visit uses the {catalogueAnimals.length} entries already published here, including one fish family.
        </p>
      </header>

      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="font-title-md text-title-md text-primary">Who is this look for?</h2>
        <p className="mt-space-xxs font-body-sm text-body-sm text-on-surface-variant">
          Girls and boys use age-appropriate children’s directions. Unisex does not assume a gendered garment.
        </p>
        <div className="mt-space-sm flex flex-wrap gap-space-xs" role="group" aria-label="Audience">
          {studioAudiences.map((audience) => (
            <button
              key={audience}
              type="button"
              aria-pressed={studio.audience === audience}
              onClick={() => studio.setAudience(audience)}
              className={cn(
                "min-h-11 rounded-full px-space-md font-label-md text-label-md",
                studio.audience === audience ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface",
              )}
            >
              {audience}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-space-sm">
        <label className="font-label-md text-label-md text-primary" htmlFor="studio-animal-search">
          Search the catalogue
        </label>
        <input
          id="studio-animal-search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Common name or scientific name"
          className="min-h-11 w-full rounded-full border border-border-warm-subtle bg-surface-container-lowest px-space-md text-on-surface"
        />
        <div className="flex gap-space-xs overflow-x-auto" role="group" aria-label="Class">
          {catalogueGroups.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={group === item}
              onClick={() => setGroup(item)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-space-md font-label-sm text-label-sm",
                group === item ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {animals.length === 0 ? (
        <p role="status" className="rounded-xl bg-surface-container p-space-lg font-body-md text-on-surface-variant">
          No catalogue entry matches that search. Clear the text or choose another class.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
          {animals.map((animal) => {
            const pressed = studio.animalSlug === animal.slug;
            return (
              <li key={animal.slug}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => studio.setAnimal(animal.slug)}
                  className={cn(
                    "flex h-full w-full flex-col overflow-hidden rounded-3xl bg-surface-container-lowest text-left shadow-sm",
                    pressed && "ring-2 ring-golden-accent",
                  )}
                >
                  <span className="relative aspect-[16/10] bg-surface-container">
                    <EditorialImage src={animal.image} alt={animal.alt} sizes="(min-width: 1280px) 25vw, 50vw" />
                  </span>
                  <span className="flex flex-1 flex-col gap-space-xxs p-space-md">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">{animal.group}</span>
                    <span className="font-title-md text-title-md text-primary">{animal.commonName}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{animal.scientificName}</span>
                    <AnimalSilhouette scientificName={animal.scientificName} commonName={animal.commonName} className="max-w-40" />
                    <span className="mt-space-xs flex flex-wrap gap-space-xxs">
                      {animal.swatches.slice(0, 4).map((swatch) => (
                        <span key={swatch.hex} className="inline-flex items-center gap-space-xxs font-label-sm text-label-sm text-on-surface-variant">
                          <span className="h-3 w-3 rounded-full border border-border-warm-subtle" style={{ backgroundColor: swatch.hex }} />
                          {swatch.name}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="font-label-caps text-label-caps text-secondary uppercase">Selected muse</p>
          <p className="font-body-md text-body-md text-on-surface">
            {selected ? `${selected.commonName} · ${studio.audience}` : "Choose a species to continue."}
          </p>
        </div>
        {selected ? (
          <Button href="/studio/suggestions" icon="arrow_forward" iconPosition="end">
            Review sample directions
          </Button>
        ) : (
          <Button disabled>Review sample directions</Button>
        )}
      </div>
    </div>
  );
}
