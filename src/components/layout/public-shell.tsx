import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-space-sm focus:left-space-sm focus:z-[60] focus:rounded-full focus:bg-primary focus:px-space-md focus:py-space-xs focus:text-on-primary"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="w-full min-w-0 bg-surface pt-20">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
