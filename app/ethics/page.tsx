import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { infoPages } from "@/content/site";

export const metadata: Metadata = {
  title: "Ethical Sourcing",
  description: infoPages.ethics.lede,
};

export default function EthicsPage() {
  return (
    <PublicShell>
      <TextPage eyebrow="Ethical Sourcing" title={infoPages.ethics.title} lede={infoPages.ethics.lede}>
        <TextSection title="Inspiration, not animal products">
          <p>
            Colour, pattern, and silhouette come from the animal. The garment concept itself is cloth. This preview does not sell skins, feathers, ivory, or other animal products.
          </p>
        </TextSection>
        <TextSection title="Children">
          <p>Children&apos;s fashion in the lookbook is age-appropriate outerwear. Studio choices for girls and boys stay distinct when that workflow opens.</p>
        </TextSection>
        <TextSection title="Sample fibre claims">
          <p>
            The landing figure “100% Ethical natural fibers” is a design sample. It is not a verified fibre audit of a finished garment.
          </p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
