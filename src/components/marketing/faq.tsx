import { Container } from "@/components/patterns";
import { Accordion } from "@/components/ui/misc";
import { Eyebrow } from "@/components/ui/badge";

const QA: [string, string][] = [
  ["Are the positions real Google rankings?", "No. Positions in the lab are modeled from your on-page score and the difficulty of the niche, and every one of them is labeled modeled. Pull a live page one to see the real results; your slot inside them stays modeled."],
  ["What does Rankframe actually read from my page?", "The live HTML: title, meta description, canonical, robots, language, H1–H3, Open Graph, JSON-LD types, word count, images and alt text, internal and external links, and the viewport tag. Nothing is executed; scripts are ignored."],
  ["Where do the competitors in the scene come from?", "From a curated pool per intent and market: encyclopedias and guides for informational queries, review sites and marketplaces for commercial and transactional ones. Titles and snippets are templated. Live mode replaces them with today's real results."],
  ["Do I need Google Search Console access?", "No. Export queries from Search Console (CSV or TSV) and drop the file in. Signed-in users keep the import; guests see it for the session."],
  ["How do the plays move my result?", "Each play has an impact and a pillar weight. Applying it shrinks the modeled distance to position one. Quick wins are low effort with decent impact; authority plays move the most but take longer."],
  ["Which markets are supported?", "Greece (google.gr) and the United States (google.com) today, for both the competitor pools and live lookups. Other markets are on request."],
];

export function Faq() {
  return (
    <div id="faq" className="border-t border-ink-900/8 py-24">
      <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <Eyebrow tone="paper">FAQ</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance">Straight answers.</h2>
          <p className="mt-4 text-paper-muted">If something here sounds too good, it's probably the part that's modeled. We label it.</p>
        </div>
        <div className="space-y-3">
          {QA.map(([q, a]) => (
            <Accordion key={q} title={q} paper>
              {a}
            </Accordion>
          ))}
        </div>
      </Container>
    </div>
  );
}
