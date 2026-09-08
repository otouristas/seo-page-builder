import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import type { AppTab } from "@/lib/seo/types";
import { useLab } from "@/store/lab";
import { buildAudit, groupScore, type AuditGroup } from "@/lib/seo/audit";
import { cn } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialGauge } from "@/components/charts";
import { Progress } from "@/components/ui/misc";
import { SnippetEditor } from "./snippet-editor";

type Filter = "all" | "fix" | "pass" | AuditGroup;

const GROUP_LABEL: Record<AuditGroup, string> = { "on-page": "On-page", content: "Content", technical: "Technical" };

export function AuditView({ onTab }: { onTab: (t: AppTab) => void }) {
  const lab = useLab();
  const analysis = lab.analysis!;
  const audit = buildAudit(analysis.snapshot, analysis.market);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const failing = audit.filter((c) => !c.pass);
  const shown = audit.filter((c) => (filter === "all" ? true : filter === "fix" ? !c.pass : filter === "pass" ? c.pass : c.group === filter));
  const weightTotal = audit.reduce((s, c) => s + c.weight, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex items-center gap-5 p-5">
          <RadialGauge value={analysis.score} size={112} stroke={9} label="on-page" />
          <div className="min-w-0">
            <div className="font-display text-xl font-semibold tracking-tight">Audit</div>
            <div className="text-[13px] text-fg-muted">
              {failing.length ? `${failing.length} of ${audit.length} checks need work.` : "Every check passes."}
            </div>
            <div className="mt-3 space-y-2">
              {(["on-page", "content", "technical"] as AuditGroup[]).map((g) => (
                <div key={g}>
                  <div className="flex justify-between text-[11px] text-fg-muted">
                    <span>{GROUP_LABEL[g]}</span>
                    <span className="font-mono tabular">{groupScore(audit, g)}</span>
                  </div>
                  <Progress value={groupScore(audit, g)} tone={g === "technical" ? "peri" : g === "content" ? "success" : "signal"} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Snippet editor</CardTitle>
              <div className="text-[12px] text-fg-muted">Rewrite the title and description, watch the pixel meters, apply to re-model.</div>
            </div>
          </CardHeader>
          <CardBody>
            <SnippetEditor />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle>{audit.length} weighted checks</CardTitle>
            <div className="text-[12px] text-fg-muted">Read from the real HTML. Weight shows how much each check moves the score.</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All"],
                ["fix", `Fix (${failing.length})`],
                ["pass", "Pass"],
                ["on-page", "On-page"],
                ["content", "Content"],
                ["technical", "Technical"],
              ] as [Filter, string][]
            ).map(([f, label]) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-[12px] font-medium transition-colors", filter === f ? "bg-signal text-ink-900" : "bg-white/6 text-fg-muted hover:text-fg")}>
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <ul className="divide-y divide-white/8">
            {shown.map((c) => {
              const isOpen = open === c.id;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center gap-3 py-3 text-left" aria-expanded={isOpen}>
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", c.pass ? "bg-success/15 text-success" : "bg-danger/15 text-danger")}>{c.pass ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{c.label}</span>
                      <span className="block truncate text-[12px] text-fg-muted">{c.detail}</span>
                    </span>
                    <span className="hidden w-28 sm:block">
                      <span className="block text-right font-mono text-[10px] text-fg-subtle">weight {c.weight}</span>
                      <Progress value={(c.weight / weightTotal) * 100 * 4} tone={c.pass ? "success" : "danger"} className="mt-1" />
                    </span>
                    <span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-[10px] text-fg-muted">{GROUP_LABEL[c.group]}</span>
                    <ChevronDown className={cn("size-4 text-fg-subtle transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="mb-3 ml-9 rounded-xl bg-ink-900/60 p-4 text-[13px] leading-relaxed ring-hairline">
                      <div className="font-mono text-[10px] tracking-wider text-fg-subtle uppercase">{c.pass ? "Why it passes" : "How to fix"}</div>
                      <p className="mt-1 text-fg">{c.pass ? c.detail : c.fix}</p>
                      {!c.pass && (c.id === "title" || c.id === "meta") && (
                        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-2 text-[12px] font-medium text-signal hover:underline">
                          Use the snippet editor above ↑
                        </button>
                      )}
                      {!c.pass && c.id !== "title" && c.id !== "meta" && (
                        <button type="button" onClick={() => onTab("serp")} className="mt-2 text-[12px] font-medium text-signal hover:underline">
                          See it as a play in the SERP Lab →
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
