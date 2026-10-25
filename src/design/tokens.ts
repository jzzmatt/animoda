/**
 * Colour values taken from the approved Stitch project
 * `Animoda Fashion Design System` (projects/11446106471838367658).
 *
 * `screenColors` matches the Tailwind theme embedded in the generated screens.
 * `brandColors` are the written brand hexes from that project's DESIGN.md.
 * Where those two differ, components follow the screen roles so later pages
 * can reuse the same class names as the Stitch HTML.
 */
export const screenColors = {
  primary: "#003527",
  "primary-container": "#064e3b",
  "primary-fixed": "#b0f0d6",
  "primary-fixed-dim": "#95d3ba",
  "on-primary": "#ffffff",
  "on-primary-container": "#80bea6",
  "on-primary-fixed": "#002117",
  "on-primary-fixed-variant": "#0b513d",
  "inverse-primary": "#95d3ba",
  secondary: "#934b19",
  "secondary-container": "#ffa26a",
  "secondary-fixed": "#ffdbc9",
  "secondary-fixed-dim": "#ffb68c",
  "on-secondary": "#ffffff",
  "on-secondary-container": "#783603",
  "on-secondary-fixed": "#321200",
  "on-secondary-fixed-variant": "#753401",
  tertiary: "#511f00",
  "tertiary-container": "#743000",
  "tertiary-fixed": "#ffdbca",
  "tertiary-fixed-dim": "#ffb690",
  "on-tertiary": "#ffffff",
  "on-tertiary-container": "#ff975e",
  "on-tertiary-fixed": "#341100",
  "on-tertiary-fixed-variant": "#783200",
  error: "#ba1a1a",
  "error-container": "#ffdad6",
  "on-error": "#ffffff",
  "on-error-container": "#93000a",
  background: "#fef9ee",
  "on-background": "#1d1c15",
  surface: "#fef9ee",
  "surface-bright": "#fef9ee",
  "surface-dim": "#dedacf",
  "surface-container-lowest": "#ffffff",
  "surface-container-low": "#f8f3e8",
  "surface-container": "#f2ede3",
  "surface-container-high": "#ede8dd",
  "surface-container-highest": "#e7e2d7",
  "surface-variant": "#e7e2d7",
  "on-surface": "#1d1c15",
  "on-surface-variant": "#404944",
  "inverse-surface": "#323029",
  "inverse-on-surface": "#f5f0e5",
  outline: "#707974",
  "outline-variant": "#bfc9c3",
  "surface-tint": "#2b6954",
  "golden-accent": "#D4A72C",
  "pure-white": "#FFFFFF",
  "neutral-dark": "#111827",
  "surface-cream": "#F8F3E8",
  "surface-subtle": "#F2ECE0",
  "border-warm-subtle": "#E8DFC8",
  "success-green": "#059669",
  "danger-red": "#DC2626",
} as const;

/** Written brand hexes from DESIGN.md. Not all of them are screen role colours. */
export const brandColors = {
  forest: "#064E3B",
  earth: "#8B4513",
  terracotta: "#F97316",
  gold: "#D4A72C",
  cream: "#F8F3E8",
  white: "#FFFFFF",
} as const;

/**
 * Component colours named in DESIGN.md prose and absent from the generated
 * Tailwind map. `border-warm` in that map is the invalid string "#E5DC Flora"
 * and is intentionally omitted.
 */
export const designMdColors = {
  "field-border": "#D8CBB4",
  "chip-border": "#E2D9C5",
} as const;

export const brokenStitchTokens = {
  "border-warm": "#E5DC Flora",
} as const;

export const typeScale = {
  "display-hero": { size: "56px", lineHeight: "64px", tracking: "-0.03em", weight: "800" },
  "display-hero-mobile": { size: "36px", lineHeight: "44px", tracking: "-0.025em", weight: "800" },
  "headline-xl": { size: "40px", lineHeight: "48px", tracking: "-0.02em", weight: "700" },
  "headline-xl-mobile": { size: "28px", lineHeight: "36px", tracking: "-0.015em", weight: "700" },
  "headline-lg": { size: "30px", lineHeight: "38px", tracking: "-0.015em", weight: "700" },
  "headline-md": { size: "24px", lineHeight: "32px", tracking: "-0.01em", weight: "600" },
  "headline-sm": { size: "20px", lineHeight: "28px", tracking: "-0.005em", weight: "600" },
  "title-md": { size: "18px", lineHeight: "26px", tracking: "0em", weight: "600" },
  "body-lg": { size: "16px", lineHeight: "26px", tracking: "0em", weight: "400" },
  "body-md": { size: "14px", lineHeight: "22px", tracking: "0em", weight: "400" },
  "body-sm": { size: "12px", lineHeight: "18px", tracking: "0.01em", weight: "400" },
  "label-caps": { size: "11px", lineHeight: "16px", tracking: "0.08em", weight: "700" },
  "label-md": { size: "13px", lineHeight: "18px", tracking: "0.01em", weight: "600" },
  "label-sm": { size: "11px", lineHeight: "16px", tracking: "0.02em", weight: "500" },
} as const;

export const spacing = {
  "space-xxs": "0.25rem",
  "space-xs": "0.5rem",
  "space-sm": "0.75rem",
  "space-md": "1rem",
  "space-lg": "1.5rem",
  "space-xl": "2rem",
  "space-2xl": "3rem",
  "space-3xl": "4.5rem",
  gutter: "1.5rem",
  "gutter-mobile": "0.875rem",
  margin: "2.5rem",
  "margin-mobile": "1rem",
} as const;
