import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";
import { infoPages } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Charter",
  description: infoPages.privacy.lede,
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <TextPage eyebrow="Privacy Charter" title={infoPages.privacy.title} lede={infoPages.privacy.lede}>
        <TextSection title="What this preview holds">
          <p>These pages store nothing you type into the newsletter field. The address is discarded in the browser.</p>
          <p>Marking a look on the lookbook stays on that page for the visit. There is no account and no saved wishlist.</p>
        </TextSection>
        <TextSection title="Photographs and try-on">
          <p>This preview does not ask for a photograph and does not send an image to a provider.</p>
          <p>
            When the Studio opens, a photograph and a selected design may be processed by the configured AI provider. That processing will be described before you continue, and a result will not be published without your consent.
          </p>
        </TextSection>
        <TextSection title="What Animoda does not do here">
          <p>There is no shipping address, payment record, or delivery tracking, because Animoda does not arrange shipping or take payment in this preview.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
