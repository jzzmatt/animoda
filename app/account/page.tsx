import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";

export const metadata: Metadata = {
  title: "Account",
  description: "Animoda accounts open in Phase 6. Public pages can be read without signing in.",
};

export default function AccountPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Phase 6"
        title="Account"
        lede="Sign-in, profiles, and the private gallery open in Phase 6. You can read the public site without an account."
      >
        <TextSection title="Public discovery">
          <p>The landing page, sample animals, marketplace preview, and couturier preview stay open. Photographs and try-ons are not collected on this page.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
