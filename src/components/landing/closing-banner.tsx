import { Button } from "@/components/ui/button";
import { pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

export function ClosingBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-space-3xl text-on-primary dark:bg-[#064e3b] dark:text-white">
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-golden-accent/15 blur-3xl" />
      <div className={cn("relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-2xl md:flex-row", pageGutter)}>
        <div className="max-w-2xl">
          <p className="font-label-caps text-label-caps tracking-widest text-primary-fixed uppercase dark:text-accent">
            Bespoke Couture Generator
          </p>
          <h2 className="mt-space-xxs font-display-hero-mobile text-display-hero-mobile text-pure-white md:font-headline-xl md:text-headline-xl">
            Ready to Wear the Soul of the Animal Kingdom?
          </h2>
          <p className="mt-space-sm max-w-xl font-body-lg text-body-lg text-on-primary-container dark:text-[#cbd5e1]">
            The Studio path starts here: choose an animal, review several designs, and try on the one you select. That journey opens in a later release.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-space-sm sm:flex-row md:w-auto">
          <Button
            href={routes.studio}
            variant="surface"
            icon="auto_fix_high"
            className="w-full bg-[#F8F3E8] text-[#003527] shadow-xl hover:bg-white sm:w-auto dark:bg-primary-container dark:text-on-primary"
          >
            Start Creating Look
          </Button>
          <Button
            href={routes.howItWorks}
            variant="container"
            className="w-full bg-primary-container text-pure-white hover:bg-primary-container/80 sm:w-auto"
          >
            How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
