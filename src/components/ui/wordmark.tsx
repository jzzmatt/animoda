import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type WordmarkProps = {
  suffix?: string;
  className?: string;
};

export function Wordmark({ suffix, className }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-space-xs", className)}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-golden-accent shadow-sm"
      >
        <Icon name="spa" className="text-[18px]" />
      </span>
      <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
        ANIMODA
        {suffix ? (
          <span className="ml-space-xxs font-label-caps font-light text-golden-accent">{suffix}</span>
        ) : null}
      </span>
    </span>
  );
}
