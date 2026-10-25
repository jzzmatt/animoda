"use client";

import { useState } from "react";
import { brandColors, screenColors } from "@/design/tokens";
import { audienceChips, foundationCopy, studioSteps } from "@/foundation/copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { MediaCard } from "@/components/ui/media-card";
import { Stepper, type StepState } from "@/components/ui/stepper";
import { TextField } from "@/components/ui/text-field";
import { Wordmark } from "@/components/ui/wordmark";

const swatches: Array<{ name: string; hex: string; token: string }> = [
  { name: "Primary", hex: screenColors.primary, token: "primary" },
  { name: "Forest", hex: screenColors["primary-container"], token: "primary-container" },
  { name: "Secondary", hex: screenColors.secondary, token: "secondary" },
  { name: "Terracotta container", hex: screenColors["secondary-container"], token: "secondary-container" },
  { name: "Gold", hex: screenColors["golden-accent"], token: "golden-accent" },
  { name: "Cream", hex: screenColors["surface-cream"], token: "surface-cream" },
  { name: "Surface", hex: screenColors.surface, token: "surface" },
  { name: "Ink", hex: screenColors["neutral-dark"], token: "neutral-dark" },
  { name: "Brand earth", hex: brandColors.earth, token: "brand-earth" },
  { name: "Brand terracotta", hex: brandColors.terracotta, token: "brand-terracotta" },
];

function currentSteps(activeId: string) {
  const activeIndex = studioSteps.findIndex((step) => step.id === activeId);
  return studioSteps.map((step, index) => {
    const state: StepState =
      index < activeIndex ? "complete" : index === activeIndex ? "current" : "upcoming";
    return { ...step, state };
  });
}

export function FoundationGallery() {
  const [audience, setAudience] = useState<(typeof audienceChips)[number]>("All Pieces");
  const [activeStep, setActiveStep] = useState<(typeof studioSteps)[number]["id"]>("animal");
  const [favoriteNote, setFavoriteNote] = useState("No design is saved.");

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <a
        href="#foundation-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-space-sm focus:left-space-sm focus:z-50 focus:rounded-full focus:bg-primary focus:px-space-md focus:py-space-xs focus:text-on-primary"
      >
        Skip to foundation content
      </a>
      <header className="sticky top-0 z-40 border-b border-border-warm-subtle/60 bg-surface-cream/85 shadow-nav backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-md px-margin-mobile md:px-margin">
          <Wordmark />
          <p className="font-label-caps text-label-caps text-secondary uppercase">Design foundation</p>
        </div>
      </header>
      <main id="foundation-main" className="mx-auto flex max-w-7xl flex-col gap-space-3xl px-margin-mobile py-space-2xl md:px-margin">
        <section className="grid items-end gap-gutter lg:grid-cols-12" aria-labelledby="foundation-title">
          <div className="lg:col-span-7">
            <p className="mb-space-md inline-flex items-center rounded-full bg-surface-container px-space-sm py-space-xxs font-label-caps text-label-caps text-secondary uppercase">
              {foundationCopy.bannerEyebrow}
            </p>
            <h1 id="foundation-title" className="font-display-hero-mobile text-display-hero-mobile text-primary md:font-display-hero md:text-display-hero">
              {foundationCopy.bannerTitle}
            </h1>
            <p className="mt-space-md max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              {foundationCopy.bannerBody}
            </p>
          </div>
          <div className="rounded-3xl bg-surface-container-lowest p-space-xl shadow-atelier lg:col-span-5">
            <p className="font-display-hero-mobile text-display-hero-mobile text-primary">
              {foundationCopy.taglineLead}
              <span className="mt-space-xxs block font-serif text-[0.82em] font-normal italic text-secondary">
                {foundationCopy.taglineAccent}
              </span>
            </p>
          </div>
        </section>

        <section aria-labelledby="colors-title" className="flex flex-col gap-space-lg">
          <div>
            <h2 id="colors-title" className="font-headline-lg text-headline-lg text-primary">
              {foundationCopy.colorsTitle}
            </h2>
            <p className="mt-space-xs max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
              {foundationCopy.colorsBody}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-gutter-mobile sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map((swatch) => (
              <li key={swatch.token} className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-atelier">
                <div className="h-20" style={{ backgroundColor: swatch.hex }} />
                <div className="p-space-sm">
                  <p className="font-label-md text-label-md text-primary">{swatch.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant uppercase">{swatch.hex}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type-title" className="flex flex-col gap-space-md">
          <h2 id="type-title" className="font-headline-lg text-headline-lg text-primary">
            {foundationCopy.typeTitle}
          </h2>
          <p className="max-w-3xl font-body-lg text-body-lg text-on-surface-variant">{foundationCopy.typeBody}</p>
          <div className="grid gap-gutter md:grid-cols-2">
            <p className="font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
              Headline for a collection
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Body copy keeps a generous line height for fabric notes, habitats, and fitting instructions.
            </p>
            <p className="font-label-caps text-label-caps text-secondary uppercase">Equus quagga · Unisex · Formal</p>
            <p className="font-title-md text-title-md text-primary">Title for a design card</p>
          </div>
        </section>

        <section aria-labelledby="actions-title" className="flex flex-col gap-space-md">
          <h2 id="actions-title" className="font-headline-lg text-headline-lg text-primary">
            {foundationCopy.buttonsTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-space-sm">
            <Button icon="arrow_forward" iconPosition="end">
              Create My Look
            </Button>
            <Button variant="surface" icon="travel_explore">
              Explore Animals
            </Button>
            <Button variant="container">Create My Look</Button>
            <Button variant="outline">Replace Photo</Button>
            <Button variant="tonal" icon="videocam">
              Retake
            </Button>
            <Button variant="danger" icon="delete" size="sm">
              Remove
            </Button>
            <IconButton label="Search catalogue" icon="search" />
            <IconButton label="Notifications" icon="notifications" pip />
          </div>
        </section>

        <section aria-labelledby="chips-title" className="flex flex-col gap-space-md">
          <div>
            <h2 id="chips-title" className="font-headline-lg text-headline-lg text-primary">
              {foundationCopy.chipsTitle}
            </h2>
            <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">{foundationCopy.chipsBody}</p>
          </div>
          <div className="flex flex-wrap gap-space-xs" role="group" aria-label="Audience">
            {audienceChips.map((chip) => (
              <Chip key={chip} selected={audience === chip} onClick={() => setAudience(chip)}>
                {chip}
              </Chip>
            ))}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant" role="status">
            Selected audience: {audience}
          </p>
        </section>

        <section aria-labelledby="cards-title" className="flex flex-col gap-space-md">
          <div>
            <h2 id="cards-title" className="font-headline-lg text-headline-lg text-primary">
              {foundationCopy.cardsTitle}
            </h2>
            <p className="mt-space-xs max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
              {foundationCopy.cardsBody}
            </p>
          </div>
          <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
            <MediaCard
              title="Savannah asymmetrical gown"
              description="A specimen card for the garment frame. The photograph arrives with the public lookbook."
              eyebrow="Sample atelier"
              meta="Design concept"
              badges={[
                { label: "Equus quagga", tone: "cream" },
                { label: "Women · Formal", tone: "forest" },
              ]}
              favoriteLabel="Save specimen"
              onFavorite={() => setFavoriteNote("Specimen marked. Nothing was stored.")}
              action={<Badge tone="gold">Illustrative</Badge>}
            />
            <MediaCard
              title="Forest evening cloth"
              description="Pattern, texture, and palette sit in the caption. This frame is not a garment in stock."
              eyebrow="Digital concept"
              badges={[{ label: "Unisex", tone: "forest" }]}
            />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant" role="status">
            {favoriteNote}
          </p>
        </section>

        <section aria-labelledby="fields-title" className="grid gap-gutter lg:grid-cols-2">
          <div>
            <h2 id="fields-title" className="font-headline-lg text-headline-lg text-primary">
              {foundationCopy.fieldsTitle}
            </h2>
            <div className="mt-space-md flex flex-col gap-space-md">
              <TextField id="specimen-name" label="Design name" placeholder="Savannah gown" hint="A fitting note stays with the design." />
              <TextField id="specimen-email" label="Email address" type="email" shape="pill" placeholder="name@atelier.example" error="Enter an email address to continue." />
            </div>
          </div>
          <div className="rounded-3xl border border-border-warm-subtle bg-surface-container-lowest p-space-xl shadow-atelier">
            <h2 className="font-headline-md text-headline-md text-primary">{foundationCopy.elevationTitle}</h2>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
              Cards sit on warm white with a hairline border and a forest-tinted shadow. Navigation uses a cream frost.
            </p>
            <div className="mt-space-lg rounded-2xl bg-surface-cream/85 p-space-md shadow-nav backdrop-blur-md">
              <p className="font-label-caps text-label-caps text-primary uppercase">Frosted navigation</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="stepper-title" className="flex flex-col gap-space-md">
          <div>
            <h2 id="stepper-title" className="font-headline-lg text-headline-lg text-primary">
              {foundationCopy.stepperTitle}
            </h2>
            <p className="mt-space-xs font-body-lg text-body-lg text-on-surface-variant">{foundationCopy.stepperBody}</p>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-space-md">
            <Stepper label="Animoda Studio steps" steps={currentSteps(activeStep)} />
          </div>
          <div className="flex flex-wrap gap-space-xs">
            {studioSteps.map((step) => (
              <Chip key={step.id} selected={activeStep === step.id} onClick={() => setActiveStep(step.id)}>
                {step.label}
              </Chip>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
