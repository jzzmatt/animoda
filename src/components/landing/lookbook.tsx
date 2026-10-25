"use client";

import Link from "next/link";
import { useState } from "react";
import { EditorialImage } from "@/components/public/editorial-image";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import {
  audiences,
  designsForAudience,
  featuredDesigns,
  illustrativeDisclaimer,
  pageGutter,
  routes,
  type Audience,
} from "@/content/site";
import { cn } from "@/lib/cn";

type LookbookProps = {
  initialAudience?: Audience;
  showExplore?: boolean;
};

export function Lookbook({ initialAudience = "All Pieces", showExplore = true }: LookbookProps) {
  const [audience, setAudience] = useState<Audience>(initialAudience);
  const [saved, setSaved] = useState<string[]>([]);
  const [note, setNote] = useState("No look is marked.");
  const designs = designsForAudience(audience);

  function toggleSaved(id: string, title: string) {
    const marked = saved.includes(id);
    setSaved((current) => (marked ? current.filter((item) => item !== id) : [...current, id]));
    setNote(
      marked
        ? `${title} is unmarked. Animoda has no saved wishlist.`
        : `${title} is marked for this visit on this page. Animoda has no saved wishlist.`,
    );
  }

  return (
    <section className="w-full bg-surface-subtle py-space-3xl" aria-labelledby="lookbook-title">
      <div className={cn("mx-auto max-w-7xl", pageGutter)}>
        <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Seasonal Lookbook</p>
            <h2
              id="lookbook-title"
              className="mt-space-xxs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl"
            >
              Signature Atelier Pieces
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs" role="group" aria-label="Audience">
            {audiences.map((item) => (
              <Chip key={item} selected={audience === item} onClick={() => setAudience(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>
        <p className="mb-space-lg max-w-3xl font-body-sm text-body-sm text-on-surface-variant">{illustrativeDisclaimer}</p>
        {designs.length === 0 ? (
          <p role="status" className="rounded-3xl bg-surface-container-lowest p-space-xl font-body-lg text-body-lg text-on-surface-variant">
            This preview has no unisex sample. All Pieces shows the women, men, and kids and youth samples.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => {
              const marked = saved.includes(design.id);
              return (
                <li
                  key={design.id}
                  id={design.id}
                  className="scroll-mt-24 group flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm transition-all duration-300 motion-safe:hover:shadow-xl"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
                    <EditorialImage
                      src={design.image}
                      alt={design.alt}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex max-w-[75%] flex-wrap gap-1">
                      <span className="rounded-full bg-surface-cream/90 px-space-xs py-0.5 font-label-caps text-label-caps text-secondary uppercase backdrop-blur-sm">
                        {design.species}
                      </span>
                      <span className="rounded-full bg-primary-container px-space-xs py-0.5 font-label-caps text-label-caps text-on-primary uppercase">
                        {design.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-pressed={marked}
                      aria-label={marked ? `Unmark ${design.title}` : `Mark ${design.title}`}
                      onClick={() => toggleSaved(design.id, design.title)}
                      className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-cream/80 text-on-surface-variant backdrop-blur-sm transition-colors hover:text-secondary"
                    >
                      <Icon name="favorite" fill={marked} className={cn("text-[18px]", marked && "text-secondary")} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-space-lg">
                    <div>
                      <div className="mb-space-xxs flex items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
                        <span className="font-label-caps text-secondary uppercase">{design.atelier}</span>
                        <span className="shrink-0 font-label-md font-bold text-primary">{design.priceLabel}</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">{design.title}</h3>
                      <p className="mt-space-xxs line-clamp-2 font-body-md text-body-md text-on-surface-variant">
                        {design.description}
                      </p>
                    </div>
                    <div className="mt-space-md flex items-center gap-space-xs border-t border-border-warm-subtle/50 pt-space-sm">
                      <Link
                        href={routes.studio}
                        className="flex-1 rounded-full bg-primary py-space-xs text-center font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container"
                      >
                        Try On Avatar
                      </Link>
                      <Link
                        href={`${routes.marketplace}#${design.id}`}
                        className="rounded-full bg-surface-container px-space-md py-space-xs font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-high"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p role="status" className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
          {note} Showing {designs.length} of {featuredDesigns.length} sample pieces.
        </p>
        {showExplore ? (
          <div className="mt-space-2xl text-center">
            <Link
              href={routes.marketplace}
              className="inline-flex items-center gap-space-xs rounded-full bg-surface-container-lowest px-space-2xl py-space-sm font-label-md text-label-md text-primary shadow-sm transition-all hover:bg-surface-container"
            >
              Explore All 240 Runway Concepts
              <Icon name="east" className="text-[18px]" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
