import { Suspense, type ReactNode } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { StudioChrome } from "@/components/studio/studio-chrome";
import { StudioProvider } from "@/studio/studio-provider";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <PublicShell>
      <Suspense fallback={<p className="px-margin-mobile py-space-xl font-body-md text-on-surface-variant">Opening the studio…</p>}>
        <StudioProvider>
          <StudioChrome>{children}</StudioChrome>
        </StudioProvider>
      </Suspense>
    </PublicShell>
  );
}
