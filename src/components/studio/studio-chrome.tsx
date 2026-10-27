"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";
import { missingFor, studioSteps, type StudioStepId } from "@/studio/session";
import { useStudio } from "@/studio/studio-provider";

const backHref: Record<StudioStepId, string> = {
  animal: routes.home,
  sample: "/studio",
  photo: "/studio/sample",
  look: "/studio/photo",
};

export function StudioChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const studio = useStudio();
  const current = studioSteps.find((step) => step.href === pathname) ?? studioSteps[0];
  const currentIndex = studioSteps.findIndex((step) => step.id === current.id);

  return (
    <div className="flex flex-col">
      <div className="sticky top-20 z-40 border-b border-border-warm-subtle/70 bg-surface-container-low/95 backdrop-blur-md">
        <div className={cn("mx-auto flex max-w-7xl flex-col gap-space-sm py-space-sm", pageGutter)}>
          <div className="flex items-center justify-between gap-space-sm">
            <Link
              href={backHref[current.id]}
              className="inline-flex min-h-11 items-center gap-space-xxs rounded-full px-space-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span className="font-label-sm text-label-sm">Back</span>
            </Link>
            <p className="hidden font-label-caps text-label-caps tracking-widest text-secondary uppercase sm:block">
              Guided Fashion Atelier
            </p>
            <Link
              href={routes.home}
              className="inline-flex min-h-11 items-center gap-space-xxs rounded-full px-space-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name="close" className="text-[16px]" />
              <span className="font-label-sm text-label-sm">Exit</span>
            </Link>
          </div>
          <nav aria-label="Studio steps" className="overflow-x-auto">
            <ol className="flex min-w-max items-center gap-space-xs pb-space-xxs">
              {studioSteps.map((step, index) => {
                const blocked = missingFor(step.id, studio);
                const state = index === currentIndex ? "current" : index < currentIndex && !blocked ? "complete" : "upcoming";
                return (
                  <li key={step.id} className="flex items-center gap-space-xs">
                    <Link
                      href={step.href}
                      aria-current={state === "current" ? "step" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-space-xs rounded-full px-space-xs",
                        state === "current" && "ring-2 ring-golden-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full font-label-sm text-label-sm font-bold",
                          state === "upcoming" ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-container text-on-primary",
                        )}
                      >
                        {state === "complete" ? <Icon name="check" className="text-[14px]" /> : index + 1}
                      </span>
                      <span
                        className={cn(
                          "font-label-sm text-label-sm whitespace-nowrap",
                          state === "current" ? "font-semibold text-primary" : "text-on-surface-variant",
                        )}
                      >
                        {step.label}
                      </span>
                    </Link>
                    {index < studioSteps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className={cn("hidden h-0.5 w-4 sm:block", state === "complete" ? "bg-golden-accent" : "bg-border-warm-subtle")}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
          {studio.storageWarning ? (
            <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
              {studio.storageWarning}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
