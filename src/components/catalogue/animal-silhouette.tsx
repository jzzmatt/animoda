"use client";

import { useState } from "react";
import { silhouetteDepictsRelated, silhouetteFor } from "@/content/silhouettes";
import { cn } from "@/lib/cn";

type AnimalSilhouetteProps = {
  scientificName: string;
  commonName: string;
  className?: string;
};

export function AnimalSilhouette({ scientificName, commonName, className }: AnimalSilhouetteProps) {
  const record = silhouetteFor(scientificName);
  const [failed, setFailed] = useState(false);
  const related = record ? silhouetteDepictsRelated(record) : false;
  const label = related
    ? `Silhouette for ${commonName}, ${scientificName}. The outline depicts ${record?.depictedName}.`
    : `Silhouette of ${commonName}, ${scientificName}`;

  if (!record || failed) {
    return (
      <div className={cn("flex aspect-square w-full items-center bg-[#F8F3E8] p-space-sm", className)} role="img" aria-label={`No silhouette is published for ${commonName}, ${scientificName}`}>
        <p className="font-body-sm text-body-sm text-[#3E3A36]">No silhouette is published for {commonName}.</p>
      </div>
    );
  }

  return (
    <figure className={cn("flex w-full min-w-0 flex-col gap-space-xxs", className)}>
      <div className="relative aspect-square w-full overflow-hidden bg-[#F8F3E8]">
        {/* Local SVG outlines are not optimized by next/image. A failed file falls back in this component. */}
        {/* The frame size comes from the square, so a very tall file such as the anaconda cannot expand the page. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={record.src}
          alt={label}
          width={record.width ?? 512}
          height={record.height ?? 512}
          className="absolute inset-0 h-full w-full object-contain p-space-sm"
          onError={() => setFailed(true)}
        />
      </div>
      <figcaption className="font-body-sm text-body-sm text-on-surface-variant">
        {related ? <span>Related outline of {record.depictedName}. </span> : null}
        <a className="underline" href={record.sourceUrl}>
          {record.attribution ? `Silhouette by ${record.attribution}` : "Silhouette"}
        </a>
        {" · "}
        <a className="underline" href={record.licenseUrl}>
          {record.license}
        </a>
      </figcaption>
    </figure>
  );
}
