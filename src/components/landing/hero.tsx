import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { heroHighlights, pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-surface-cream pb-space-3xl">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-15 mix-blend-multiply">
        <EditorialImage src="/stitch/hero-texture.jpg" alt="" sizes="100vw" />
      </div>
      <div className="pointer-events-none absolute -top-32 right-1/4 h-[600px] w-[600px] rounded-full bg-primary-fixed/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-[500px] w-[500px] rounded-full bg-secondary-fixed/40 blur-3xl" />
      <div className={cn("relative z-10 mx-auto max-w-7xl pt-space-xl", pageGutter)}>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-7">
            <p className="mb-space-md inline-flex items-center gap-space-xs self-start rounded-full bg-surface-container px-space-sm py-space-xxs font-label-caps text-label-caps tracking-widest text-secondary uppercase shadow-sm">
              <Icon name="auto_awesome" fill className="text-[16px] text-golden-accent" />
              Haute Couture Meets Biological Majesty
            </p>
            <h1 className="max-w-xl font-display-hero-mobile text-display-hero-mobile tracking-tight text-primary md:font-display-hero md:text-display-hero">
              Discover Nature.
              <span className="mt-space-xxs block font-serif text-[0.86em] font-normal italic text-secondary">
                Design Your Style.
              </span>
            </h1>
            <p className="mt-space-md max-w-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              AI-powered fashion inspired by the beauty of the animal kingdom. Explore natural colors and silhouettes, visualize a selected design on your own photograph, and ask a couturier about making it.
            </p>
            <div className="mt-space-xl flex flex-wrap items-center gap-space-sm">
              <Button href={routes.studio} icon="arrow_forward" iconPosition="end">
                Create My Look
              </Button>
              <Button href={routes.animals} variant="surface" icon="travel_explore">
                Explore Animals
              </Button>
            </div>
            <ul className="mt-space-2xl grid grid-cols-2 gap-space-xs border-t border-border-warm-subtle/60 pt-space-lg sm:grid-cols-4">
              {heroHighlights.map((item) => (
                <li key={item.label} className="flex flex-col gap-space-xxs">
                  <Icon name={item.icon} fill={"fill" in item ? item.fill : false} className={cn("text-[22px]", item.tone)} />
                  <span className="font-label-caps text-label-caps text-primary">{item.label}</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-space-xl lg:col-span-5 lg:mt-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-container-high shadow-xl">
              <EditorialImage
                src="/stitch/hero-group.jpg"
                alt="Editorial group in animal-inspired couture: a woman in a zebra gown, a man in a patterned jacket, and a child in a tiger-striped blazer."
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-space-sm rounded-2xl bg-surface-cream/90 p-space-sm shadow-md backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-space-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Icon name="diamond" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-bold text-primary">Fall Fauna Collection</p>
                    <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                      Runway piece #08 · Zebra Silk Jacquard
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-golden-accent/20 px-space-xs py-1 font-label-caps text-label-caps text-tertiary-container uppercase">
                  Bespoke Only
                </span>
              </div>
            </div>
            <div className="absolute -top-4 -right-2 flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-primary-container p-2 text-center text-on-primary-container shadow-lg sm:-right-4">
              <span className="font-label-caps text-[9px] tracking-tighter uppercase">Haute Couture</span>
              <span className="font-headline-sm text-headline-sm leading-none font-bold text-pure-white">PARIS</span>
              <span className="font-label-sm text-[9px] text-golden-accent">Est. 2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
