"use client";

import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/public/editorial-image";
import { animalBySlug } from "@/content/catalogue";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor, sampleDirections } from "@/studio/session";
import { keptDirectionId } from "@/studio/jobs-client";
import { useStudio } from "@/studio/studio-provider";
import { useStudioJob } from "@/studio/use-studio-job";
import { BlockedStep } from "./blocked-step";
import { StudioJobNotice } from "./studio-job-notice";

export function LookStep() {
  const studio = useStudio();
  const jobState = useStudioJob("try-on");

  if (!studio.ready) {
    return <p className={cn("py-space-xl font-body-md text-on-surface-variant", pageGutter)}>Opening the studio…</p>;
  }
  const needed = missingFor("look", studio);
  if (needed) return <BlockedStep needed={needed} />;

  const animal = animalBySlug(studio.animalSlug ?? "");
  const directionId = keptDirectionId(studio.directionId, jobState.job);
  const direction = animal?.directions.find((item) => item.id === directionId);
  if (!animal || !direction) return <BlockedStep needed="suggestions" />;
  const related = sampleDirections(animal, studio.audience, "All Silhouettes").filter((item) => item.id !== direction.id);

  const requestPreview = () => {
    void jobState.start({ animalSlug: animal.slug, directionId: direction.id, setting: null });
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-space-xl py-space-xl", pageGutter)}>
      <header className="max-w-3xl">
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">Step 4 of 5 · Selected design</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Your selected design
        </h1>
        <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">
          {direction.title} stays the reference for {animal.commonName} ({animal.scientificName}). A try-on request sends this photograph and that design to OpenAI on the server. The result is an AI visualization, not a guaranteed representation of the finished garment, its measurements, or its fit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <figure className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
          <div className="relative aspect-[3/4] bg-surface-container">
            {studio.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={studio.photoDataUrl} alt="Your portrait for this studio visit" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <figcaption className="p-space-md font-body-sm text-body-sm text-on-surface-variant">
            Your photograph. It is not a measured calibration.
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm ring-2 ring-golden-accent">
          <div className="relative aspect-[3/4] bg-surface-container">
            {direction.image && direction.alt ? (
              <EditorialImage src={direction.image} alt={direction.alt} sizes="(min-width: 1024px) 40vw, 100vw" />
            ) : (
              <div className="flex h-full items-end p-space-lg">
                <p className="font-body-md text-on-surface-variant">This direction has a textile note and no photograph.</p>
              </div>
            )}
          </div>
          <figcaption className="p-space-md">
            <p className="font-label-caps text-label-caps text-secondary uppercase">Selected design</p>
            <p className="font-title-md text-title-md text-primary">{direction.title}</p>
            <p className="mt-space-xxs font-body-sm text-body-sm text-on-surface-variant">{direction.textile}</p>
          </figcaption>
        </figure>
      </div>

      <section className="rounded-xl bg-surface-container p-space-lg">
        <h2 className="font-title-md text-title-md text-primary">Try-on preview</h2>
        <p className="mt-space-xs font-body-md text-on-surface-variant">
          Requesting a preview does not change the selected design. The photograph is sent only for this visualization and is not published. An unchanged photograph is not treated as a successful try-on.
        </p>
        <div className="mt-space-md flex flex-wrap gap-space-sm">
          <Button onClick={requestPreview} disabled={jobState.pending}>
            {jobState.pending ? "Requesting a preview…" : "Request a try-on preview"}
          </Button>
          {jobState.job && !jobState.pending ? (
            <Button variant="tonal" onClick={requestPreview}>
              Request the preview again
            </Button>
          ) : null}
        </div>
        <div className="mt-space-sm">
          <StudioJobNotice job={jobState.job} pending={jobState.pending} />
        </div>
        {jobState.job?.composite ? (
          <figure className="mt-space-md overflow-hidden rounded-2xl bg-surface-container-lowest">
            {/* The try-on is a visit-scoped server image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={jobState.job.composite} alt="AI visualization of the selected outfit on your photograph" className="aspect-[3/4] w-full object-cover" />
            <figcaption className="p-space-md font-body-sm text-body-sm text-on-surface-variant">
              AI visualization. This is not a guaranteed representation of the finished garment, and it does not measure fit or confirm that the garment can be made.
            </figcaption>
          </figure>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary">Other directions for this choice</h2>
          <ul className="mt-space-md grid grid-cols-1 gap-space-sm md:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    studio.setDirection(item.id);
                    jobState.clear();
                  }}
                  className="flex min-h-11 w-full flex-col rounded-2xl bg-surface-container-lowest p-space-md text-left shadow-sm"
                >
                  <span className="font-label-caps text-label-caps text-secondary uppercase">{item.audience}</span>
                  <span className="font-title-md text-title-md text-primary">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-space-sm sm:flex-row sm:justify-between">
        <Button href="/studio/suggestions" variant="tonal">
          Back to suggestions
        </Button>
        <Button href="/studio/next" icon="arrow_forward" iconPosition="end">
          Continue to next steps
        </Button>
      </div>
    </div>
  );
}
