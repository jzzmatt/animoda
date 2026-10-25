import type { Metadata } from "next";
import { Lookbook } from "@/components/landing/lookbook";
import { PublicShell } from "@/components/layout/public-shell";
import { illustrativeDisclaimer, offerDistinctions, pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Preview of Animoda fashion concepts. These cards are digital designs, not garments in stock.",
};

export default function MarketplacePage() {
  return (
    <PublicShell>
      <header className={cn("mx-auto max-w-7xl py-space-3xl", pageGutter)}>
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Marketplace preview</p>
        <h1 className="mt-space-xs max-w-3xl font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          Featured fashion designs
        </h1>
        <p className="mt-space-md max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
          The cards below are digital concepts from the landing lookbook. A later marketplace will separate three kinds of offer.
        </p>
        <ul className="mt-space-xl grid gap-gutter md:grid-cols-3">
          {offerDistinctions.map((item) => (
            <li key={item.title} className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-atelier">
              <h2 className="font-title-md text-title-md text-primary">{item.title}</h2>
              <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-space-lg max-w-3xl font-body-sm text-body-sm text-on-surface-variant">{illustrativeDisclaimer}</p>
      </header>
      <Lookbook showExplore={false} />
    </PublicShell>
  );
}
