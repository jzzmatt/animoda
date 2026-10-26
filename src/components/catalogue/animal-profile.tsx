"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimalSilhouette } from "@/components/catalogue/animal-silhouette";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { HabitatPanel } from "@/components/catalogue/habitat-panel";
import {
  directionSettings,
  filterDirections,
  type CatalogueAnimal,
} from "@/content/catalogue";
import { pageGutter, routes } from "@/content/site";
import type { WildlifeReport } from "@/server/wildlife";
import type { PersistedSampleSlot } from "@/content/persisted-samples";
import { PersistedFashionSamples } from "@/components/catalogue/persisted-fashion-samples";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "gallery", label: "Gallery" },
  { id: "habitat", label: "Habitat & records" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AnimalProfile({
  animal,
  wildlife,
  storedSamples = null,
}: {
  animal: CatalogueAnimal;
  wildlife: WildlifeReport;
  storedSamples?: PersistedSampleSlot[] | null;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [setting, setSetting] = useState<(typeof directionSettings)[number]>("All Silhouettes");
  const [marked, setMarked] = useState(false);
  const directions = filterDirections(animal, setting);
  const gallery = [{ src: animal.image, alt: animal.alt }];
  for (const direction of animal.directions) {
    if (!direction.image || !direction.alt || gallery.some((image) => image.src === direction.image)) continue;
    gallery.push({ src: direction.image, alt: direction.alt });
  }

  return (
    <article className={cn("mx-auto flex max-w-7xl flex-col gap-space-2xl py-space-3xl", pageGutter)}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
        <Link href={routes.home} className="hover:text-primary">Discover</Link>
        <span aria-hidden="true">/</span>
        <Link href={routes.animals} className="hover:text-primary">Animal Discovery</Link>
        <span aria-hidden="true">/</span>
        <span className="min-w-0 break-words text-primary">{wildlife.taxon.scientificName}</span>
      </nav>
      <header className="grid min-w-0 items-end gap-gutter lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Taxonomic record</p>
          <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
            {animal.commonName}
          </h1>
          <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
            {wildlife.taxon.scientificName} · GBIF {wildlife.taxon.rank.toLowerCase() || "record"}
            {wildlife.taxon.className ? ` · ${wildlife.taxon.className}` : ""}
          </p>
          {animal.aliases.length > 0 ? (
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
              Also labelled in the public site as {animal.aliases.join(", ")}.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-space-sm lg:col-span-5 lg:justify-end">
          <a className="font-label-md text-label-md text-secondary underline" href={wildlife.gbifSpeciesUrl}>
            Open GBIF record
          </a>
          <button
            type="button"
            aria-pressed={marked}
            onClick={() => setMarked((value) => !value)}
            className="inline-flex items-center gap-space-xxs rounded-full bg-surface-container px-space-md py-space-xs font-label-md text-label-md text-primary"
          >
            <Icon name="bookmark" fill={marked} className="text-[18px]" />
            {marked ? "Marked for this visit" : "Mark this profile"}
          </button>
        </div>
      </header>
      <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
        {marked
          ? "This profile is marked for this visit. Animoda has no saved swatch list."
          : "Marking a profile stays in this visit. Animoda has no saved swatch list."}
      </p>
      <div className="grid min-w-0 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-container">
            <EditorialImage src={animal.image} alt={animal.alt} sizes="(min-width: 1024px) 40vw, 100vw" priority />
          </div>
          {animal.imageCredit ? (
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
              {animal.imageSourceUrl ? (
                <a className="underline" href={animal.imageSourceUrl}>
                  {animal.imageCredit}
                </a>
              ) : (
                animal.imageCredit
              )}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-space-md lg:col-span-7">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Design reading</p>
          <h2 className="font-headline-md text-headline-md text-primary">{animal.designTitle}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{animal.designBody}</p>
          <div>
            <p className="font-label-caps text-label-caps text-secondary uppercase">Design swatches</p>
            <ul className="mt-space-sm flex flex-wrap gap-space-sm">
              {animal.swatches.map((swatch) => (
                <li key={swatch.hex} className="flex items-center gap-space-xs">
                  <span className="h-8 w-8 rounded-full border border-border-warm-subtle" style={{ backgroundColor: swatch.hex }} />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {swatch.name}
                    <span className="block uppercase">{swatch.hex}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-secondary uppercase">Species silhouette</p>
            <AnimalSilhouette scientificName={animal.scientificName} commonName={animal.commonName} className="mt-space-sm max-w-xs" />
          </div>
          <dl className="grid grid-cols-2 gap-space-sm font-body-sm text-body-sm text-on-surface-variant sm:grid-cols-3">
            <div>
              <dt className="font-label-caps text-label-caps uppercase">Kingdom</dt>
              <dd>{wildlife.taxon.kingdom}</dd>
            </div>
            <div>
              <dt className="font-label-caps text-label-caps uppercase">Order</dt>
              <dd>{wildlife.taxon.order}</dd>
            </div>
            <div>
              <dt className="font-label-caps text-label-caps uppercase">Family</dt>
              <dd>{wildlife.taxon.family}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div role="tablist" aria-label="Species profile" className="flex flex-wrap gap-space-xs">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-space-md py-space-xs font-label-md text-label-md",
              tab === item.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
            )}
          >
            {item.label}
            {item.id === "gallery" ? ` (${gallery.length})` : ""}
          </button>
        ))}
      </div>
      <section id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" hidden={tab !== "overview"} className="scroll-mt-24">
        <p className="max-w-3xl font-body-lg text-body-lg text-on-surface-variant">{animal.summary}</p>
        <p className="mt-space-sm max-w-3xl font-body-md text-body-md text-on-surface-variant">
          Taxonomy is the GBIF species match for {animal.scientificName}, usage key {wildlife.taxon.usageKey}, match type {wildlife.taxon.matchType}. Source of this view: {wildlife.source === "gbif" ? "live GBIF" : "the development snapshot"}.
        </p>
      </section>
      <section id="panel-gallery" role="tabpanel" aria-labelledby="tab-gallery" hidden={tab !== "gallery"} className="scroll-mt-24">
        <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((image) => (
            <li key={image.src}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface-container">
                <EditorialImage src={image.src} alt={image.alt} sizes="(min-width: 1024px) 30vw, 100vw" />
              </div>
              {animal.imageCredit ? (
                <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">{animal.imageCredit}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      {tab === "habitat" ? (
        <section id="panel-habitat" role="tabpanel" aria-labelledby="tab-habitat" className="scroll-mt-24">
          <div id="habitat" className="scroll-mt-24">
            <HabitatPanel initial={wildlife} />
          </div>
        </section>
      ) : null}
      {storedSamples ? <PersistedFashionSamples animalName={animal.commonName} slots={storedSamples} /> : null}
      <section className="flex flex-col gap-space-md" aria-labelledby="directions-title">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <p className="font-label-caps text-label-caps text-secondary uppercase">Sample directions</p>
            <h2 id="directions-title" className="font-headline-md text-headline-md text-primary">
              Fashion inspiration
            </h2>
            <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
              {storedSamples
                ? "These cards remain the written catalogue directions. They are not the stored pilot images."
                : "These directions are written samples. The Studio does not generate them yet. A direction is a digital concept, not a garment in stock."}
            </p>
          </div>
          <div className="flex flex-wrap gap-space-xs" role="group" aria-label="Silhouette">
            {directionSettings.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={setting === item}
                onClick={() => setSetting(item)}
                className={cn(
                  "rounded-full px-space-md py-space-xxs font-label-md text-label-md",
                  setting === item ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {directions.length === 0 ? (
          <p role="status" className="font-body-md text-body-md text-on-surface-variant">
            This species has no sample direction in that silhouette.
          </p>
        ) : (
          <ul className="grid gap-gutter md:grid-cols-2 xl:grid-cols-3">
            {directions.map((direction) => (
              <li key={direction.id} className="flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-atelier">
                {direction.image && direction.alt ? (
                  <div className="relative aspect-[3/4] bg-surface-container">
                    <EditorialImage src={direction.image} alt={direction.alt} sizes="(min-width: 1280px) 25vw, 100vw" />
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] flex-col justify-between p-space-md">
                    <AnimalSilhouette scientificName={animal.scientificName} commonName={animal.commonName} />
                    <p className="font-body-sm text-body-sm text-on-surface-variant">No garment photograph is published for this direction. The outline is the species silhouette, not the garment.</p>
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
                  <p className="font-label-caps text-label-caps text-secondary uppercase">{direction.audience}</p>
                  <h3 className="font-title-md text-title-md text-primary">{direction.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{direction.body}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Textile note: {direction.textile}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link href={`${routes.studio}?animal=${animal.slug}`} className="inline-flex items-center gap-space-xxs font-label-md text-label-md text-secondary">
          Start a look from this animal
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </section>
    </article>
  );
}
