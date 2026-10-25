"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  label: string;
  icon: string;
  badge?: string;
  badgeTone?: "secondary" | "gold";
  pip?: boolean;
};

export function IconButton({
  label,
  icon,
  badge,
  badgeTone = "secondary",
  pip = false,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon name={icon} className="text-[20px]" />
      {pip ? (
        <span aria-hidden="true" className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-golden-accent" />
      ) : null}
      {badge ? (
        <span
          className={cn(
            "absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-label-sm text-[10px] text-pure-white",
            badgeTone === "gold" ? "bg-golden-accent" : "bg-secondary",
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
