"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

const storageKey = "animoda-theme";
const themeEvent = "animoda-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(themeEvent, onStoreChange);
  return () => window.removeEventListener(themeEvent, onStoreChange);
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    /* Private browsing can block storage. The choice still applies for this visit. */
  }
  window.dispatchEvent(new Event(themeEvent));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as const);

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border-warm-subtle bg-surface-container-lowest p-0.5"
      role="group"
      aria-label="Color edition"
    >
      <button
        type="button"
        aria-pressed={theme === "light"}
        aria-label="White light edition"
        onClick={() => applyTheme("light")}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          theme === "light" ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <Icon name="light_mode" className="text-[18px]" />
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        aria-label="Obsidian Atelier dark edition"
        onClick={() => applyTheme("dark")}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          theme === "dark" ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <Icon name="dark_mode" fill={theme === "dark"} className="text-[18px]" />
      </button>
    </div>
  );
}
