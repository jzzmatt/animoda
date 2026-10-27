import Image from "next/image";
import { useState } from "react";
import type { FashionSampleAudience, PublicFashionSample } from "@/content/fashion-samples";
import { fashionSampleAudiences, fashionSampleAudienceLabels } from "@/content/fashion-samples";
import { cn } from "@/lib/cn";

export function FashionSampleBoard({
  samples,
  audience,
  selectedId = null,
  onSelect,
}: {
  samples: readonly PublicFashionSample[];
  audience?: FashionSampleAudience;
  selectedId?: string | null;
  onSelect?: (sample: PublicFashionSample) => void;
}) {
  const groups = audience ? [audience] : [...fashionSampleAudiences];
  return (
    <div className="flex flex-col gap-space-xl">
      {groups.map((group) => {
        const items = samples.filter((sample) => sample.audience === group);
        return (
          <section key={group} aria-labelledby={`fashion-samples-${group}`}>
            <h3 id={`fashion-samples-${group}`} className="font-title-md text-title-md text-primary">
              {fashionSampleAudienceLabels[group]}
            </h3>
            <ul className="mt-space-sm grid gap-gutter md:grid-cols-2">
              {items.map((sample) => (
                <li key={`${sample.audience}:${sample.style}`}>
                  <FashionSampleCard sample={sample} selected={Boolean(sample.sampleId && sample.sampleId === selectedId)} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function FashionSampleCard({
  sample,
  selected,
  onSelect,
}: {
  sample: PublicFashionSample;
  selected: boolean;
  onSelect?: (sample: PublicFashionSample) => void;
}) {
  const ready = sample.presentation === "ready" && Boolean(sample.imageUrl);
  const [failed, setFailed] = useState(false);
  const showImage = ready && !failed && Boolean(sample.imageUrl);
  return (
    <article className={cn("flex h-full flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-atelier", selected && "ring-2 ring-golden-accent")}>
      <div className="relative aspect-[3/4] bg-surface-container">
        {showImage ? (
          <Image
            src={sample.imageUrl ?? ""}
            alt={`${sample.styleLabel} for ${sample.audienceLabel}`}
            fill
            sizes="(min-width: 1280px) 25vw, 100vw"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <p className="flex h-full items-center justify-center p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
            {sample.presentation === "preparing" ? "This Fashion Sample is being prepared." : sample.message}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-space-xs p-space-lg">
        <p className="font-label-caps text-label-caps text-secondary uppercase">{sample.styleLabel}</p>
        <h4 className="font-title-md text-title-md text-primary">{showImage && sample.title ? sample.title : sample.styleLabel}</h4>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {showImage ? sample.description : sample.message}
        </p>
        {onSelect ? (
          <button
            type="button"
            aria-pressed={selected}
            disabled={!showImage || !sample.sampleId}
            onClick={() => onSelect(sample)}
            className={cn(
              "mt-auto inline-flex min-h-11 items-center justify-center rounded-full px-space-md font-label-md text-label-md disabled:opacity-60",
              selected ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface",
            )}
          >
            {selected ? "Selected" : "Use This Fashion Sample"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
