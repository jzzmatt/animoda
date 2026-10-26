import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogueAnimals } from "./catalogue";
import { silhouetteCoverage, silhouetteDepictsRelated, silhouetteFor } from "./silhouettes";
import { AnimalSilhouette } from "@/components/catalogue/animal-silhouette";

describe("animal silhouettes", () => {
  it("keeps the plains zebra silhouette and gives other animals their own files", () => {
    const zebra = silhouetteFor("Equus quagga");
    const leopard = silhouetteFor("Panthera pardus");
    const goldfish = silhouetteFor("Carassius auratus");
    expect(zebra?.src).toMatch(/^\/silhouettes\/[0-9a-f-]{36}\.svg$/);
    expect(leopard?.src).toMatch(/^\/silhouettes\/[0-9a-f-]{36}\.svg$/);
    expect(zebra?.src).not.toBe(leopard?.src);
    expect(goldfish?.src).not.toBe(zebra?.src);
    expect(readFileSync(`public${zebra?.src}`, "utf8")).toContain("<svg");
    expect(readFileSync(`public${leopard?.src}`, "utf8")).toContain("<svg");
    const zebraMarkup = renderToStaticMarkup(<AnimalSilhouette scientificName="Equus quagga" commonName="Plains zebra" />);
    expect(zebraMarkup).toContain(zebra?.src ?? "");
    expect(zebraMarkup).toContain("Silhouette of Plains zebra, Equus quagga");
    expect(zebraMarkup).not.toContain("Panthera pardus");
  });

  it("uses one species silhouette for every catalogue entry with that scientific name", () => {
    const goldfish = catalogueAnimals.filter((animal) => animal.scientificName === "Carassius auratus");
    expect(goldfish.map((animal) => animal.slug).sort()).toEqual(["black-moor", "fantail", "shubunkin"]);
    const srcs = new Set(goldfish.map((animal) => silhouetteFor(animal.scientificName)?.src));
    expect(srcs.size).toBe(1);
    expect([...srcs][0]).toBeTruthy();
  });

  it("shows a fallback for an unknown animal and ignores an external address", () => {
    expect(silhouetteFor("https://example.invalid/zebra.svg")).toBeNull();
    const markup = renderToStaticMarkup(<AnimalSilhouette scientificName="Imaginus inventa" commonName="Added animal" />);
    expect(markup).toContain("No silhouette is published for Added animal");
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("Equus quagga");
    expect(markup).not.toContain("/stitch/");
  });

  it("gives every catalogue animal a local outline and names a related taxon when the drawing is not exact", () => {
    const coverage = silhouetteCoverage(catalogueAnimals);
    expect(coverage.total).toBe(catalogueAnimals.length);
    expect(coverage.valid).toBe(catalogueAnimals.length);
    expect(coverage.missing).toEqual([]);
    const giraffe = silhouetteFor("Giraffa camelopardalis");
    const peacock = silhouetteFor("Pavo cristatus");
    const python = silhouetteFor("Python regius");
    expect(giraffe?.depictedName).toBe("Giraffa tippelskirchi");
    expect(silhouetteDepictsRelated(giraffe!)).toBe(true);
    expect(peacock?.depictedName).toBe("Pavo muticus");
    expect(python?.license).toBe("CC BY 4.0");
    expect(python?.attribution).toBe("DS Biswas");
    expect(silhouetteDepictsRelated(silhouetteFor("Gallus gallus")!)).toBe(false);
    const names = new Set(catalogueAnimals.map((animal) => animal.scientificName));
    const srcByName = new Map<string, string>();
    for (const name of names) {
      const record = silhouetteFor(name);
      expect(record, name).toBeTruthy();
      const svg = readFileSync(`public${record?.src}`, "utf8");
      expect(svg).toContain("<svg");
      expect(svg).not.toContain("data:image");
      expect(record?.license).not.toMatch(/NC/);
      srcByName.set(name, record?.src ?? "");
    }
    expect(srcByName.get("Equus quagga")).not.toBe(srcByName.get("Giraffa camelopardalis"));
    expect(srcByName.get("Erebus macrops")).not.toBe(srcByName.get("Horama panthalon"));
    expect(srcByName.get("Corallus caninus")).not.toBe(srcByName.get("Eunectes murinus"));
    const giraffeMarkup = renderToStaticMarkup(<AnimalSilhouette scientificName="Giraffa camelopardalis" commonName="Giraffe" />);
    expect(giraffeMarkup).toContain(giraffe?.src ?? "");
    expect(giraffeMarkup).toContain("Related outline of Giraffa tippelskirchi");
    expect(giraffeMarkup).not.toContain("No silhouette is published for Giraffe");
    const component = readFileSync("src/components/catalogue/animal-silhouette.tsx", "utf8");
    expect(component).not.toMatch(/plains-zebra|Panthera|if \(slug/);
  });
});
