import manifest from "./silhouettes.json";

export type SilhouetteRecord = {
  scientificName: string;
  src: string;
  attribution: string | null;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  width: number | null;
  height: number | null;
};

const localSilhouetteSrc = /^\/silhouettes\/[0-9a-f-]{36}\.svg$/;

const byScientificName = new Map<string, SilhouetteRecord>(
  (manifest.records as SilhouetteRecord[]).map((record) => [record.scientificName, record]),
);

/** A silhouette is resolved from the scientific name. The component does not branch on an animal id. */
export function silhouetteFor(scientificName: string): SilhouetteRecord | null {
  const record = byScientificName.get(scientificName);
  if (!record || !localSilhouetteSrc.test(record.src)) return null;
  return record;
}

export function silhouetteCoverage(animals: readonly { slug: string; scientificName: string }[]) {
  const missing = animals.filter((animal) => !silhouetteFor(animal.scientificName)).map((animal) => animal.slug);
  return {
    total: animals.length,
    valid: animals.length - missing.length,
    missing,
  };
}

export const silhouetteManifestNote = manifest.source;
