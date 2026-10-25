import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { studioJourney } from "@/content/site";

export const metadata: Metadata = {
  title: "Studio",
  description: "The Animoda Studio journey opens in Phase 4. This page is the public destination for Create My Look.",
};

export default function StudioPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Phase 4"
        title="Animoda Studio"
        lede="Create My Look, try-on, and the five-step studio open in Phase 4. This page is the destination for those links. No photograph is uploaded and no design is generated here."
      >
        <TextSection title="The journey that will open">
          <ol className="flex flex-col gap-space-sm">
            {studioJourney.map((step) => (
              <li key={step.label}>
                <span className="font-label-md text-label-md text-primary">{step.label}. </span>
                {step.body}
              </li>
            ))}
          </ol>
          <p>A try-on will use the design you select. The provider will not be described as a guarantee of likeness.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
