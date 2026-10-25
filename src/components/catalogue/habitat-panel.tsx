"use client";

import { useState } from "react";
import { explorerCountries } from "@/content/catalogue";
import type { WildlifeReport } from "@/server/wildlife";
import { OccurrenceMap } from "./occurrence-map";

export function HabitatPanel({ initial }: { initial: WildlifeReport }) {
  const [report, setReport] = useState(initial);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");

  async function onCountry(country: string) {
    setPending(true);
    setFailure("");
    try {
      const response = await fetch(`/api/wildlife/${initial.slug}${country ? `?country=${country}` : ""}`);
      if (!response.ok) throw new Error("Wildlife request failed");
      const next = (await response.json()) as WildlifeReport;
      setReport(next);
    } catch {
      setFailure("The wildlife request did not complete. The records already on this page stay visible.");
    } finally {
      setPending(false);
    }
  }

  const iucn = report.distributions.find((row) => row.source?.includes("IUCN") && row.threatStatus);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary">Occurrence records</h3>
          <p className="mt-space-xxs max-w-2xl font-body-sm text-body-sm text-on-surface-variant">{report.caution}</p>
        </div>
        <label className="flex flex-col gap-space-xxs font-label-md text-label-md text-primary">
          Country filter
          <select
            className="min-h-10 rounded-full bg-surface-container-lowest px-space-md py-space-xs font-body-md text-body-md text-neutral-dark shadow-sm"
            value={report.countryCode ?? ""}
            onChange={(event) => onCountry(event.target.value)}
          >
            <option value="">All countries in this sample</option>
            {explorerCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {failure ? (
        <p role="status" className="font-body-sm text-body-sm text-secondary">
          {failure}
        </p>
      ) : null}
      <p className="font-body-sm text-body-sm text-on-surface-variant" role="status">
        {pending ? "Loading records." : null}{" "}
        {report.source === "gbif" ? "Live GBIF response." : "Development snapshot from GBIF, used because the live request did not complete."}{" "}
        {report.occurrenceCount ?? report.occurrences.length} records in this response. Showing {report.occurrences.length} coordinates.
        Retrieved {report.retrievedAt}.
      </p>
      <OccurrenceMap points={report.occurrences} />
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Map style: OpenFreeMap Liberty. Points and taxonomy:{" "}
        <a className="text-secondary underline" href={report.gbifSpeciesUrl}>
          GBIF species {report.taxon.usageKey}
        </a>
        .
      </p>
      {iucn ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          GBIF relays threat status {iucn.threatStatus?.replaceAll("_", " ").toLowerCase()} from {iucn.source}
          {iucn.locality ? `, locality ${iucn.locality}` : ""}. Animoda is quoting that row.
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <caption className="sr-only">GBIF distribution rows quoted with their source</caption>
          <thead>
            <tr className="font-label-caps text-label-caps text-secondary uppercase">
              <th className="py-space-xs pr-space-sm">Place</th>
              <th className="py-space-xs pr-space-sm">Status</th>
              <th className="py-space-xs pr-space-sm">Establishment</th>
              <th className="py-space-xs pr-space-sm">Threat</th>
              <th className="py-space-xs">Source</th>
            </tr>
          </thead>
          <tbody>
            {report.distributions.map((row, index) => (
              <tr key={`${row.source}-${row.country}-${index}`} className="border-t border-border-warm-subtle/70 font-body-sm text-body-sm text-on-surface-variant">
                <td className="py-space-xs pr-space-sm">{row.locality || row.country || "Unspecified"}</td>
                <td className="py-space-xs pr-space-sm">{row.status || "—"}</td>
                <td className="py-space-xs pr-space-sm">{row.establishmentMeans || "—"}</td>
                <td className="py-space-xs pr-space-sm">{row.threatStatus || "—"}</td>
                <td className="py-space-xs">{row.source || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.occurrences.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          This response has no coordinates for the current filter. An empty coordinate list is not a statement that the species is absent, and it is not a native-range boundary.
        </p>
      ) : (
        <ul className="grid gap-space-xs sm:grid-cols-2">
          {report.occurrences.slice(0, 8).map((point, index) => (
            <li key={`${point.lat}-${point.lng}-${point.dataset}-${index}`} className="font-body-sm text-body-sm text-on-surface-variant">
              {point.country || "Unspecified country"} · {point.lat.toFixed(2)}, {point.lng.toFixed(2)} · {point.basisOfRecord || "record"}
              {point.year ? ` · ${point.year}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
