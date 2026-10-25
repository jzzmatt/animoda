import { AnimalRail } from "./animal-rail";
import { ClosingBanner } from "./closing-banner";
import { CouturierSpotlight } from "./couturier-spotlight";
import { Hero } from "./hero";
import { Lookbook } from "./lookbook";
import { Pillars } from "./pillars";

export function LandingPage() {
  return (
    <>
      <Hero />
      <AnimalRail />
      <Pillars />
      <Lookbook />
      <CouturierSpotlight />
      <ClosingBanner />
    </>
  );
}
