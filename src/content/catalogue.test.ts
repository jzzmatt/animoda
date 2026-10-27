import { readFileSync } from "node:fs";
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
      "mandarin-fish",
      "moorish-idol",
      "picasso-triggerfish",
      "rusty-parrotfish",
    ]);
    expect(
      filterCatalogue(catalogueAnimals, { text: "", group: "All Animals", region: "Oceania", color: "All tones", sort: "catalogue" }).map(
        (animal) => animal.slug,
      ),
    ).toEqual(["victoria-crowned-pigeon"]);
    expect(filterCatalogue(catalogueAnimals, { text: "viper", group: "All Animals", region: "All regions", color: "All tones", sort: "catalogue" }).map((animal) => animal.slug)).toEqual(["emerald-tree-boa"]);
    expect(filterCatalogue(catalogueAnimals, { text: "quagga", group: "Mammals", region: "Africa", color: "Monochrome", sort: "catalogue" }).map((animal) => animal.scientificName)).toEqual(["Equus quagga"]);
  });

  it("uses a tiger photograph for the tiger and keeps the youth bomber as the garment", () => {
    const tiger = catalogueAnimals.find((animal) => animal.slug === "tiger");
    expect(tiger).toBeDefined();
    expect(tiger?.image).toBe("/catalogue/tiger.jpg");
    expect(tiger?.alt).toContain("Bengal tiger");
    expect(tiger?.imageCredit).toContain("Charles J. Sharp");
    expect(tiger?.imageCredit).toContain("CC BY-SA 4.0");
    expect(tiger?.imageSourceUrl).toBe(
      "https://commons.wikimedia.org/wiki/File:Bengal_tiger_(Panthera_tigris_tigris)_female_3.jpg",
    );
    expect(tiger?.directions[0]?.image).toBe("/stitch/design-tiger.jpg");
    expect(tiger?.directions[0]?.alt).toContain("bomber jackets");
    const portrait = readFileSync("public/catalogue/tiger.jpg");
    expect(portrait.subarray(0, 3).toString("hex")).toBe("ffd8ff");
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
    expect(marine.map((animal) => animal.slug)).not.toContain("pothos");
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
      filterCatalogue(catalogueAnimals, { text: "pothos", group: "All Animals", region: "All regions", color: "All tones", sort: "catalogue" }),
    ).toEqual([]);
    const species = snapshot.species as Record<string, { taxon: { usageKey: number; class: string } }>;
    for (const animal of catalogueAnimals) {
      expect(species[animal.slug]?.taxon.usageKey).toBe(animal.gbifUsageKey);
    }
    expect(snapshot.species.livebearers?.taxon.rank).toBe("FAMILY");
    expect(catalogueAnimals.map((animal) => animal.scientificName)).not.toContain("Epipremnum aureum");
  });

  it("places the supplied list in Insects, Reptiles, and Birds and keeps descriptive names honest", () => {
    const bySlug = Object.fromEntries(catalogueAnimals.map((animal) => [animal.slug, animal]));
    expect(bySlug["an-erebus"]?.group).toBe("Insects");
    expect(bySlug["army-green-moth"]?.scientificName).toBe("Daphnis nerii");
    expect(bySlug["calligrapher-beetle"]?.scientificName).toBe("Calligrapha philadelphica");
    expect(bySlug["thorny-cricket"]?.scientificName).toBe("Cosmoderus femoralis");
    expect(bySlug["thorny-cricket"]?.summary).toContain("Cosmoderus erinaceus");
    expect(bySlug["green-anaconda"]?.group).toBe("Reptiles");
    expect(bySlug["ploughshare-tortoise"]?.scientificName).toBe("Astrochelys yniphora");
    expect(bySlug["rainbow-bright-chameleon"]?.scientificName).toBe("Furcifer pardalis");
    expect(bySlug["rainbow-bright-chameleon"]?.summary).toContain("panther chameleon");
    expect(bySlug["phoenix-rooster"]?.scientificName).toBe("Gallus gallus");
    expect(bySlug["phoenix-rooster"]?.summary).toContain("not a separate wild species");
    expect(bySlug["majestic-eagle"]?.scientificName).toBe("Haliaeetus leucocephalus");
    expect(bySlug["majestic-eagle"]?.summary).toContain("bald eagle");
    expect(bySlug["short-eared-owl"]?.group).toBe("Birds");
    expect(bySlug["victoria-crowned-pigeon"]?.region).toBe("Oceania");
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
