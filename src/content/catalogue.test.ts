import { describe, expect, it } from "vitest";
import {
  catalogueAnimals,
  filterCatalogue,
  filterDirections,
  occurrenceCaution,
} from "./catalogue";
import snapshot from "./wildlife-snapshot.json";

describe("animal catalogue", () => {
  it("filters by class, region, colour, and a landing alias", () => {
    expect(
      filterCatalogue(catalogueAnimals, { text: "", group: "Marine Life", region: "All regions", color: "All tones", sort: "catalogue" }).map(
        (animal) => animal.slug,
      ),
    ).toEqual([
      "halfmoon-male-betta",
      "black-moor",
      "fantail",
      "shubunkin",
      "livebearers",
      "pothos",
      "mandarin-fish",
      "moorish-idol",
      "picasso-triggerfish",
      "rusty-parrotfish",
    ]);
    expect(filterCatalogue(catalogueAnimals, { text: "", group: "All Animals", region: "Oceania", color: "All tones", sort: "catalogue" })).toEqual([]);
    expect(filterCatalogue(catalogueAnimals, { text: "viper", group: "All Animals", region: "All regions", color: "All tones", sort: "catalogue" }).map((animal) => animal.slug)).toEqual(["emerald-tree-boa"]);
    expect(filterCatalogue(catalogueAnimals, { text: "quagga", group: "Mammals", region: "Africa", color: "Monochrome", sort: "catalogue" }).map((animal) => animal.scientificName)).toEqual(["Equus quagga"]);
  });

  it("keeps youth directions on the youth filter and drops the fit score", () => {
    const zebra = catalogueAnimals.find((animal) => animal.slug === "plains-zebra");
    expect(zebra).toBeDefined();
    expect(filterDirections(zebra!, "Youth Couture").map((direction) => direction.id)).toEqual(["zebra-kids"]);
    expect(JSON.stringify(catalogueAnimals)).not.toContain("99.4");
    expect(JSON.stringify(catalogueAnimals)).not.toContain("14.8");
  });

  it("files the requested names under Marine Life without inventing their biology", () => {
    const marine = catalogueAnimals.filter((animal) => animal.group === "Marine Life");
    const bySlug = Object.fromEntries(marine.map((animal) => [animal.slug, animal]));
    expect(bySlug["halfmoon-male-betta"]?.scientificName).toBe("Betta splendens");
    expect(bySlug["halfmoon-male-betta"]?.summary).toContain("not a claim that this fish is marine");
    expect(bySlug["black-moor"]?.gbifUsageKey).toBe(4286942);
    expect(bySlug["fantail"]?.gbifUsageKey).toBe(bySlug["black-moor"]?.gbifUsageKey);
    expect(bySlug["shubunkin"]?.gbifUsageKey).toBe(bySlug["black-moor"]?.gbifUsageKey);
    expect(bySlug["livebearers"]?.scientificName).toBe("Poeciliidae");
    expect(bySlug["livebearers"]?.summary).toContain("not one species");
    expect(bySlug.pothos?.scientificName).toBe("Epipremnum aureum");
    expect(bySlug.pothos?.summary).toContain("A plant, not a fish");
    expect(bySlug["mandarin-fish"]?.scientificName).toBe("Synchiropus splendidus");
    expect(bySlug["mandarin-fish"]?.summary).toContain("Siniperca chuatsi");
    expect(bySlug["rusty-parrotfish"]?.scientificName).toBe("Scarus ferrugineus");
    expect(bySlug["moorish-idol"]?.scientificName).toBe("Zanclus cornutus");
    expect(bySlug["picasso-triggerfish"]?.scientificName).toBe("Rhinecanthus aculeatus");
    expect(
      filterCatalogue(catalogueAnimals, { text: "carassius", group: "All Animals", region: "All regions", color: "All tones", sort: "catalogue" }).map(
        (animal) => animal.slug,
      ),
    ).toEqual(["black-moor", "fantail", "shubunkin"]);
    expect(
      filterCatalogue(catalogueAnimals, { text: "pothos", group: "Marine Life", region: "All regions", color: "All tones", sort: "catalogue" }).map(
        (animal) => animal.slug,
      ),
    ).toEqual(["pothos"]);
    const species = snapshot.species as Record<string, { taxon: { usageKey: number } }>;
    for (const animal of catalogueAnimals) {
      expect(species[animal.slug]?.taxon.usageKey).toBe(animal.gbifUsageKey);
    }
    expect(snapshot.species.pothos?.taxon.kingdom).toBe("Plantae");
    expect(snapshot.species.livebearers?.taxon.rank).toBe("FAMILY");
  });

  it("does not treat a Democratic Republic of the Congo filter as a native range for the plains zebra", () => {
    const zebra = snapshot.species["plains-zebra"];
    const caution = occurrenceCaution({
      scientificName: "Equus quagga",
      countryCode: "CD",
      countryName: "Democratic Republic of the Congo",
      distributionCountryCodes: zebra.distributions.map((row) => row.country),
      quotedPlaces: zebra.distributions.map((row) => row.locality || row.country || "").filter(Boolean),
    });

    expect(zebra.democraticRepublicOfTheCongo.occurrenceCount).toBeGreaterThan(0);
    expect(zebra.distributions.map((row) => row.country)).not.toContain("CD");
    expect(caution).toContain("does not mark the species as native");
    expect(caution).toContain("do not list Democratic Republic of the Congo");
    expect(caution.toLowerCase()).not.toContain("is native");
  });
});
