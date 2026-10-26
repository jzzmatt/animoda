import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogueAnimals } from "./catalogue";
import { silhouetteCoverage, silhouetteFor } from "./silhouettes";
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

  it("shows a fallback for a missing silhouette and ignores an external address", () => {
    expect(silhouetteFor("Giraffa camelopardalis")).toBeNull();
    expect(silhouetteFor("https://example.invalid/zebra.svg")).toBeNull();
    const markup = renderToStaticMarkup(<AnimalSilhouette scientificName="Giraffa camelopardalis" commonName="Giraffe" />);
    expect(markup).toContain("No silhouette is published for Giraffe");
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("Equus quagga");
    expect(markup).not.toContain("/stitch/");
  });

  it("reports coverage for the actual catalogue without animal-specific component branches", () => {
    const coverage = silhouetteCoverage(catalogueAnimals);
    expect(coverage.total).toBe(catalogueAnimals.length);
    expect(coverage.valid).toBe(16);
    expect(coverage.missing).toContain("giraffe");
    expect(coverage.missing).toContain("indian-peacock");
    expect(coverage.missing).not.toContain("plains-zebra");
    expect(coverage.missing).not.toContain("leopard");
    const component = readFileSync("src/components/catalogue/animal-silhouette.tsx", "utf8");
    expect(component).not.toMatch(/plains-zebra|Panthera|if \(slug/);
    const added = renderToStaticMarkup(<AnimalSilhouette scientificName="Imaginus inventa" commonName="Added animal" />);
    expect(added).toContain("No silhouette is published for Added animal");
  });
});
