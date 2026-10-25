import snapshotFile from "@/content/wildlife-snapshot.json";
import {
  animalBySlug,
  countryName,
  occurrenceCaution,
  type CountryCode,
  explorerCountries,
} from "@/content/catalogue";

export type DistributionRow = {
  locality: string | null;
  country: string | null;
  status: string | null;
  establishmentMeans: string | null;
  threatStatus: string | null;
  source: string | null;
};

export type OccurrencePoint = {
  lat: number;
  lng: number;
  country: string | null;
  countryCode: string | null;
  basisOfRecord: string | null;
  dataset: string | null;
  year: string | null;
};

export type WildlifeTaxon = {
  usageKey: number;
  scientificName: string;
  canonicalName: string;
  rank: string;
  status: string;
  matchType: string;
  kingdom: string;
  phylum: string;
  className: string;
  order: string;
  family: string;
  genus: string;
};

export type WildlifeReport = {
  slug: string;
  source: "gbif" | "development-snapshot";
  retrievedAt: string;
  taxon: WildlifeTaxon;
  distributions: DistributionRow[];
  occurrences: OccurrencePoint[];
  occurrenceCount: number | null;
  countryCode: string | null;
  countryName: string | null;
  caution: string;
  gbifSpeciesUrl: string;
};

type SnapshotSpecies = {
  taxon: {
    usageKey: number;
    scientificName: string;
    canonicalName: string;
    rank: string;
    status: string;
    matchType: string;
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
  };
  distributions: DistributionRow[];
  occurrences: OccurrencePoint[];
  occurrenceCount: number | null;
  democraticRepublicOfTheCongo: {
    occurrenceCount: number | null;
    occurrences: OccurrencePoint[];
  };
};

const snapshot = snapshotFile as unknown as {
  retrievedAt: string;
  species: Record<string, SnapshotSpecies>;
};

const GBIF_HEADERS = {
  Accept: "application/json",
  "User-Agent": "AnimodaCatalogue/0.1 (phase 3 preview)",
};

export function isCountryCode(value: string): value is CountryCode {
  return explorerCountries.some((country) => country.code === value);
}

function taxonFromSnapshot(row: SnapshotSpecies["taxon"]): WildlifeTaxon {
  return {
    usageKey: row.usageKey,
    scientificName: row.scientificName,
    canonicalName: row.canonicalName,
    rank: row.rank,
    status: row.status,
    matchType: row.matchType,
    kingdom: row.kingdom,
    phylum: row.phylum,
    className: row.class,
    order: row.order,
    family: row.family,
    genus: row.genus,
  };
}

function cautionFor(scientificName: string, countryCode: string | null, distributions: DistributionRow[]): string {
  const places = distributions
    .map((row) => row.locality || row.country)
    .filter((place): place is string => Boolean(place));
  return occurrenceCaution({
    scientificName,
    countryCode,
    countryName: countryName(countryCode),
    distributionCountryCodes: distributions.map((row) => row.country),
    quotedPlaces: [...new Set(places)],
  });
}

function fromSnapshot(slug: string, countryCode: string | null): WildlifeReport {
  const animal = animalBySlug(slug);
  const row = snapshot.species[slug];
  if (!animal || !row) {
    throw new Error(`No wildlife snapshot for ${slug}`);
  }
  const taxon = taxonFromSnapshot(row.taxon);
  const normalize = (points: OccurrencePoint[]) =>
    points.map((point) => ({ ...point, year: point.year == null ? null : String(point.year) }));
  let occurrences = normalize(row.occurrences);
  let occurrenceCount = row.occurrenceCount;
  if (countryCode === "CD") {
    occurrences = normalize(row.democraticRepublicOfTheCongo.occurrences);
    occurrenceCount = row.democraticRepublicOfTheCongo.occurrenceCount;
  } else if (countryCode) {
    occurrences = normalize(row.occurrences.filter((point) => point.countryCode === countryCode));
    occurrenceCount = occurrences.length;
  }
  return {
    slug,
    source: "development-snapshot",
    retrievedAt: snapshot.retrievedAt,
    taxon,
    distributions: row.distributions,
    occurrences,
    occurrenceCount,
    countryCode,
    countryName: countryName(countryCode),
    caution: cautionFor(taxon.canonicalName || animal.scientificName, countryCode, row.distributions),
    gbifSpeciesUrl: `https://www.gbif.org/species/${taxon.usageKey}`,
  };
}

function asPoint(record: Record<string, unknown>): OccurrencePoint | null {
  const lat = record.decimalLatitude;
  const lng = record.decimalLongitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const year = record.year;
  return {
    lat,
    lng,
    country: typeof record.country === "string" ? record.country : null,
    countryCode: typeof record.countryCode === "string" ? record.countryCode : null,
    basisOfRecord: typeof record.basisOfRecord === "string" ? record.basisOfRecord : null,
    dataset: typeof record.datasetName === "string" ? record.datasetName : null,
    year: typeof year === "number" || typeof year === "string" ? String(year) : null,
  };
}

async function gbifJson(path: string): Promise<unknown> {
  const response = await fetch(`https://api.gbif.org/v1/${path}`, {
    headers: GBIF_HEADERS,
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`GBIF ${response.status}`);
  return response.json();
}

export async function loadWildlife(slug: string, countryCode?: string | null): Promise<WildlifeReport> {
  const animal = animalBySlug(slug);
  if (!animal) throw new Error(`Unknown species ${slug}`);
  const code = countryCode && isCountryCode(countryCode) ? countryCode : null;
  try {
    const [match, distributionsPayload, occurrencePayload] = await Promise.all([
      gbifJson(`species/match?name=${encodeURIComponent(animal.scientificName)}`),
      gbifJson(`species/${animal.gbifUsageKey}/distributions?limit=100`),
      gbifJson(
        `occurrence/search?taxonKey=${animal.gbifUsageKey}&hasCoordinate=true&limit=40${code ? `&country=${code}` : ""}`,
      ),
    ]);
    const matchRow = match as Record<string, unknown>;
    const usageKey = typeof matchRow.usageKey === "number" ? matchRow.usageKey : animal.gbifUsageKey;
    const taxon: WildlifeTaxon = {
      usageKey,
      scientificName: String(matchRow.scientificName ?? animal.scientificName),
      canonicalName: String(matchRow.canonicalName ?? animal.scientificName),
      rank: String(matchRow.rank ?? ""),
      status: String(matchRow.status ?? ""),
      matchType: String(matchRow.matchType ?? ""),
      kingdom: String(matchRow.kingdom ?? ""),
      phylum: String(matchRow.phylum ?? ""),
      className: String(matchRow.class ?? ""),
      order: String(matchRow.order ?? ""),
      family: String(matchRow.family ?? ""),
      genus: String(matchRow.genus ?? ""),
    };
    const distributionResults = ((distributionsPayload as { results?: Record<string, unknown>[] }).results ?? []).map(
      (row) => ({
        locality: typeof row.locality === "string" ? row.locality : null,
        country: typeof row.country === "string" ? row.country : null,
        status: typeof row.status === "string" ? row.status : null,
        establishmentMeans: typeof row.establishmentMeans === "string" ? row.establishmentMeans : null,
        threatStatus: typeof row.threatStatus === "string" ? row.threatStatus : null,
        source: typeof row.source === "string" ? row.source : null,
      }),
    );
    const occurrenceResults = ((occurrencePayload as { results?: Record<string, unknown>[] }).results ?? [])
      .map(asPoint)
      .filter((point): point is OccurrencePoint => point !== null);
    const count = (occurrencePayload as { count?: number }).count;
    return {
      slug,
      source: "gbif",
      retrievedAt: new Date().toISOString(),
      taxon,
      distributions: distributionResults,
      occurrences: occurrenceResults,
      occurrenceCount: typeof count === "number" ? count : occurrenceResults.length,
      countryCode: code,
      countryName: countryName(code),
      caution: cautionFor(taxon.canonicalName, code, distributionResults),
      gbifSpeciesUrl: `https://www.gbif.org/species/${usageKey}`,
    };
  } catch {
    return fromSnapshot(slug, code);
  }
}
