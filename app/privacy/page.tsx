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
          <p>
            The studio can keep a photograph in this browser. A concept request sends the selected animal and garment description to OpenAI. It does not send the photograph. A try-on request sends that photograph and the selected design to OpenAI on the server so it can make a visualization.
          </p>
          <p>
            The result is an AI visualization, not a guaranteed representation of a finished garment, its measurements, or its fit. Photographs and try-on images are not published. They stay in server memory for this process and are not a private gallery.
          </p>
        </TextSection>
        <TextSection title="What Animoda does not do here">
          <p>There is no shipping address, payment record, or delivery tracking, because Animoda does not arrange shipping or take payment in this preview.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
