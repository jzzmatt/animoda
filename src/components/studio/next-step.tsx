"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimalSilhouette } from "@/components/catalogue/animal-silhouette";
import { animalBySlug } from "@/content/catalogue";
import { pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";
import { BlockedStep } from "./blocked-step";

export function NextStep() {
  const studio = useStudio();
  const router = useRouter();

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("look", studio);
  if (needed) return <BlockedStep needed={needed} />;

  const animal = animalBySlug(studio.animalSlug ?? "");
  if (!animal || !studio.fashionSampleStyle) return <BlockedStep needed="sample" />;

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Couturier notes</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-lg md:text-headline-lg">
          What to do with this look
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          The selected Fashion Sample for {studio.audience.toLowerCase()}, inspired by {animal.commonName}. Nothing on this page is sent, paid, or shipped.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-gutter overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm md:grid-cols-[12rem_1fr]">
        <div className="relative min-h-40 bg-surface-container">
          <AnimalSilhouette scientificName={animal.scientificName} commonName={animal.commonName} className="h-full" />
        </div>
        <div className="flex flex-col gap-space-xxs p-space-lg">
          <p className="font-label-caps text-label-caps text-secondary uppercase">{studio.audience}</p>
          <h2 className="font-headline-sm text-headline-sm text-primary">Fashion Sample</h2>
          <p className="font-body-md text-on-surface-variant">
            {animal.commonName} ({animal.scientificName}) · {studio.audience}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{studio.fashionSampleStyle === "formal" ? "Formal Couture" : studio.fashionSampleStyle === "casual_street" ? "Casual & Streetwear" : "Youth Couture"}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-xl shadow-sm">
          <p className="font-label-caps text-label-caps text-secondary uppercase">This visit</p>
          <h2 className="font-headline-sm text-headline-sm text-primary">Keep this design here</h2>
          <p className="font-body-md text-on-surface-variant">
            Saving marks the design in this browser for the visit. It does not create an account, a wardrobe, or a downloadable lookbook.
          </p>
          <Button onClick={() => studio.saveVisit()} variant="tonal">
            {studio.savedThisVisit ? "Saved for this visit" : "Save for this visit"}
          </Button>
          {studio.savedThisVisit ? (
            <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
              Saved in this browser. An account gallery is a later phase.
            </p>
          ) : null}
        </section>

        <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-xl shadow-sm">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Manufacturing question</p>
          <h2 className="font-headline-sm text-headline-sm text-primary">Note a couturier question</h2>
          <p className="font-body-md text-on-surface-variant">
            This records your interest in a quotation for the selected design. It does not contact a couturier, produce a price, or arrange shipping.
          </p>
          <Button onClick={() => studio.noteQuotation()}>
            {studio.quotationNoted ? "Question noted" : "Note a quotation question"}
          </Button>
          {studio.quotationNoted ? (
            <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
              Noted for this visit only. No atelier received it.
            </p>
          ) : null}
          <Button href={routes.couturiers} variant="surface">
            See the couturier preview
          </Button>
        </section>
      </div>

      <div className="flex flex-col gap-space-sm sm:flex-row sm:justify-between">
        <Button href="/studio/look" variant="tonal">
          Back to the selected design
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            studio.reset();
            router.push("/studio");
          }}
        >
          Start a new look
        </Button>
      </div>
    </div>
  );
}
