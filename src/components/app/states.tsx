import { Check, LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";
import { STEP_LOG } from "@/store/lab";
import { cn } from "@/lib/utils";
import { UrlField } from "@/components/ui/url-field";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Aurora, DotGrid } from "@/components/patterns";
import { RecentsList } from "./recents-menu";
import type { RecentEntry } from "@/lib/seo/recents";

const CHIPS = ["stripe.com/payments", "ahrefs.com/blog", "skroutz.gr"];

export function EmptyState({ onSubmit, onDemo, onRecent }: { onSubmit: (url: string) => void; onDemo: () => void; onRecent?: (e: RecentEntry) => void }) {
  return (
    <div className="relative grid min-h-full place-items-center overflow-hidden px-5 py-16">
      <DotGrid className="mask-radial opacity-60" />
      <Aurora intensity={0.8} />
      <div className="relative w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] tracking-wider text-fg-muted uppercase">
          <Sparkles className="size-3.5 text-signal" /> The lab
        </span>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Paste a URL. Watch it land on page one.</h1>
        <p className="mx-auto mt-4 max-w-lg text-fg-muted">Rankframe reads the live page, runs weighted checks, stages the best keywords as Google-like scenes and hands you the plays.</p>
        <UrlField className="mt-8 text-left" onSubmit={onSubmit} chips={CHIPS} autoFocus />
        <div className="mt-6 text-[13px] text-fg-muted">
          No URL handy?{" "}
          <button type="button" onClick={onDemo} className="font-medium text-signal underline-offset-4 hover:underline">
            Load the demo scene
          </button>
        </div>
        {onRecent && (
          <RecentsList onPick={onRecent} title="Recent on this browser" className="mx-auto mt-10 max-w-lg rounded-2xl bg-ink-800/70 p-3 text-left ring-hairline" />
        )}
      </div>
    </div>
  );
}

export function LoadingState({ step, url }: { step: number; url: string }) {
  return (
    <div className="grid gap-8 p-5 lg:grid-cols-[320px_1fr] lg:p-8">
      <div>
        <div className="font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Reading</div>
        <div className="mt-1 truncate font-display text-lg font-semibold">{url}</div>
        <ol className="mt-6 space-y-2.5">
          {STEP_LOG.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className={cn("flex items-center gap-3 text-[14px] transition-colors", done ? "text-fg-muted" : active ? "text-fg" : "text-fg-subtle")}>
                <span className={cn("grid size-5 place-items-center rounded-full", done ? "bg-signal text-ink-900" : active ? "bg-ink-700" : "bg-ink-800")}>
                  {done ? <Check className="size-3" strokeWidth={3} /> : active ? <LoaderCircle className="size-3 animate-spin" /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-stage">
        <Skeleton className="h-10 w-2/3 !bg-black/6" />
        <div className="mt-8 space-y-7">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full !bg-black/8" />
                <Skeleton className="h-3 w-40 !bg-black/6" />
              </div>
              <Skeleton className="h-5 w-3/4 !bg-[#1a0dab]/15" />
              <Skeleton className="h-3 w-full !bg-black/6" />
              <Skeleton className="h-3 w-5/6 !bg-black/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry, onDemo }: { message: string; onRetry: () => void; onDemo: () => void }) {
  return (
    <div className="grid min-h-full place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-ink-800/80 p-8 text-center shadow-card ring-hairline">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/15 text-danger">
          <TriangleAlert className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">The page didn't come through.</h2>
        <p className="mt-2 text-[14px] text-fg-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry}>Try again</Button>
          <Button variant="outline" onClick={onDemo}>
            Use the demo scene
          </Button>
        </div>
      </div>
    </div>
  );
}
