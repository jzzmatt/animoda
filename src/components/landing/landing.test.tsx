import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingPage } from "./landing-page";
import { Lookbook } from "./lookbook";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-current": ariaCurrent,
    "aria-label": ariaLabel,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-current"?: "page";
    "aria-label"?: string;
  }) => createElement("a", { href, className, "aria-current": ariaCurrent, "aria-label": ariaLabel }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("public landing", () => {
  it("renders the approved hero and the illustrative disclaimer", () => {
    const html = renderToStaticMarkup(<LandingPage />);

    expect(html).toContain("Discover Nature.");
    expect(html).toContain("Design Your Style.");
    expect(html).toContain("Illustrative preview.");
    expect(html).toContain("Days avg. Paris delivery");
    expect(html).toContain("Savannah Zebra Asymmetrical Gown");
    expect(html).not.toContain("99.4%");
  });

  it("shows an empty state for the unisex sample filter", () => {
    const html = renderToStaticMarkup(<Lookbook initialAudience="Unisex" showExplore={false} />);

    expect(html).toContain("no unisex sample");
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("Savannah Zebra Asymmetrical Gown");
  });

  it("marks Discover as the current page and links the primary routes", () => {
    const html = renderToStaticMarkup(<SiteHeader />);

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/animals"');
    expect(html).toContain('href="/marketplace"');
    expect(html).toContain('href="/studio"');
    expect(html).toContain('href="/couturiers"');
    expect(html).toContain('href="/how-it-works"');
    expect(html).toContain("Create My Look");
  });

  it("keeps newsletter signup from claiming an address was stored", () => {
    const html = renderToStaticMarkup(<SiteFooter />);

    expect(html).toContain("Your email address");
    expect(html).toContain("Privacy Charter");
    expect(html).toContain('href="/privacy"');
    expect(html).not.toContain("This address was not stored");
  });
});