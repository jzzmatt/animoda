import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved looks require an account. The private gallery opens in Phase 6.",
};

export default function WishlistPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Phase 6"
        title="Wishlist"
        lede="A heart on the lookbook marks a card for that visit only. A saved wishlist needs an account, which opens in Phase 6."
      >
        <TextSection title="What you can do now">
          <p>Browse the marketplace preview. Marking a look does not create an account or store a design.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
