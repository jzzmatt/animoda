"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";
import {
  catalogueAnimals,
  catalogueColors,
  catalogueGroups,
  catalogueNote,
  catalogueRegions,
  catalogueSorts,
  defaultCatalogueQuery,
  filterCatalogue,
  type CatalogueAnimal,
  type CatalogueGroup,
  type CatalogueQuery,
  type CatalogueSort,
} from "@/content/catalogue";
import { pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

function countLabel(animals: readonly CatalogueAnimal[], group: CatalogueGroup): number {
  if (group === "All Animals") return animals.length;
  return animals.filter((animal) => animal.group === group).length;
}

export function CatalogueBrowser() {
  const [query, setQuery] = useState<CatalogueQuery>(defaultCatalogueQuery);
  const [marked, setMarked] = useState<string[]>([]);
  const [note, setNote] = useState("No species is marked.");
  const results = useMemo(() => filterCatalogue(catalogueAnimals, query), [query]);

  function toggle(animal: CatalogueAnimal) {
    const active = marked.includes(animal.slug);
    setMarked((current) => (active ? current.filter((slug) => slug !== animal.slug) : [...current, animal.slug]));
    setNote(
      active
        ? `${animal.commonName} is unmarked. Animoda has no saved inspiration list.`
        : `${animal.commonName} is marked for this visit. Animoda has no saved inspiration list.`,
    );
  }

  return (
    <div className={cn("mx-auto flex max-w-7xl flex-col gap-space-xl py-space-3xl", pageGutter)}>
      <header className="flex flex-col gap-space-md">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">
          Natural Taxonomy · Atelier Genesis
        </p>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          Animal Discovery
        </h1>
        <p className="max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
          Explore the natural textures, color systems, and structural forms of the curated species to inspire bespoke fashion.
        </p>
        <p className="max-w-3xl font-body-sm text-body-sm text-on-surface-variant">{catalogueNote}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{catalogueAnimals.length} species in this catalogue.</p>
      </header>
      <div className="grid items-start gap-gutter lg:grid-cols-12">
        <aside className="flex flex-col gap-space-lg lg:col-span-3">
          <TextField
            id="catalogue-search"
            label="Search the catalogue"
            shape="pill"
            value={query.text}
            placeholder="Common name, scientific name, or browse tag"
            onChange={(event) => setQuery((current) => ({ ...current, text: event.target.value }))}
          />
          {query.text ? (
            <button
              type="button"
              className="self-start font-label-md text-label-md text-secondary"
              onClick={() => setQuery((current) => ({ ...current, text: "" }))}
            >
              Clear search
            </button>
          ) : null}
          <fieldset className="flex flex-col gap-space-xs">
            <legend className="font-label-caps text-label-caps text-secondary uppercase">Kingdom classes</legend>
            {catalogueGroups.map((group) => (
              <button
                key={group}
                type="button"
                aria-pressed={query.group === group}
                onClick={() => setQuery((current) => ({ ...current, group }))}
                className={cn(
                  "flex items-center justify-between rounded-full px-space-md py-space-xs text-left font-label-md text-label-md",
                  query.group === group ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
                )}
              >
                <span>{group}</span>
                <span>{countLabel(catalogueAnimals, group)}</span>
              </button>
            ))}
          </fieldset>
          <fieldset className="flex flex-col gap-space-xs">
            <legend className="font-label-caps text-label-caps text-secondary uppercase">Browse by region tag</legend>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tags group this sample. They are not native ranges.</p>
            {catalogueRegions.map((region) => (
              <button
                key={region}
                type="button"
                aria-pressed={query.region === region}
                onClick={() => setQuery((current) => ({ ...current, region }))}
                className={cn(
                  "rounded-full px-space-md py-space-xs text-left font-label-md text-label-md",
                  query.region === region ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {region}
              </button>
            ))}
          </fieldset>
          <fieldset className="flex flex-wrap gap-space-xs">
            <legend className="mb-space-xs w-full font-label-caps text-label-caps text-secondary uppercase">Natural color systems</legend>
            {catalogueColors.map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={query.color === color}
                onClick={() => setQuery((current) => ({ ...current, color }))}
                className={cn(
                  "rounded-full px-space-md py-space-xxs font-label-md text-label-md",
                  query.color === color ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
                )}
              >
                {color}
              </button>
            ))}
          </fieldset>
        </aside>
        <div className="flex flex-col gap-space-md lg:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
              {note} Showing {results.length} of {catalogueAnimals.length} curated species.
            </p>
            <label className="flex items-center gap-space-xs font-label-md text-label-md text-primary">
              Sort by
              <select
                className="rounded-full bg-surface-container-lowest px-space-md py-space-xxs font-body-sm text-body-sm"
                value={query.sort}
                onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value as CatalogueSort }))}
              >
                {catalogueSorts.map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {results.length === 0 ? (
            <p className="rounded-3xl bg-surface-container-lowest p-space-xl font-body-lg text-body-lg text-on-surface-variant">
              This curated sample has no species for that search or filter.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
              {results.map((animal) => {
                const active = marked.includes(animal.slug);
                return (
                  <li key={animal.slug} className="flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-atelier">
                    <div className="relative aspect-[4/3] bg-surface-container">
                      <EditorialImage
                        src={animal.image}
                        alt={animal.alt}
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 100vw"
                        priority={results[0]?.slug === animal.slug}
                      />
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={active ? `Unmark ${animal.commonName}` : `Mark ${animal.commonName}`}
                        onClick={() => toggle(animal)}
                        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-cream/80 text-on-surface-variant"
                      >
                        <Icon name="favorite" fill={active} className={cn("text-[18px]", active && "text-secondary")} />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
                      <div className="flex items-center gap-space-xs text-secondary">
                        <Icon name={animal.icon} className="text-[18px]" />
                        <h2 className="font-headline-sm text-headline-sm text-primary">{animal.commonName}</h2>
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary">{animal.scientificName}</p>
                      <p className="flex-1 font-body-md text-body-md text-on-surface-variant">{animal.summary}</p>
                      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        {animal.group} · {animal.region} tag · {animal.color}
                      </p>
                      <Link href={`${routes.animals}/${animal.slug}`} className="inline-flex items-center gap-space-xxs font-label-md text-label-md text-primary">
                        Explore
                        <Icon name="arrow_forward" className="text-[16px]" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <section className="rounded-3xl bg-surface-container-low p-space-xl">
            <h2 className="font-headline-sm text-headline-sm text-primary">Have a specific rare specimen in mind?</h2>
            <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Uploading a wildlife photograph into the Studio is not open. The Studio path arrives in a later phase. This catalogue does not extract a pattern from a file you provide.
            </p>
            <Link href={routes.studio} className="mt-space-md inline-flex items-center gap-space-xxs font-label-md text-label-md text-secondary">
              Read the Studio notice
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
