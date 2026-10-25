import type { Metadata } from "next";
import { CouturierSpotlight } from "@/components/landing/couturier-spotlight";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { featuredDesigns } from "@/content/site";

export const metadata: Metadata = {
  title: "Couturiers",
  description: "Preview of sample couture houses. Couturier approval arrives in a later phase.",
};

export default function CouturiersPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Couturier preview"
        title="Featured couturiers"
        lede="Only an approved couturier will receive manufacturing requests. Approval, the dashboard, and quotations arrive in Phase 8. The houses below are samples from the landing designs."
      >
        <TextSection title="Sample houses">
          <ul className="flex flex-col gap-space-sm">
            {featuredDesigns.map((design) => (
              <li key={design.id} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-atelier">
                <p className="font-title-md text-title-md text-primary">{design.atelier}</p>
                <p>
                  Shown with {design.title}. {design.priceLabel} is a sample label.
                </p>
              </li>
            ))}
          </ul>
        </TextSection>
        <TextSection title="What a request will mean">
          <p>
            A customer asks an approved couturier for a manufacturing quotation. That request is not payment, completed production, or delivery. Animoda does not arrange shipping.
          </p>
        </TextSection>
      </TextPage>
      <CouturierSpotlight />
    </PublicShell>
  );
}
