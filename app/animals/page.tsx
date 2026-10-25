import type { Metadata } from "next";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = {
  title: "Animal Catalog",
  description:
    "Curated Animoda animal catalogue with GBIF taxonomy, occurrence records, and design readings. A country filter is not a native range.",
};

export default function AnimalsPage() {
  return (
    <PublicShell>
      <CatalogueBrowser />
    </PublicShell>
  );
}
