import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { Chip } from "./chip";
import { Stepper } from "./stepper";
import { TextField } from "./text-field";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => createElement("a", { href, className }, children),
}));

describe("Animoda UI primitives", () => {
  it("renders the Stitch primary action", () => {
    const html = renderToStaticMarkup(<Button icon="arrow_forward">Create My Look</Button>);

    expect(html).toContain("bg-primary");
    expect(html).toContain("rounded-full");
    expect(html).toContain("Create My Look");
    expect(html).toContain('type="button"');
    expect(html).toContain("arrow_forward");
  });

  it("renders an outline action and a link action", () => {
    const outline = renderToStaticMarkup(<Button variant="outline">Replace Photo</Button>);
    const link = renderToStaticMarkup(
      <Button href="/studio" variant="surface">
        Explore Animals
      </Button>,
    );

    expect(outline).toContain("border-primary-container");
    expect(link).toContain('href="/studio"');
    expect(link).toContain("bg-surface-container-lowest");
  });

  it("exposes the selected audience chip", () => {
    const html = renderToStaticMarkup(<Chip selected>Women</Chip>);

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("bg-primary");
    expect(html).toContain("Women");
  });

  it("associates a field with its label and error", () => {
    const html = renderToStaticMarkup(
      <TextField id="email" label="Email address" error="Enter an email address to continue." />,
    );

    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Enter an email address to continue.");
    expect(html).toContain("border-field-border");
  });

  it("marks the current Studio step", () => {
    const html = renderToStaticMarkup(
      <Stepper
        label="Animoda Studio steps"
        steps={[
          { id: "photo", label: "1. Photo", state: "complete" },
          { id: "animal", label: "2. Choose Animal", state: "current" },
          { id: "suggestions", label: "3. AI Suggestions", state: "upcoming" },
        ]}
      />,
    );

    expect(html).toContain('aria-label="Animoda Studio steps"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("2. Choose Animal");
    expect(html).toContain("ring-golden-accent");
  });
});
