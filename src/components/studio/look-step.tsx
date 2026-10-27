"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/public/editorial-image";
import { animalBySlug } from "@/content/catalogue";
import type { PublicFashionSample } from "@/content/fashion-samples";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";
import { useStudioJob } from "@/studio/use-studio-job";
import { BlockedStep } from "./blocked-step";
import { StudioJobNotice } from "./studio-job-notice";

export function LookStep() {
  const studio = useStudio();
  const jobState = useStudioJob("try-on");
  const [sample, setSample] = useState<PublicFashionSample | null>(null);
  const [checkedId, setCheckedId] = useState<string | null>(null);

  useEffect(() => {
    if (!studio.animalSlug || !studio.fashionSampleId) return;
    const slug = studio.animalSlug;
    const sampleId = studio.fashionSampleId;
    const controller = new AbortController();
    void fetch(`/api/fashion-samples/${slug}`, { signal: controller.signal, headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const body = (await response.json()) as { samples?: PublicFashionSample[] };
        const match = body.samples?.find((item) => item.sampleId === sampleId && item.presentation === "ready") ?? null;
        setSample(match);
        setCheckedId(sampleId);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setSample(null);
        setCheckedId(sampleId);
      });
    return () => controller.abort();
  }, [studio.animalSlug, studio.fashionSampleId]);

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("look", studio);
  if (needed) return <BlockedStep needed={needed} />;
  const animal = animalBySlug(studio.animalSlug ?? "");
  if (!animal || !studio.fashionSampleId) return <BlockedStep needed="sample" />;
  const checked = checkedId === studio.fashionSampleId;

  const requestPreview = () => {
    if (!sample?.sampleId) return;
    void jobState.start({ animalSlug: animal.slug, fashionSampleId: sample.sampleId });
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Step 4 of 4 · Your look</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Your selected Fashion Sample
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          The selected Fashion Sample stays the reference for {animal.commonName}. Requesting a personalized look does not upload the photograph and does not generate an image. Virtual try-on is not available.
        </p>
      </header>

      {!checked ? <p role="status">Checking the selected Fashion Sample…</p> : null}
      {checked && !sample ? (
        <div role="alert" className="rounded-xl bg-surface-container p-space-lg">
          <h2 className="font-title-md text-title-md text-primary">This Fashion Sample is not available</h2>
          <p className="mt-space-xs font-body-md text-on-surface-variant">
            It cannot be used for a personalized look. Choose an available Fashion Sample.
          </p>
          <div className="mt-space-md">
            <Button href="/studio/sample" variant="tonal">
              Choose a Fashion Sample
            </Button>
          </div>
        </div>
      ) : null}

      {sample ? (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
            <div className="relative aspect-[3/4] bg-surface-container">
              {studio.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={studio.photoDataUrl} alt="Your portrait for this studio visit" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <figcaption className="p-space-md font-body-sm text-body-sm text-on-surface-variant">
              Your photograph stays in this browser.
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm ring-2 ring-golden-accent">
            <div className="relative aspect-[3/4] bg-surface-container">
              {sample.imageUrl ? (
                <EditorialImage src={sample.imageUrl} alt={`${sample.styleLabel} for ${sample.audienceLabel}`} sizes="(min-width: 1024px) 40vw, 100vw" />
              ) : null}
            </div>
            <figcaption className="p-space-md">
              <p className="font-label-caps text-label-caps text-secondary uppercase">{sample.audienceLabel}</p>
              <p className="font-title-md text-title-md text-primary">{sample.styleLabel}</p>
              <p className="mt-space-xxs font-body-sm text-body-sm text-on-surface-variant">{sample.title}</p>
            </figcaption>
          </figure>
        </div>
      ) : null}

      {sample ? (
        <section className="rounded-xl bg-surface-container p-space-lg">
          <h2 className="font-title-md text-title-md text-primary">Personalized fashion</h2>
          <p className="mt-space-xs font-body-md text-on-surface-variant">
            This request keeps the selected Fashion Sample. It does not call an image provider, upload the photograph, or make a composite.
          </p>
          <div className="mt-space-md">
            <Button onClick={requestPreview} disabled={jobState.pending}>
              {jobState.pending ? "Sending the request…" : "Request personalized fashion"}
            </Button>
          </div>
          <div className="mt-space-sm">
            <StudioJobNotice job={jobState.job} pending={jobState.pending} />
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-space-sm sm:flex-row sm:justify-between">
        <Button href="/studio/photo" variant="tonal">
          Back to your photograph
        </Button>
      </div>
    </div>
  );
}
