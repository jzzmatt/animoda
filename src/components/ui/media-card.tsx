import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";
import { IconButton } from "./icon-button";

type MediaCardBadge = {
  label: string;
  tone?: "cream" | "forest" | "gold";
};

type MediaCardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  meta?: string;
  badges?: MediaCardBadge[];
  action?: ReactNode;
  favoriteLabel?: string;
  onFavorite?: () => void;
  className?: string;
  children?: ReactNode;
};

export function MediaCard({
  title,
  description,
  eyebrow,
  meta,
  badges = [],
  action,
  favoriteLabel,
  onFavorite,
  className,
  children,
}: MediaCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm transition-shadow duration-300 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
        {children ?? (
          <div className="flex h-full items-end bg-gradient-to-br from-primary-fixed via-surface-cream to-secondary-fixed p-space-md">
            <p className="font-label-caps text-label-caps text-primary uppercase">Editorial frame</p>
          </div>
        )}
        {badges.length > 0 ? (
          <div className="absolute top-4 left-4 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone}>
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}
        {favoriteLabel && onFavorite ? (
          <IconButton
            label={favoriteLabel}
            icon="favorite"
            onClick={onFavorite}
            className="absolute top-4 right-4 h-9 w-9 bg-surface-cream/80 text-on-surface-variant backdrop-blur-sm hover:text-secondary"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between p-space-lg">
        <div>
          {eyebrow || meta ? (
            <div className="mb-space-xxs flex items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
              {eyebrow ? (
                <span className="font-label-caps text-secondary uppercase">{eyebrow}</span>
              ) : (
                <span />
              )}
              {meta ? <span className="font-label-md font-bold text-primary">{meta}</span> : null}
            </div>
          ) : null}
          <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>
          {description ? (
            <p className="mt-space-xxs line-clamp-2 font-body-md text-body-md text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="mt-space-md">{action}</div> : null}
      </div>
    </article>
  );
}
