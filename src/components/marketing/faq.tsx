import { Container } from "@/components/patterns";
import { Accordion } from "@/components/ui/misc";
import { Eyebrow } from "@/components/ui/badge";

const QA: [string, string][] = [
  ["Are the positions real Google rankings?", "No. Positions in the lab are modeled from three forces — hygiene (on-page checks), relevance (query vs page), and contest (intent + phrase length) — plus a competition floor so plays cannot click you past Wikipedia. Every rank is labeled modeled. Pull a live page one to see the real results; your slot inside them stays modeled."],
  ["What does Rankframe actually read from my page?", "The live HTML: title, meta description, canonical, robots (including X-Robots-Tag), language, hreflang, H1–H3, Open Graph, JSON-LD types, main-content word count, excerpt, images and alt text, internal and external links, and the viewport tag. Nothing is executed; scripts are ignored."],
  ["Where do the competitors in the scene come from?", "From a language pool plus a small local overlay for the selected market (google.com, google.de, google.gr, google.com.br, and the rest of the Day 0 catalog). Titles and snippets follow the keyword's language. Live mode replaces competitors with today's real results."],
  ["Do I need Google Search Console access?", "No. Export queries from Search Console (CSV or TSV) and drop the file in. Signed-in users keep the import; guests see it for the session. Headers in English, German, French, Spanish, Italian, Dutch, Portuguese and Greek are recognized."],
  ["How do the plays move my result?", "Each play has an impact and a pillar weight. Applying it shrinks modeled distance, with diminishing returns. You cannot cross the competition floor. Quick wins are low effort with decent impact; authority plays move more but take longer."],
  ["Which markets are supported?", "Fourteen on day 0: United States, United Kingdom, Canada, Australia, India, Germany, France, Spain, Italy, Netherlands, Greece, Brazil, Mexico, and the UAE. Live lookups use the matching Google host and DataForSEO location."],
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
