import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { pageGutter, processPillars } from "@/content/site";
import { cn } from "@/lib/cn";

export function Pillars() {
  return (
    <section className="w-full bg-surface py-space-3xl" aria-labelledby="pillars-title">
      <div className={cn("mx-auto max-w-7xl", pageGutter)}>
        <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">
              Savoir-Faire Architecture
            </p>
            <h2 id="pillars-title" className="mt-space-xxs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
              From Wild Morphology to Bespoke Fitting
            </h2>
          </div>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            Animoda connects animal study, design concepts, a selected try-on, and a couturier quotation. Each stage stays distinct.
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {processPillars.map((pillar) => (
            <li
              key={pillar.title}
              className="group flex flex-col rounded-3xl bg-surface-container-lowest p-space-xl shadow-sm transition-all duration-300 motion-safe:hover:shadow-xl"
            >
              <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Icon name={pillar.icon} className="text-[26px]" />
              </div>
              <p className="font-label-caps text-label-caps text-secondary">{pillar.label}</p>
              <h3 className="mt-space-xxs font-title-md text-title-md font-bold text-primary">{pillar.title}</h3>
              <p className="mt-space-xs flex-1 font-body-md text-body-md text-on-surface-variant">{pillar.body}</p>
              <div className="mt-space-lg flex items-center pt-space-sm font-label-md text-label-md text-primary">
                <Link href={pillar.href} className="inline-flex items-center gap-space-xxs hover:text-secondary">
                  {pillar.action}
                  <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
