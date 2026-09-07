import { ArrowUp, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { selectActive, useLab } from "@/store/lab";
import { suggestedPrompts } from "@/lib/seo/coach";
import { cn } from "@/lib/utils";

/** Bold via **text**, bullets and numbered lines. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={cn("space-y-1.5", className)}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} className="font-semibold text-fg">
              {p.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        );
        const bullet = /^([•\-]|\d+\.)\s/.test(line);
        return (
          <p key={i} className={cn(bullet && "pl-3")}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

export function CoachPanel({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const lab = useLab();
  const { niche, scene } = selectActive(lab);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const prompts = lab.analysis ? suggestedPrompts({ analysis: lab.analysis, niche, scene, gscRows: lab.gscRows }) : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [lab.coach.length]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    lab.ask(text);
    setText("");
  }

  if (!lab.analysis) {
    return <div className={cn("p-6 text-[14px] text-fg-muted", className)}>Run a URL first. The coach answers from the analysis and the active scene.</div>;
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {lab.coach.length === 0 && (
          <div className="rounded-2xl bg-ink-800/70 p-4 ring-hairline">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <Sparkles className="size-4 text-signal" /> Coach
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              I answer from your data: the {lab.analysis.score}/100 on-page score, the active scene{niche ? ` (“${niche.keyword}”)` : ""}, applied plays and any Search Console rows. Rule-based, no black box.
            </p>
          </div>
        )}
        {lab.coach.map((m) => (
          <div key={m.id} className={cn("max-w-[92%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed", m.role === "user" ? "ml-auto rounded-br-sm bg-signal text-ink-900" : "rounded-bl-sm bg-ink-800/80 text-fg-muted ring-hairline")}>
            {m.role === "user" ? m.text : <RichText text={m.text} />}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-white/8 p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {prompts.slice(0, 4).map((p) => (
            <button key={p} type="button" onClick={() => lab.ask(p)} className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:border-white/25 hover:text-fg">
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-ink-600 bg-ink-900/60 p-1.5 pl-4 focus-within:border-signal/70">
          <input value={text} onChange={(e) => setText(e.target.value)} autoFocus={autoFocus} placeholder="Ask why, what first, how many clicks…" aria-label="Ask the coach" className="h-9 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-fg-subtle" />
          {lab.coach.length > 0 && (
            <button type="button" onClick={lab.clearCoach} className="grid size-9 place-items-center rounded-xl text-fg-subtle hover:bg-white/5 hover:text-fg" aria-label="Clear conversation">
              <Trash2 className="size-4" />
            </button>
          )}
          <button type="submit" className="grid size-9 place-items-center rounded-xl bg-signal text-ink-900 hover:bg-signal-600" aria-label="Send">
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
