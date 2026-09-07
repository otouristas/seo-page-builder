import { Globe, ArrowRight, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn, normalizeUrl } from "@/lib/utils";

type Props = {
  onSubmit: (url: string) => void;
  initial?: string;
  size?: "md" | "lg";
  paper?: boolean;
  loading?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  chips?: string[];
  className?: string;
  autoFocus?: boolean;
};

/** URL entry with validation, sample chips and a signal CTA. Shared by hero, CTA band and the lab. */
export function UrlField({
  onSubmit,
  initial = "",
  size = "lg",
  paper,
  loading,
  placeholder = "Paste any public URL — https://…",
  buttonLabel = "Run the lab",
  chips,
  className,
  autoFocus,
}: Props) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const url = normalizeUrl(value);
    if (!url) {
      setError("Enter a full URL, like https://example.com/page");
      return;
    }
    setError(null);
    onSubmit(url);
  }

  const big = size === "lg";
  return (
    <div className={className}>
      <form
        onSubmit={submit}
        className={cn(
          "flex items-center gap-2 rounded-2xl border p-1.5 transition-[border-color,box-shadow] duration-200",
          paper
            ? "border-ink-900/15 bg-white shadow-paper focus-within:border-ink-900/40"
            : "glass border-ink-600 shadow-stage focus-within:border-signal/70 focus-within:shadow-glow-sm",
          big ? "pl-4" : "pl-3",
        )}
      >
        <Globe className={cn("shrink-0", paper ? "text-paper-muted" : "text-fg-subtle", big ? "size-5" : "size-4")} aria-hidden />
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder={placeholder}
          aria-label="Page URL"
          aria-invalid={Boolean(error)}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none",
            paper ? "text-ink-900 placeholder:text-paper-muted" : "text-fg placeholder:text-fg-subtle",
            big ? "h-12 text-[16px]" : "h-9 text-[14px]",
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl font-semibold transition-[background-color,box-shadow,transform] duration-200 ease-snappy active:scale-[0.98] disabled:opacity-70",
            paper ? "bg-ink-900 text-fg hover:bg-ink-700" : "bg-signal text-ink-900 hover:bg-signal-600 hover:shadow-glow-sm",
            big ? "h-12 px-5 text-[15px]" : "h-9 px-4 text-[13px]",
          )}
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
          <span className={cn(loading && "hidden sm:inline")}>{loading ? "Reading…" : buttonLabel}</span>
          {!loading && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </form>
      {error ? (
        <p role="alert" className="mt-2 px-2 text-[13px] text-danger">
          {error}
        </p>
      ) : chips?.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          <span className={cn("text-[12px]", paper ? "text-paper-muted" : "text-fg-subtle")}>Try:</span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setValue(c);
                setError(null);
                const url = normalizeUrl(c);
                if (url) onSubmit(url);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[12px] transition-colors",
                paper ? "bg-ink-900/6 text-ink-900 hover:bg-ink-900/12" : "bg-ink-800 text-fg-muted ring-hairline hover:text-fg",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
