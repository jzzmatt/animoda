import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const badgeTones = {
  cream: "bg-surface-cream/90 text-secondary backdrop-blur-sm",
  forest: "bg-primary-container text-on-primary",
  gold: "bg-golden-accent/20 text-neutral-dark ring-1 ring-golden-accent",
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
};

export function Badge({ children, tone = "cream", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-space-xs py-0.5 font-label-caps text-label-caps uppercase",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
