import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { TextPage, TextSection } from "@/components/public/text-page";

export const metadata: Metadata = {
  title: "Notices",
  description: "Manufacturing and couturier notices open in Phase 8. This preview has no unread messages.",
};

export default function NoticesPage() {
  return (
    <PublicShell>
      <TextPage
        eyebrow="Phase 8"
        title="Notices"
        lede="Quotation updates and couturier messages open in Phase 8. This preview has no inbox and no unread mark."
      >
        <TextSection title="Empty inbox">
          <p>There is no notification to read. A later notice will describe a manufacturing request, a quotation, or an approval.</p>
        </TextSection>
      </TextPage>
    </PublicShell>
  );
}
