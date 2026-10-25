"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipProps = Omit<ComponentProps<"button">, "children"> & {
  children: ReactNode;
  selected?: boolean;
};

export function Chip({ children, selected = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full px-space-md py-space-xxs font-label-md text-label-md transition-colors",
        selected
          ? "bg-primary text-on-primary shadow-sm"
          : "bg-surface-container text-on-surface-variant hover:text-on-surface",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
