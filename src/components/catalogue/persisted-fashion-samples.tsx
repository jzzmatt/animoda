"use client";

import Image from "next/image";
import { useState } from "react";
import type { PersistedSampleSlot } from "@/content/persisted-samples";

export function PersistedFashionSamples({ animalName, slots }: { animalName: string; slots: PersistedSampleSlot[] }) {
  return (
    <section className="flex flex-col gap-space-md" aria-labelledby="stored-samples-title">
      <div>
        <p className="font-label-caps text-label-caps text-secondary uppercase">Fashion Samples</p>
        <h2 id="stored-samples-title" className="font-headline-md text-headline-md text-primary">
          Fashion Samples
        </h2>
        <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Available Fashion Samples for {animalName} show a saved image. A sample that is not available cannot be selected.
        </p>
      </div>
      <ul className="grid gap-gutter md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <li key={slot.style}>
            <SampleCard animalName={animalName} slot={slot} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SampleCard({ animalName, slot }: { animalName: string; slot: PersistedSampleSlot }) {
  const [phase, setPhase] = useState<"loading" | "ready" | "missing" | "error">(slot.imageUrl ? "loading" : "missing");
  const stored = Boolean(slot.imageUrl) && phase !== "error";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-atelier">
      <div className="relative aspect-[3/4] bg-surface-container">
        {slot.imageUrl && phase !== "error" ? (
          <Image
            src={slot.imageUrl}
            alt={`${slot.label}: ${slot.title ?? `${animalName} fashion sample`}`}
            fill
            sizes="(min-width: 1280px) 25vw, 100vw"
            className="object-cover"
            onLoad={() => setPhase("ready")}
            onError={() => setPhase("error")}
          />
        ) : null}
        {phase === "loading" ? (
          <p className="absolute inset-0 flex items-center justify-center font-body-sm text-body-sm text-on-surface-variant">
            Loading stored image
          </p>
        ) : null}
        {phase === "missing" || phase === "error" ? (
          <p className="flex h-full items-center justify-center p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
            This Fashion Sample is unavailable.
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
        <p className="font-label-caps text-label-caps text-secondary uppercase">{slot.label}</p>
        <h3 className="font-title-md text-title-md text-primary">{slot.title ?? slot.label}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {stored ? slot.description : "This Fashion Sample has not been generated yet."}
        </p>
      </div>
    </article>
  );
}
