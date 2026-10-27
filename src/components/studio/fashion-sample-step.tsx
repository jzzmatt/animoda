"use client";

import { useEffect, useState } from "react";
import { FashionSampleBoard } from "@/components/fashion/fashion-sample-board";
import { Button } from "@/components/ui/button";
import { animalBySlug } from "@/content/catalogue";
import { isFashionSampleAudience, type FashionSampleAudience, type PublicFashionSample } from "@/content/fashion-samples";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor, studioAudiences } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";
import { BlockedStep } from "./blocked-step";

export function FashionSampleStep() {
  const studio = useStudio();
  const [samples, setSamples] = useState<PublicFashionSample[] | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audienceId = studio.audience.toLowerCase();
  const audience: FashionSampleAudience = isFashionSampleAudience(audienceId) ? audienceId : "women";

  useEffect(() => {
    if (!studio.animalSlug) return;
    const slug = studio.animalSlug;
    const controller = new AbortController();
    void fetch(`/api/fashion-samples/${slug}`, { signal: controller.signal, headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const body = (await response.json()) as { samples?: PublicFashionSample[] };
        setError(null);
        setSamples(body.samples ?? []);
        setLoadedSlug(slug);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("Fashion Samples could not be loaded. Nothing new was generated.");
        setSamples([]);
        setLoadedSlug(slug);
      });
    return () => controller.abort();
  }, [studio.animalSlug]);

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("sample", studio);
  if (needed) return <BlockedStep needed={needed} />;
  const animal = animalBySlug(studio.animalSlug ?? "");
  if (!animal) return <BlockedStep needed="animal" />;
  const loading = studio.animalSlug !== loadedSlug;
  const selected = samples?.find((sample) => sample.sampleId && sample.sampleId === studio.fashionSampleId && sample.presentation === "ready");

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Step 2 of 4 · Fashion Samples</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Choose a Fashion Sample
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          These are the Fashion Samples for {animal.commonName}. Choose who the look is for, then use an available sample. An unavailable sample cannot be selected.
        </p>
      </header>
      <div className="flex flex-wrap gap-space-xs" role="group" aria-label="Audience">
        {studioAudiences.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={studio.audience === item}
            onClick={() => studio.setAudience(item)}
            className={cn(
              "min-h-11 rounded-full px-space-md font-label-md text-label-md",
              studio.audience === item ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {loading ? <p role="status">Loading Fashion Samples…</p> : null}
      {error ? (
        <p role="alert" className="font-body-md text-on-surface-variant">
          {error}
        </p>
      ) : null}
      {!loading && samples ? (
        <FashionSampleBoard
          samples={samples}
          audience={audience}
          selectedId={studio.fashionSampleId}
          onSelect={(sample) => {
            if (!sample.sampleId || sample.presentation !== "ready") return;
            studio.setFashionSample({ id: sample.sampleId, style: sample.style });
          }}
        />
      ) : null}
      <div className="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-container-lowest px-space-md py-space-md shadow-sm sm:flex-row sm:items-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {selected ? `${selected.styleLabel} for ${selected.audienceLabel} is selected.` : "Select an available Fashion Sample to continue."}
        </p>
        {selected ? (
          <Button href="/studio/photo" icon="arrow_forward" iconPosition="end">
            Continue to your photograph
          </Button>
        ) : (
          <Button disabled>Continue to your photograph</Button>
        )}
      </div>
    </div>
  );
}
