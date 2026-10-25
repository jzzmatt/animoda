import type { ReactNode } from "react";
import { pageGutter } from "@/content/site";
import { cn } from "@/lib/cn";

export function TextPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className={cn("mx-auto flex max-w-3xl flex-col gap-space-xl py-space-3xl", pageGutter)}>
      <header>
        <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">{eyebrow}</p>
        <h1 className="mt-space-xs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          {title}
        </h1>
        <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant">{lede}</p>
      </header>
      <div className="flex flex-col gap-space-xl">{children}</div>
    </article>
  );
}

export function TextSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
      <div className="mt-space-sm flex flex-col gap-space-sm font-body-lg text-body-lg text-on-surface-variant">{children}</div>
    </section>
  );
}
