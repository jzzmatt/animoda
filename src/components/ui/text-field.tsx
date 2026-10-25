import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "aria-describedby"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  shape?: "field" | "pill";
};

export function TextField({
  id,
  label,
  hint,
  error,
  shape = "field",
  className,
  ...props
}: TextFieldProps) {
  const descriptionId = error || hint ? `${id}-description` : undefined;

  return (
    <div className="flex flex-col gap-space-xxs">
      <label htmlFor={id} className="font-label-md text-label-md text-primary">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={cn(
          "w-full bg-surface-container-lowest px-space-md py-space-xs font-body-md text-body-md text-neutral-dark shadow-sm placeholder:text-outline",
          shape === "pill" ? "rounded-full" : "rounded-lg border border-field-border",
          className,
        )}
        {...props}
      />
      {error || hint ? (
        <p
          id={descriptionId}
          className={cn(
            "font-body-sm text-body-sm",
            error ? "text-error" : "text-on-surface-variant",
          )}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
