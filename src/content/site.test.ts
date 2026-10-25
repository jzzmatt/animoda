import { describe, expect, it } from "vitest";
import {
  couturierSpotlight,
  designsForAudience,
  featuredDesigns,
  heroHighlights,
  illustrativeDisclaimer,
  siteDescription,
} from "./site";

describe("public site content", () => {
  it("filters the sample lookbook by audience", () => {
    expect(designsForAudience("All Pieces")).toHaveLength(featuredDesigns.length);
    expect(designsForAudience("Women").map((design) => design.id)).toEqual(["zebra-gown"]);
    expect(designsForAudience("Men").map((design) => design.id)).toEqual(["peacock-tuxedo"]);
    expect(designsForAudience("Kids & Youth").map((design) => design.id)).toEqual(["tiger-bomber"]);
    expect(designsForAudience("Unisex")).toEqual([]);
  });

  it("labels sample commerce as illustrative and avoids a fit-accuracy claim", () => {
    const blob = JSON.stringify({
      illustrativeDisclaimer,
      siteDescription,
      heroHighlights,
      couturierSpotlight,
      featuredDesigns,
    });

    expect(illustrativeDisclaimer).toContain("design samples");
    expect(illustrativeDisclaimer).toContain("does not take payment");
    expect(blob).not.toContain("99.4%");
    expect(couturierSpotlight.metrics.map((metric) => metric.label)).toContain("Days avg. Paris delivery");
  });
});
