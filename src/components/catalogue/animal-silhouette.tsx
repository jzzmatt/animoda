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
      <div className={cn("flex aspect-square items-center bg-[#F8F3E8] p-space-sm", className)} role="img" aria-label={`No silhouette is published for ${commonName}, ${scientificName}`}>
        <p className="font-body-sm text-body-sm text-[#3E3A36]">No silhouette is published for {commonName}.</p>
      </div>
    );
  }

  return (
    <figure className={cn("flex flex-col gap-space-xxs", className)}>
      <div className="flex aspect-square items-center justify-center bg-[#F8F3E8] p-space-sm">
        {/* Local SVG outlines are not optimized by next/image. A failed file falls back in this component. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={record.src}
          alt={label}
          width={record.width ?? 512}
          height={record.height ?? 512}
          className="max-h-full max-w-full object-contain"
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
