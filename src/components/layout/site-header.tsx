"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { mainNav, pageGutter, routes } from "@/content/site";
import { cn } from "@/lib/cn";

function isCurrent(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === routes.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface-cream/85 shadow-nav backdrop-blur-md">
      <div className={cn("mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-sm", pageGutter)}>
        <Link href={routes.home} className="flex shrink-0 items-center">
          <Image
            src="/stitch/logo-lockup.png"
            alt="Animoda"
            width={462}
            height={94}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-space-lg xl:flex" aria-label="Primary">
          {mainNav.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "pb-1 font-label-md text-label-md transition-colors",
                  current
                    ? "border-b-2 border-primary font-semibold text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-space-xxs sm:gap-space-sm">
          <Link
            href={routes.marketplace}
            aria-label="Search the marketplace preview"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="search" className="text-[20px]" />
          </Link>
          <Link
            href={routes.wishlist}
            aria-label="Wishlist preview"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="favorite" className="text-[20px]" />
          </Link>
          <Link
            href={routes.notices}
            aria-label="Notices"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface sm:inline-flex"
          >
            <Icon name="notifications" className="text-[20px]" />
          </Link>
          <Link
            href={routes.studio}
            className="hidden items-center justify-center rounded-full bg-primary-container px-space-lg py-space-xs font-label-md text-label-md text-on-primary shadow-[0_2px_8px_rgba(6,78,59,0.15)] transition-colors hover:bg-primary sm:inline-flex"
          >
            Create My Look
          </Link>
          <Link
            href={routes.account}
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-golden-accent sm:inline-flex"
          >
            <Icon name="person" className="text-[20px]" />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface xl:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setMenuPath(open ? null : pathname)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <Icon name={open ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>
      {open ? (
        <nav id="site-menu" aria-label="Mobile" className="border-t border-border-warm-subtle/70 bg-surface-cream/95 backdrop-blur-md xl:hidden">
          <ul className={cn("mx-auto flex max-w-7xl flex-col gap-space-xs py-space-md", pageGutter)}>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className="block rounded-full px-space-md py-space-xs font-label-md text-label-md text-primary hover:bg-surface-container"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.studio} className="mt-space-xs block rounded-full bg-primary-container px-space-md py-space-xs text-center font-label-md text-label-md text-on-primary">
                Create My Look
              </Link>
            </li>
            <li>
              <Link href={routes.wishlist} className="block rounded-full px-space-md py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href={routes.notices} className="block rounded-full px-space-md py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
                Notices
              </Link>
            </li>
            <li>
              <Link href={routes.account} className="block rounded-full px-space-md py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
                Account
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
