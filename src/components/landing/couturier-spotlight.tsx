import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { couturierSpotlight, illustrativeDisclaimer, pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

export function CouturierSpotlight() {
  return (
    <section className="w-full bg-surface py-space-3xl" aria-labelledby="guild-title">
      <div className={cn("mx-auto max-w-7xl", pageGutter)}>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <figure className="relative overflow-hidden rounded-3xl bg-surface-container-low p-space-xl lg:col-span-5">
            <div className="mb-space-md flex items-center gap-space-xxs text-golden-accent" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Icon key={index} name="star" fill className="text-[20px]" />
              ))}
            </div>
            <blockquote className="font-headline-sm text-headline-sm leading-snug text-primary">
              “{couturierSpotlight.quote}”
            </blockquote>
            <figcaption className="mt-space-xl flex items-center gap-space-md border-t border-border-warm-subtle/50 pt-space-md">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <EditorialImage src={couturierSpotlight.image} alt={couturierSpotlight.alt} sizes="56px" />
              </span>
              <span>
                <span className="flex items-center gap-1">
                  <span className="font-title-md text-title-md font-bold text-primary">{couturierSpotlight.name}</span>
                  <Icon name="verified" fill className="text-[18px] text-golden-accent" />
                </span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">{couturierSpotlight.role}</span>
              </span>
            </figcaption>
            <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
              Sample profile from the approved landing design.
            </p>
          </figure>
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">
              Global Craftsmanship Guild
            </p>
            <h2
              id="guild-title"
              className="mt-space-xxs font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl"
            >
              {couturierSpotlight.headlineLead}
              <span className="mt-space-xxs block">{couturierSpotlight.headlineAccent}</span>
            </h2>
            <p className="mt-space-md max-w-lg font-body-lg text-body-lg text-on-surface-variant">{couturierSpotlight.body}</p>
            <dl className="mt-space-xl grid grid-cols-3 gap-space-sm sm:gap-space-md">
              {couturierSpotlight.metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col">
                  <dt className="sr-only">{metric.label}</dt>
                  <dd className={cn("font-display-hero-mobile text-display-hero-mobile font-bold", metric.tone)}>
                    {metric.value}
                  </dd>
                  <dd className="font-body-sm text-body-sm text-on-surface-variant">{metric.label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-space-md max-w-lg font-body-sm text-body-sm text-on-surface-variant">{illustrativeDisclaimer}</p>
            <div className="mt-space-xl flex flex-wrap items-center gap-space-md">
              <Button href={routes.couturiers} variant="container" size="sm" icon="arrow_forward" iconPosition="end">
                Explore Master Couturiers
              </Button>
              <Link
                href={routes.couturiers}
                className="font-label-md text-label-md text-secondary transition-colors hover:text-primary"
              >
                Join as an Atelier Partner →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
