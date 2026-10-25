import Link from "next/link";
import { EditorialImage } from "@/components/public/editorial-image";
import { Icon } from "@/components/ui/icon";
import { animalInspirations, pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

export function AnimalRail() {
  return (
    <section className="w-full bg-surface-container-low py-space-xl" aria-labelledby="fauna-title">
      <div className={cn("mx-auto max-w-7xl", pageGutter)}>
        <div className="mb-space-md flex items-end justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Icon name="pets" className="text-[22px] text-secondary" />
            <h2 id="fauna-title" className="font-headline-sm text-headline-sm text-primary">
              Fauna Inspirations
            </h2>
            <p className="ml-2 hidden font-body-sm text-body-sm text-on-surface-variant sm:inline">
              Eight sample specimens from the landing lookbook
            </p>
          </div>
          <Link
            href={routes.animals}
            className="inline-flex shrink-0 items-center gap-space-xxs font-label-md text-label-md text-secondary transition-colors hover:text-primary"
          >
            View all 120+ species
            <Icon name="chevron_right" className="text-[16px]" />
          </Link>
        </div>
        <ul className="flex gap-space-md overflow-x-auto overscroll-x-contain pt-space-xxs pb-space-sm">
          {animalInspirations.map((animal) => (
            <li key={animal.name} className="w-28 shrink-0">
              <Link href={routes.animals} className="group flex flex-col items-center gap-space-xs text-center">
                <span className="relative h-24 w-24 overflow-hidden rounded-2xl bg-surface-container shadow-sm transition-all motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-md">
                  <EditorialImage
                    src={animal.image}
                    alt={animal.alt}
                    sizes="96px"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                  />
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary group-hover:text-secondary">
                  {animal.name}
                </span>
                <span className="-mt-1 font-body-sm text-[11px] text-body-sm text-on-surface-variant">{animal.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
