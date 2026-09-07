import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Band, Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="paper min-h-dvh">
      <SiteHeader tone="paper" />
      <main>
        <Band paper>
          <Container className="max-w-3xl py-16">
            <Eyebrow tone="paper">Legal · updated {updated}</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900">{title}</h1>
            <div className="prose-legal mt-8 space-y-4 text-[15px] leading-relaxed text-paper-muted [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-900">{children}</div>
          </Container>
        </Band>
      </main>
      <SiteFooter />
    </div>
  );
}
