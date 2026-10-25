import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { illustrativeDisclaimer, infoPages } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: infoPages.terms.lede,
};

export default function TermsPage() {
  return (
    <PublicShell>
      <TextPage eyebrow="Terms of Service" title={infoPages.terms.title} lede={infoPages.terms.lede}>
        <TextSection title="Illustrative content">
          <p>{illustrativeDisclaimer}</p>
        </TextSection>
        <TextSection title="Future manufacturing requests">
          <p>
            A later request to a couturier asks for a quotation to make a design. Sending that request is not payment and is not completed manufacture. Animoda does not provide a shipping service.
          </p>
        </TextSection>
        <TextSection title="Designs">
          <p>
            Concepts on this site are original animal-inspired garments for women, men, girls, boys, and unisex wardrobes. A children&apos;s concept stays age-appropriate. Selecting a design keeps that design as the reference for a later try-on.
          </p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
