import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type StepState = "complete" | "current" | "upcoming";

export type StudioStep = {
  id: string;
  label: string;
  state: StepState;
};

type StepperProps = {
  label: string;
  steps: StudioStep[];
};

export function Stepper({ label, steps }: StepperProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex items-center gap-space-xs overflow-x-auto py-space-xxs">
        {steps.map((step, index) => {
          const number = index + 1;
          const connectorGold = step.state === "complete";

          return (
            <li key={step.id} className="flex items-center gap-space-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-space-xs rounded-full px-space-xs py-space-xxs",
                  step.state === "current" && "ring-2 ring-golden-accent",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full font-label-sm text-label-sm font-bold",
                    step.state === "upcoming"
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-primary text-pure-white",
                  )}
                  aria-hidden="true"
                >
                  {step.state === "complete" ? (
                    <Icon name="check" className="text-[14px]" />
                  ) : (
                    number
                  )}
                </span>
                <span
                  className={cn(
                    "font-label-sm text-label-sm whitespace-nowrap",
                    step.state === "current" ? "font-semibold text-primary" : "text-on-surface-variant",
                  )}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  {step.label}
                </span>
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-0.5 w-4 sm:block",
                    connectorGold ? "bg-golden-accent" : "bg-border-warm-subtle",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
