import { createLink, type LinkComponent } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "paper"
  | "paper-outline"
  | "paper-ghost"
  | "white";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none transition-[background-color,box-shadow,transform,color,border-color] duration-200 ease-snappy disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-signal text-ink-900 shadow-[0_0_0_1px_rgb(199_255_59/0.25)] hover:bg-signal-600 hover:shadow-glow-sm",
  secondary: "bg-ink-700 text-fg ring-hairline hover:bg-ink-600",
  outline: "border border-ink-600 text-fg hover:border-fg-muted hover:bg-ink-800",
  ghost: "text-fg-muted hover:bg-ink-800 hover:text-fg",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
  paper: "bg-ink-900 text-fg hover:bg-ink-700",
  "paper-outline": "border border-ink-900/15 text-ink-900 hover:border-ink-900/40 hover:bg-ink-900/5",
  "paper-ghost": "text-paper-muted hover:bg-ink-900/5 hover:text-ink-900",
  white: "bg-white text-ink-900 shadow-paper hover:bg-paper-2",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-[12px]",
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
  xl: "h-14 px-7 text-[16px]",
};

export function buttonStyles(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(BASE, VARIANTS[opts.variant ?? "primary"], SIZES[opts.size ?? "md"], opts.className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Button({ variant, size, className, leading, trailing, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonStyles({ variant, size, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
};

const BasicButtonLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps>(function BasicButtonLink(
  { variant, size, className, leading, trailing, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={buttonStyles({ variant, size, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </a>
  );
});

const CreatedButtonLink = createLink(BasicButtonLink);

/** Route-aware button link: typed `to`, `search`, `params` plus button styling props. */
export const ButtonLink: LinkComponent<typeof BasicButtonLink> = (props) => <CreatedButtonLink preload="intent" {...props} />;

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function ButtonAnchor({ variant, size, className, leading, trailing, children, ...rest }: ButtonAnchorProps) {
  return (
    <a className={buttonStyles({ variant, size, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </a>
  );
}
