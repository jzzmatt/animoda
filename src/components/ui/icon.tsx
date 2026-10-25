import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  fill?: boolean;
  className?: string;
};

export function Icon({ name, fill = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined leading-none", className)}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
