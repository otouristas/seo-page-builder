import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { paper?: boolean; invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, paper, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border px-4 text-[14px] outline-none transition-[border-color,box-shadow] duration-150",
        paper
          ? "border-ink-900/15 bg-white text-ink-900 placeholder:text-paper-muted focus:border-ink-900 focus:ring-2 focus:ring-ink-900/15"
          : "border-ink-600 bg-ink-900/60 text-fg placeholder:text-fg-subtle focus:border-signal focus:ring-2 focus:ring-signal/25",
        invalid && "border-danger focus:border-danger focus:ring-danger/25",
        className,
      )}
      {...rest}
    />
  );
});

export function Textarea({ className, paper, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { paper?: boolean }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-[border-color,box-shadow] duration-150",
        paper
          ? "border-ink-900/15 bg-white text-ink-900 placeholder:text-paper-muted focus:border-ink-900 focus:ring-2 focus:ring-ink-900/15"
          : "border-ink-600 bg-ink-900/60 text-fg placeholder:text-fg-subtle focus:border-signal focus:ring-2 focus:ring-signal/25",
        className,
      )}
      {...rest}
    />
  );
}
