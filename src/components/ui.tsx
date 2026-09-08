import Link from "next/link";
import { ArrowUpRight, Check, ArrowRight, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";
export function Button({
  className,
  variant = "primary",
  busy,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  busy?: boolean;
}) {
  return (
    <button
      className={cn("button", variant, className)}
      {...props}
      disabled={busy || props.disabled}
    >
      {busy && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  );
}
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Link className={cn("button", variant, className)} href={href}>
      {children}
    </Link>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "orange" | "red" | "blue";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="tiny-dot" />
      {children}
    </div>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="check-item">
      <Check size={16} />
      {children}
    </li>
  );
}
export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <SectionLabel>{kicker}</SectionLabel>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Arrow() {
  return <ArrowRight size={18} />;
}
