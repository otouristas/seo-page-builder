import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, MessageCircle, Radio, Search, ShieldCheck, Upload, KeyRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";

function Tile({ to, title, description, icon: Icon, className, children }: { to: "serp" | "audit" | "keywords" | "gsc" | "coach" | "overview"; title: string; description: string; icon: typeof Search; className?: string; children: React.ReactNode }) {
  return (
    <Link to="/app" search={{ tab: to, demo: true }} className={cn("group relative flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-paper ring-hairline-paper transition-[transform,box-shadow] duration-300 ease-fluid hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(10,15,30,0.35)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-ink-900 text-signal">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-ink-900/30 transition-colors group-hover:text-ink-900" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink-900">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-paper-muted">{description}</p>
      <div className="mt-6 flex-1">{children}</div>
    </Link>
  );
}

function MiniSerp() {
  const rows = ["forbes.com", "you", "g2.com", "reddit.com"];
  return (
    <div className="space-y-2 rounded-2xl bg-paper p-3 ring-hairline-paper">
      {rows.map((r, i) => (
        <div key={r} className={cn("rounded-xl px-3 py-2", r === "you" ? "bg-[#f6ffdf] ring-2 ring-[#a8e01f]" : "bg-white")}>
          <div className="flex items-center gap-2">
            <span className={cn("size-3 rounded-full", r === "you" ? "bg-ink-900" : "bg-ink-900/15")} />
            <span className="text-[11px] text-paper-muted">{r === "you" ? "yoursite.com" : r}</span>
            {r === "you" && <span className="ml-auto rounded-full bg-ink-900 px-1.5 py-0.5 font-mono text-[9px] text-signal">#{i + 1} you</span>}
          </div>
          <div className="mt-1 h-2 w-3/4 rounded bg-[#1a0dab]/70" />
          <div className="mt-1 h-1.5 w-full rounded bg-ink-900/10" />
        </div>
      ))}
    </div>
  );
}

function MiniAudit() {
  const items: [string, boolean][] = [
    ["Title 15–60 chars", true],
    ["Meta description", false],
    ["Exactly one H1", true],
    ["JSON-LD schema", false],
  ];
  return (
    <div className="space-y-1.5">
      {items.map(([label, pass]) => (
        <div key={label} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-[13px] text-ink-900">
          {label}
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", pass ? "bg-success/15 text-[#0b7a4b]" : "bg-danger/15 text-[#b42323]")}>
            {pass ? <Check className="size-3" /> : <X className="size-3" />} {pass ? "Pass" : "Fix"}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniKeywords() {
  const chips: [string, string][] = [
    ["payment processing", "bg-warn/20 text-[#7a4b00]"],
    ["what is a payment gateway", "bg-peri/20 text-[#2c4bb5]"],
    ["buy pos terminal", "bg-success/20 text-[#0b7a4b]"],
    ["stripe", "bg-ink-900/8 text-ink-900"],
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(([c, cls]) => (
        <span key={c} className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium", cls)}>
          {c}
        </span>
      ))}
    </div>
  );
}

function MiniGsc() {
  const rows: [string, number, number][] = [
    ["online payments", 14110, 8.1],
    ["best payment gateway", 9100, 14.2],
    ["stripe billing", 6200, 4.7],
  ];
  return (
    <div className="overflow-hidden rounded-xl ring-hairline-paper">
      {rows.map(([q, imp, pos]) => (
        <div key={q} className="flex items-center gap-3 border-b border-ink-900/6 bg-white px-3 py-2 text-[12px] last:border-0">
          <span className="min-w-0 flex-1 truncate text-ink-900">{q}</span>
          <span className="text-paper-muted tabular">{imp.toLocaleString("en")}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular", pos >= 8 && pos <= 20 ? "bg-signal/40 text-ink-900" : "bg-ink-900/6 text-paper-muted")}>#{pos}</span>
        </div>
      ))}
    </div>
  );
}

function MiniCoach() {
  return (
    <div className="space-y-2">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink-900 px-3 py-2 text-[12px] text-fg">Why am I not on page one?</div>
      <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-paper px-3 py-2 text-[12px] leading-relaxed text-ink-900">
        Two failing checks and a contested niche. Start with the title rewrite and the comparison table.
      </div>
    </div>
  );
}

function MiniLive() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-paper p-3 ring-hairline-paper">
      <div className="flex items-center gap-2 text-[13px] text-ink-900">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        Live · google.gr
      </div>
      <span className="rounded-full bg-ink-900 px-2.5 py-1 font-mono text-[11px] text-signal tabular">3/8 today</span>
    </div>
  );
}

export function FeatureBento() {
  return (
    <div id="product" className="py-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow tone="paper">Product</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance sm:text-5xl">Six tabs. One stage. Every move shows its effect.</h2>
          <p className="mt-4 text-lg text-paper-muted">The lab is built around a Google-like results page. Everything else feeds it: the audit, your keywords, your Search Console data, and a coach that explains the gap.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tile to="serp" title="SERP Lab" description="AI Overview, featured snippet, People also ask and ten organic slots. Tick a play and your card climbs." icon={Search} className="md:col-span-2 lg:row-span-2">
            <MiniSerp />
          </Tile>
          <Tile to="audit" title="Audit" description="Twelve weighted checks read from the real HTML, each with the fix written out." icon={ShieldCheck}>
            <MiniAudit />
          </Tile>
          <Tile to="keywords" title="Keywords" description="Stage any query. Intent, difficulty and plays are modeled on the spot." icon={KeyRound}>
            <MiniKeywords />
          </Tile>
          <Tile to="gsc" title="Search Console" description="Drop the export. Striking-distance queries light up and open as scenes." icon={Upload}>
            <MiniGsc />
          </Tile>
          <Tile to="coach" title="Coach" description="Ask why, what first, or how many clicks. Answers come from your data." icon={MessageCircle}>
            <MiniCoach />
          </Tile>
          <Tile to="serp" title="Live page one" description="Swap the modeled competitors for today's real results. Eight lookups a day." icon={Radio}>
            <MiniLive />
          </Tile>
        </div>
      </Container>
    </div>
  );
}
