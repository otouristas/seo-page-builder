import { Link2, Layers, Play } from "lucide-react";
import { Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";

const STEPS = [
  { icon: Link2, title: "Paste a URL", body: "Rankframe fetches the live HTML and runs weighted checks: title, meta, headings, main-content depth, schema, lang, hreflang, links, indexability." },
  { icon: Layers, title: "See the scene", body: "The best keyphrases become scenes: a Google-like page one with the competitors that intent attracts, and your card at its modeled slot." },
  { icon: Play, title: "Run the plays", body: "Each play is a concrete change. Tick it and watch the position move. Pull the real page one when you want to check the field." },
];

export function HowItWorks() {
  return (
    <div className="border-t border-ink-900/8 py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow tone="paper">How it works</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance">Three steps from URL to a plan you can defend.</h2>
            <p className="mt-4 text-paper-muted">Positions are modeled from hygiene, query relevance and contest — with a competition floor — and labeled as such everywhere. The point is to see cause and effect, fast.</p>
          </div>
          <ol className="relative space-y-8">
            <span className="absolute left-5 top-6 bottom-6 w-px border-l border-dashed border-ink-900/20" aria-hidden />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-5">
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 font-mono text-[12px] font-semibold text-signal ring-4 ring-paper">{i + 1}</span>
                <div className="rounded-2xl bg-white p-5 shadow-paper ring-hairline-paper">
                  <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
                    <s.icon className="size-4 text-peri-700" /> {s.title}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-paper-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </div>
  );
}
