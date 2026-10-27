"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimalSilhouette } from "@/components/catalogue/animal-silhouette";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { animalBySlug, directionSettings, type SampleDirection } from "@/content/catalogue";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor, sampleDirections, type DirectionSetting } from "@/studio/session";
import { keptDirectionId } from "@/studio/jobs-client";
import { useStudio } from "@/studio/studio-provider";
import { useStudioJob } from "@/studio/use-studio-job";
import { BlockedStep } from "./blocked-step";
import { StudioJobNotice } from "./studio-job-notice";

export function SuggestionsStep() {
  const studio = useStudio();
  const jobState = useStudioJob("concept");
  const [setting, setSetting] = useState<DirectionSetting>("All Silhouettes");

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("suggestions", studio);
  if (needed) return <BlockedStep needed={needed} />;

  const animal = animalBySlug(studio.animalSlug ?? "");
  if (!animal) return <BlockedStep needed="animal" />;
  const selectedId = keptDirectionId(studio.directionId, jobState.job);
  const directions = sampleDirections(animal, studio.audience, setting);

  const regenerate = () => {
    void jobState.start({ animalSlug: animal.slug, directionId: selectedId, setting });
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Step 3 of 5 · Sample directions</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Sample directions for {studio.audience.toLowerCase()} — {animal.commonName}
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          These cards are the catalogue directions for {animal.scientificName}. Regenerating starts a server job. A mock job finishes as mock completed and does not call a provider, so this list stays the catalogue. Only the Emerald tree boa pilot can confirm stored images. Select one design to carry forward.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex gap-space-xs overflow-x-auto" role="group" aria-label="Silhouette">
          {directionSettings.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={setting === item}
              onClick={() => setSetting(item)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-space-md font-label-sm text-label-sm",
                setting === item ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={jobState.pending}
          className="inline-flex min-h-11 items-center gap-space-xxs rounded-full bg-surface-container px-space-md font-label-md text-label-md text-on-surface disabled:opacity-50"
        >
          <Icon name="auto_awesome" className="text-[18px]" />
          {jobState.pending ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
      <StudioJobNotice job={jobState.job} pending={jobState.pending} />

      {directions.length === 0 ? (
        <div role="status" className="rounded-xl bg-surface-container p-space-lg">
          <h2 className="font-title-md text-title-md text-primary">No sample direction for this choice</h2>
          <p className="mt-space-xs font-body-md text-on-surface-variant">
            This catalogue has no {setting === "All Silhouettes" ? studio.audience.toLowerCase() : setting.toLowerCase()} direction for {animal.commonName}. Change the audience, the silhouette, or the animal. Children’s directions stay age-appropriate, so an adult cut is not offered to girls or boys.
          </p>
          <div className="mt-space-md">
            <Button href="/studio/animal" variant="tonal">
              Change the animal or audience
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {directions.map((direction) => (
            <DirectionCard
              key={direction.id}
              direction={direction}
              commonName={animal.commonName}
              scientificName={animal.scientificName}
              selected={selectedId === direction.id}
              onSelect={() => studio.setDirection(direction.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm sm:flex-row sm:items-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {selectedId ? "One design is selected. It stays the reference in the next step." : "Select one design to continue."}
        </p>
        {selectedId ? (
          <Button href="/studio/look" icon="arrow_forward" iconPosition="end">
            Review the selected design
          </Button>
        ) : (
          <Button disabled>Review the selected design</Button>
        )}
      </div>
    </div>
  );
}

function DirectionCard({
  direction,
  commonName,
  scientificName,
  selected,
  onSelect,
}: {
  direction: SampleDirection;
  commonName: string;
  scientificName: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className={cn("flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm", selected && "ring-2 ring-golden-accent")}>
      {direction.image && direction.alt ? (
        <div className="relative aspect-[3/4] bg-surface-container">
          <EditorialImage src={direction.image} alt={direction.alt} sizes="(min-width: 1280px) 30vw, 100vw" />
        </div>
      ) : (
        <div className="flex aspect-[3/4] flex-col justify-between p-space-md">
          <AnimalSilhouette scientificName={scientificName} commonName={commonName} />
          <p className="font-body-sm text-body-sm text-on-surface-variant">No garment photograph is published for this direction. The outline is the species silhouette, not the garment.</p>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
        <p className="font-label-caps text-label-caps text-secondary uppercase">{direction.audience}</p>
        <h2 className="font-title-md text-title-md text-primary">{direction.title}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{direction.body}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Textile note: {direction.textile}</p>
        <button
          type="button"
          aria-pressed={selected}
          onClick={onSelect}
          className={cn(
            "mt-auto inline-flex min-h-11 items-center justify-center gap-space-xxs rounded-full px-space-md font-label-md text-label-md",
            selected ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface",
          )}
        >
          {selected ? <Icon name="check" className="text-[16px]" /> : null}
          {selected ? "Selected" : "Select this design"}
        </button>
      </div>
    </li>
  );
}
