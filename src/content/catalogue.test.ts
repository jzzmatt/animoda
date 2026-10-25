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
    expect(filterCatalogue(catalogueAnimals, { text: "", group: "Marine Life", region: "All regions", color: "All tones", sort: "catalogue" })).toEqual([]);
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
