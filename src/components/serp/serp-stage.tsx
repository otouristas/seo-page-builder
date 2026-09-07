import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { Market, SearchIntent, SerpResult } from "@/lib/seo/types";
import type { Scene } from "@/lib/seo/scene";
import { MARKETS } from "@/lib/seo/markets";
import { cn, hash32 } from "@/lib/utils";
import { Favicon } from "./favicon";

export type StageDevice = "desktop" | "mobile";

type Props = {
  scene: Scene;
  keyword: string;
  market: Market;
  intent?: SearchIntent;
  device?: StageDevice;
  /** When set, the organic list is real and gets a "Live" tag. */
  liveAt?: string | null;
  /** Fewer results and tighter spacing for embeds. */
  compact?: boolean;
  /** Hide the browser chrome (search bar and tabs). */
  bare?: boolean;
  className?: string;
  label?: string;
};

function resultsCount(keyword: string) {
  const h = hash32(keyword);
  const count = 180_000 + (h % 900) * 10_000;
  const secs = (0.28 + (h % 37) / 100).toFixed(2);
  return `About ${count.toLocaleString("en")} results (${secs} seconds)`;
}

function pathOf(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length ? ` › ${parts.slice(0, 2).join(" › ")}` : "";
  } catch {
    return "";
  }
}

function siteName(domain: string) {
  const base = domain.replace(/^www\./, "").split(".")[0] ?? domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function SerpStage({ scene, keyword, market, intent, device = "desktop", liveAt, compact, bare, className, label }: Props) {
  const reduce = useReducedMotion();
  const mobile = device === "mobile";
  const blocks = scene.results.filter((r) => r.kind !== "organic");
  const organic = scene.results.filter((r) => r.kind === "organic");
  const shown = compact ? organic.slice(0, 6) : organic;
  const youVisible = shown.some((r) => r.isYou);
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 32 };

  const inner = (
    <div className={cn("serp bg-white font-serp text-google-url", mobile ? "text-[14px]" : "text-[14px]")}>
      {!bare && <StageChrome keyword={keyword} market={market} mobile={mobile} />}
      <div className={cn("mx-auto", mobile ? "max-w-full px-4" : "max-w-[652px] px-6", compact ? "py-3" : "py-4")}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-[#70757a]">
          <span>{resultsCount(keyword)}</span>
          {liveAt ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2 py-0.5 font-sans text-[11px] font-medium text-[#137333]">
              <span className="size-1.5 rounded-full bg-[#137333]" /> Live · {MARKETS[market].googleHost} · {new Date(liveAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f4] px-2 py-0.5 font-sans text-[11px] font-medium text-[#5f6368]">Modeled scene</span>
          )}
          {label && <span className="ml-auto font-sans text-[11px] font-medium text-[#5f6368]">{label}</span>}
        </div>

        <LayoutGroup id={`stage-${label ?? "main"}`}>
          <div className="space-y-6">
            {blocks.map((b) =>
              b.kind === "ai-overview" ? (
                <AiOverview key={b.id} block={b} compact={compact} />
              ) : b.kind === "featured" ? (
                <FeaturedSnippet key={b.id} block={b} />
              ) : b.kind === "paa" ? (
                <PeopleAlsoAsk key={b.id} block={b} keyword={keyword} intent={intent} />
              ) : null,
            )}
            {shown.map((r, i) => (
              <motion.div key={r.id} layout transition={{ layout: spring }} className="relative">
                {r.isYou ? <YouCard result={r} rank={i + 1} live={Boolean(liveAt)} mobile={mobile} /> : <OrganicResult result={r} mobile={mobile} />}
              </motion.div>
            ))}
            {!youVisible && (
              <motion.div layout layoutId="you-card" transition={{ layout: spring }}>
                <PageTwoCard result={scene.you} />
              </motion.div>
            )}
          </div>
        </LayoutGroup>

        {!compact && (
          <div className="mt-8 flex items-center justify-center gap-4 font-serp text-[16px] text-[#1a0dab]">
            <span className="text-[#202124]">1</span>
            {[2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span className="ml-2">Next ›</span>
          </div>
        )}
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className={cn("mx-auto w-full max-w-[400px]", className)}>
        <div className="rounded-[2.4rem] border-[8px] border-ink-800 bg-ink-800 shadow-stage">
          <div className="relative overflow-hidden rounded-[1.9rem] bg-white">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-800" aria-hidden />
            <div className="max-h-[720px] overflow-y-auto pt-8">{inner}</div>
          </div>
        </div>
      </div>
    );
  }
  return <div className={cn("overflow-hidden rounded-2xl shadow-stage", className)}>{inner}</div>;
}

function StageChrome({ keyword, market, mobile }: { keyword: string; market: Market; mobile: boolean }) {
  const tabs = ["All", "Images", "Videos", "News", "Maps", "Shopping"];
  return (
    <div className="border-b border-google-border">
      <div className={cn("flex items-center gap-4", mobile ? "px-4 pt-3" : "px-6 pt-5")}>
        {!mobile && (
          <div className="flex items-center gap-1" aria-hidden>
            <span className="size-3 rounded-full bg-[#4285f4]" />
            <span className="size-3 rounded-full bg-[#ea4335]" />
            <span className="size-3 rounded-full bg-[#fbbc05]" />
            <span className="size-3 rounded-full bg-[#34a853]" />
          </div>
        )}
        <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-google-border bg-white px-4 shadow-[0_1px_6px_rgba(32,33,36,0.16)]">
          <span className="min-w-0 flex-1 truncate text-[16px] text-[#202124]">{keyword}</span>
          <X className="size-4 text-[#70757a]" aria-hidden />
          <span className="h-5 w-px bg-google-border" />
          <Search className="size-5 text-[#4285f4]" aria-hidden />
        </div>
        {!mobile && <span className="grid size-8 place-items-center rounded-full bg-[#e8f0fe] text-[12px] font-bold text-[#1967d2]">R</span>}
      </div>
      <div className={cn("mt-3 flex items-center gap-5 overflow-x-auto scrollbar-none text-[13px] text-[#5f6368]", mobile ? "px-4" : "px-6 pl-[4.4rem]")}>
        {tabs.map((t, i) => (
          <span key={t} className={cn("whitespace-nowrap pb-2.5", i === 0 && "border-b-[3px] border-google-blue font-medium text-google-blue")}>
            {t}
          </span>
        ))}
        <span className="ml-auto whitespace-nowrap pb-2.5 text-[12px]">{MARKETS[market].googleHost}</span>
      </div>
    </div>
  );
}

function AiOverview({ block, compact }: { block: SerpResult; compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#e3e8f0] bg-[linear-gradient(135deg,#f8f9ff_0%,#eef3ff_50%,#f5f0ff_100%)] p-4">
      <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#1f1f1f]">
        <Sparkles className="size-4 text-[#4285f4]" aria-hidden />
        AI Overview
      </div>
      <p className={cn("text-[14px] leading-[1.58] text-[#1f1f1f]", compact && "line-clamp-2")}>{block.snippet}</p>
      {block.sitelinks?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {block.sitelinks.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 rounded-full border border-[#dadce0] bg-white px-2.5 py-1 text-[12px] text-[#202124]">
              <Favicon domain={d} size={14} /> {d}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeaturedSnippet({ block }: { block: SerpResult }) {
  return (
    <div>
      <p className="text-[16px] leading-[1.5] text-[#1f1f1f]">{block.snippet}</p>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        <Favicon domain={block.domain} size={22} />
        <div className="leading-tight">
          <div className="text-[#202124]">{siteName(block.domain)}</div>
          <div className="text-[#4d5156]">
            {block.domain}
            {pathOf(block.url)}
          </div>
        </div>
      </div>
      <div className="mt-1 text-[18px] text-google-title">{block.title}</div>
    </div>
  );
}

function answerFor(q: string, keyword: string) {
  if (/^what is/i.test(q)) return `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} is a term people search when they want a clear definition and a way to get started. Most page-one results open with a one-paragraph answer, then expand.`;
  if (/^how/i.test(q)) return `In three steps: understand the basics, pick an approach that fits your situation, and measure results against a baseline. Pages that show the steps with examples win this box.`;
  if (/cost|much|price|cheap/i.test(q)) return `Prices vary by provider and plan. Pages that state a number, a range and what's included tend to capture this question.`;
  return `Sources on page one agree on the essentials, then differ on details. A short, direct answer near the top of your page is what earns this slot.`;
}

function PeopleAlsoAsk({ block, keyword, intent }: { block: SerpResult; keyword: string; intent?: SearchIntent }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div className="mb-1 text-[18px] text-[#1f1f1f]">People also ask</div>
      <div className="divide-y divide-google-border border-y border-google-border">
        {(block.questions ?? []).map((q, i) => (
          <div key={q}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 py-3 text-left text-[15px] text-[#1f1f1f]" aria-expanded={open === i}>
              {q}
              <ChevronDown className={cn("size-4 shrink-0 text-[#5f6368] transition-transform", open === i && "rotate-180")} aria-hidden />
            </button>
            {open === i && (
              <div className="pb-4 text-[14px] leading-[1.58] text-[#4d5156]">
                {answerFor(q, keyword)}
                {intent && <div className="mt-2 text-[12px] text-[#70757a]">Answering this on your page is a {intent === "informational" ? "content" : "intent"} play in the lab.</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganicResult({ result, mobile }: { result: SerpResult; mobile: boolean }) {
  return (
    <div className="group/result">
      <div className="flex items-center gap-2.5">
        <Favicon domain={result.domain} size={26} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[14px] text-[#202124]">{siteName(result.domain)}</div>
          <div className="truncate text-[12px] text-[#4d5156]">
            {result.domain}
            {pathOf(result.url)}
          </div>
        </div>
        {result.hint && !mobile && (
          <span className="ml-auto hidden max-w-[220px] truncate rounded-full bg-[#f1f3f4] px-2 py-0.5 font-sans text-[11px] text-[#5f6368] opacity-0 transition-opacity group-hover/result:opacity-100 md:inline" title={result.hint}>
            {result.authority ? `Authority ~${result.authority} · ` : ""}
            {result.hint}
          </span>
        )}
      </div>
      <a href={result.url} onClick={(e) => e.preventDefault()} className="mt-1 block text-[20px] leading-[1.3] text-google-title hover:underline">
        {result.title}
      </a>
      <p className="mt-1 text-[14px] leading-[1.58] text-google-snippet">{result.snippet}</p>
      {result.sitelinks?.length ? (
        <div className={cn("mt-3 grid gap-x-8 gap-y-2", mobile ? "grid-cols-1" : "grid-cols-2")}>
          {result.sitelinks.map((s) => (
            <div key={s}>
              <div className="text-[15px] text-google-title">{s}</div>
              <div className="text-[13px] text-google-snippet">Read more about {s.toLowerCase()} on {siteName(result.domain)}.</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function YouCard({ result, rank, live, mobile }: { result: SerpResult; rank: number; live: boolean; mobile: boolean }) {
  return (
    <motion.div
      layoutId="you-card"
      className="relative -mx-3 rounded-2xl bg-[#f6ffdf] px-3 py-3 ring-2 ring-[#a8e01f] shadow-[0_0_0_6px_rgba(199,255,59,0.18)]"
      initial={false}
    >
      <div className="absolute -top-3 left-3 flex items-center gap-1.5">
        <span className="rounded-full bg-ink-900 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-signal shadow-card">
          #{rank} · {live ? "your modeled slot" : "you · modeled"}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <Favicon domain={result.domain} size={26} you />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[14px] text-[#202124]">{siteName(result.domain)}</div>
          <div className="truncate text-[12px] text-[#4d5156]">
            {result.domain}
            {pathOf(result.url)}
          </div>
        </div>
      </div>
      <div className="mt-1 text-[20px] leading-[1.3] text-google-title">{result.title}</div>
      <p className="mt-1 text-[14px] leading-[1.58] text-google-snippet">{result.snippet}</p>
      {result.sitelinks?.length ? (
        <div className={cn("mt-3 grid gap-x-8 gap-y-2", mobile ? "grid-cols-1" : "grid-cols-2")}>
          {result.sitelinks.map((s) => (
            <div key={s} className="text-[15px] text-google-title">
              {s}
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

function PageTwoCard({ result }: { result: SerpResult }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9cdd3] bg-[#fafafa] p-4 font-sans">
      <div className="text-[12px] font-semibold tracking-wider text-[#5f6368] uppercase">Page 2</div>
      <div className="mt-1 flex items-center gap-2 text-[14px] text-[#202124]">
        <Favicon domain={result.domain} size={18} you />
        {result.domain} is modeled beyond position 10. Apply plays to bring it onto page one.
      </div>
    </div>
  );
}
