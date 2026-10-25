import type { Metadata } from "next";
import { Pillars } from "@/components/landing/pillars";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { studioJourney } from "@/content/site";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How Animoda moves from an animal study to a selected design, a try-on, and a couturier quotation.",
};

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Atelier process"
        title="How Animoda works"
        lede="Four stages stay separate: study an animal, review design concepts, try on the design you select, and ask an approved couturier for a quotation."
      >
        <TextSection id="fitting" title="Bespoke fitting">
          <ol className="flex flex-col gap-space-sm">
            {studioJourney.map((step) => (
              <li key={step.label}>
                <span className="font-label-md text-label-md text-primary">{step.label}. </span>
                {step.body}
              </li>
            ))}
          </ol>
          <p>
            A manufacturing request is a question to a couturier. It is not payment, completed production, or delivery. Animoda does not arrange shipping.
          </p>
        </TextSection>
      </TextPage>
      <Pillars />
    </PublicShell>
  );
}
