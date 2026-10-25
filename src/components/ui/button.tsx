"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export const buttonVariants = {
  primary:
    "bg-primary text-on-primary shadow-md hover:bg-primary-container motion-safe:hover:-translate-y-0.5 dark:bg-primary-container dark:hover:brightness-110",
  container:
    "bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(6,78,59,0.15)] hover:bg-primary",
  surface:
    "bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container",
  tonal: "bg-surface-container text-on-surface hover:bg-surface-container-high",
  outline:
    "border-[1.5px] border-primary-container bg-transparent text-primary hover:bg-surface-container",
  danger: "bg-transparent text-error hover:bg-error-container hover:text-on-error-container",
} as const;

export const buttonSizes = {
  md: "min-h-11 px-space-xl py-space-sm",
  sm: "min-h-10 px-space-md py-space-xs",
} as const;

const buttonBase =
  "inline-flex items-center justify-center gap-space-xs rounded-full font-label-md text-label-md transition-all duration-300 disabled:pointer-events-none disabled:opacity-50";

type Variant = keyof typeof buttonVariants;
type Size = keyof typeof buttonSizes;

type SharedProps = {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconPosition?: "start" | "end";
  className?: string;
  children: ReactNode;
};

type ButtonProps = SharedProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type LinkButtonProps = SharedProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

function ButtonContent({
  icon,
  iconPosition,
  children,
}: Pick<SharedProps, "icon" | "iconPosition" | "children">) {
  return (
    <>
      {icon && iconPosition !== "end" ? <Icon name={icon} className="text-[18px]" /> : null}
      <span>{children}</span>
      {icon && iconPosition === "end" ? <Icon name={icon} className="text-[18px]" /> : null}
    </>
  );
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const classes = cn(buttonBase, buttonVariants[variant], buttonSizes[size], props.className);
  const content = (
    <ButtonContent icon={props.icon} iconPosition={props.iconPosition} >
      {props.children}
    </ButtonContent>
  );

  if (props.href !== undefined) {
    const linkProps: Omit<LinkButtonProps, keyof SharedProps> = { href: props.href };
    if ("replace" in props) {
      return (
        <Link
          href={props.href}
          className={classes}
          replace={props.replace}
          scroll={props.scroll}
          prefetch={props.prefetch}
          target={props.target}
          rel={props.rel}
          title={props.title}
          aria-label={props["aria-label"]}
        >
          {content}
        </Link>
      );
    }
    return (
      <Link {...linkProps} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, onClick, name, value, form, "aria-label": ariaLabel } = props;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      name={name}
      value={value}
      form={form}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
