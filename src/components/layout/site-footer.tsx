"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

const discoveries = [
  { href: routes.home, label: "Seasonal Lookbook" },
  { href: routes.animals, label: "Animal Morphology" },
  { href: routes.marketplace, label: "Limited Capsule Drops" },
  { href: routes.studio, label: "AI Swatch Lab" },
] as const;

const coutureHouse = [
  { href: routes.couturiers, label: "Master Couturiers" },
  { href: routes.howItWorks, label: "Atelier Process" },
  { href: `${routes.howItWorks}#fitting`, label: "Bespoke Fitting" },
  { href: routes.couturiers, label: "Atelier Accreditation" },
] as const;

export function SiteFooter() {
  const [notice, setNotice] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Newsletter signup is not open yet. This address was not stored.");
  }

  return (
    <footer className="mt-space-3xl w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className={cn("mx-auto max-w-7xl pt-space-3xl pb-space-2xl", pageGutter)}>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-space-sm lg:col-span-4">
            <Link href={routes.home} className="inline-flex items-center">
              <Image src="/stitch/logo-lockup.png" alt="Animoda" width={462} height={94} className="h-7 w-auto max-w-full dark:brightness-200" />
            </Link>
            <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">
              Where biological majesty harmonizes with Parisian haute couture. Organic patterns, bespoke atelier craftsmanship, and couturiers for women, men, children, and unisex wardrobes.
            </p>
            <div className="mt-space-xs flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps text-secondary uppercase">Certified Savoir-Faire</span>
              <Icon name="verified" className="text-[18px] text-golden-accent" />
            </div>
          </div>
          <nav className="flex flex-col gap-space-sm lg:col-span-2" aria-label="Discoveries">
            <h2 className="font-label-caps text-label-caps tracking-wider text-on-surface uppercase">Discoveries</h2>
            <ul className="flex flex-col gap-space-xs">
              {discoveries.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="flex flex-col gap-space-sm lg:col-span-2" aria-label="Couture house">
            <h2 className="font-label-caps text-label-caps tracking-wider text-on-surface uppercase">Couture House</h2>
            <ul className="flex flex-col gap-space-xs">
              {coutureHouse.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-space-sm lg:col-span-4">
            <h2 className="font-label-caps text-label-caps tracking-wider text-on-surface uppercase">Editorial Newsletter</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Receive exclusive private previews of animal-inspired collections and couturier masterclasses.
            </p>
            <form className="mt-space-xxs flex flex-col gap-space-xs sm:flex-row sm:items-center" onSubmit={onSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                className="min-h-11 w-full min-w-0 rounded-full bg-surface-container-lowest px-space-md py-space-xs font-body-sm text-body-sm text-on-surface shadow-sm placeholder:text-outline sm:flex-1"
              />
              <button
                type="submit"
                className="min-h-11 rounded-full bg-primary-container px-space-md py-space-xs font-label-md text-label-md text-on-primary transition-colors hover:brightness-110"
              >
                Subscribe
              </button>
            </form>
            {notice ? (
              <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">
                {notice}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-space-3xl flex flex-col items-center justify-between gap-space-md border-t border-border-warm-subtle/40 pt-space-lg md:flex-row">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 Animoda. Handcrafted in spirit of the Paris atelier.</p>
          <div className="flex flex-wrap items-center justify-center gap-space-lg">
            <Link href={routes.privacy} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
              Privacy Charter
            </Link>
            <Link href={routes.terms} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
              Terms of Service
            </Link>
            <Link href={routes.ethics} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
              Ethical Sourcing
            </Link>
            <Link href={routes.couturiers} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
              Atelier Network
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
