import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicShell } from "@/components/layout/public-shell";
import { siteDescription } from "@/content/site";

export const metadata: Metadata = {
  title: "Discover Nature. Design Your Style.",
  description: siteDescription,
};

export default function HomePage() {
  return (
    <PublicShell>
      <LandingPage />
    </PublicShell>
  );
}
