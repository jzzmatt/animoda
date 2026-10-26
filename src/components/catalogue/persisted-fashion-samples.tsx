"use client";

import Image from "next/image";
import { useState } from "react";
import type { PersistedSampleSlot } from "@/content/persisted-samples";

export function PersistedFashionSamples({ slots }: { slots: PersistedSampleSlot[] }) {
  return (
    <section className="flex flex-col gap-space-md" aria-labelledby="stored-samples-title">
      <div>
        <p className="font-label-caps text-label-caps text-secondary uppercase">Phase 6.1 pilot</p>
        <h2 id="stored-samples-title" className="font-headline-md text-headline-md text-primary">
          Stored fashion samples
        </h2>
        <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
          These three Emerald tree boa styles are read from stored catalogue records. A style appears only after its image is in Supabase Storage.
        </p>
      </div>
      <ul className="grid gap-gutter md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <li key={slot.style}>
            <SampleCard slot={slot} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SampleCard({ slot }: { slot: PersistedSampleSlot }) {
  const [phase, setPhase] = useState<"loading" | "ready" | "missing" | "error">(slot.imageUrl ? "loading" : "missing");
  const stored = Boolean(slot.imageUrl) && phase !== "error";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-atelier">
      <div className="relative aspect-[3/4] bg-surface-container">
        {slot.imageUrl && phase !== "error" ? (
          <Image
            src={slot.imageUrl}
            alt={`${slot.label}: ${slot.title ?? "Emerald tree boa fashion sample"}`}
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
            This style is not available from Storage.
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
        <p className="font-label-caps text-label-caps text-secondary uppercase">{slot.label}</p>
        <h3 className="font-title-md text-title-md text-primary">{slot.title ?? slot.label}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {stored ? slot.description : "No stored image is published for this style."}
        </p>
        {slot.recordId ? <p className="font-body-sm text-body-sm text-on-surface-variant">Record {slot.recordId}</p> : null}
      </div>
    </article>
  );
}
