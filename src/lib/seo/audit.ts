import type { SeoSnapshot } from "./types";

export type AuditCheck = {
  id: string;
  label: string;
  detail: string;
  pass: boolean;
  weight: number;
};

export function buildAudit(s: SeoSnapshot): AuditCheck[] {
  const altRatio = s.imagesTotal ? s.imagesWithAlt / s.imagesTotal : 1;
  return [
    {
      id: "title",
      label: "Title 15–60 χαρακτήρες",
      detail: s.title ? `${s.titleChars} χαρ. · ${s.title}` : "Λείπει title",
      pass: s.titleChars >= 15 && s.titleChars <= 60,
      weight: 12,
    },
    {
      id: "meta",
      label: "Meta description 70–160",
      detail: s.metaDescription ? `${s.descriptionChars} χαρ.` : "Λείπει description",
      pass: s.descriptionChars >= 70 && s.descriptionChars <= 160,
      weight: 10,
    },
    {
      id: "h1",
      label: "Ένα μοναδικό H1",
      detail: s.h1.length ? s.h1.join(" · ") : "Χωρίς H1",
      pass: s.h1.length === 1,
      weight: 10,
    },
    {
      id: "words",
      label: "Βάθος περιεχομένου",
      detail: `${s.wordCount} λέξεις`,
      pass: s.wordCount >= 600,
      weight: 12,
    },
    {
      id: "canonical",
      label: "Canonical",
      detail: s.canonical ?? "Λείπει",
      pass: Boolean(s.canonical),
      weight: 8,
    },
    {
      id: "viewport",
      label: "Mobile viewport",
      detail: s.hasViewport ? "Ορίστηκε" : "Λείπει meta viewport",
      pass: s.hasViewport,
      weight: 6,
    },
    {
      id: "og",
      label: "Open Graph",
      detail: s.ogTitle || s.ogDescription ? `${s.ogTitle ?? "—"}` : "Λείπει og:title/description",
      pass: Boolean(s.ogTitle && s.ogDescription),
      weight: 6,
    },
    {
      id: "schema",
      label: "JSON-LD schema",
      detail: s.schemaTypes.length ? s.schemaTypes.join(", ") : "Χωρίς structured data",
      pass: s.schemaTypes.length > 0,
      weight: 8,
    },
    {
      id: "alt",
      label: "Alt text σε εικόνες",
      detail: `${s.imagesWithAlt}/${s.imagesTotal}`,
      pass: altRatio >= 0.7,
      weight: 6,
    },
    {
      id: "internal",
      label: "Εσωτερική διασύνδεση",
      detail: `${s.linksInternal} internal · ${s.linksExternal} external`,
      pass: s.linksInternal >= 5,
      weight: 8,
    },
    {
      id: "robots",
      label: "Robots δεν αποκλείει index",
      detail: s.robots ?? "Δεν ορίστηκε (ok)",
      pass: !s.robots || !/noindex/i.test(s.robots),
      weight: 10,
    },
    {
      id: "live",
      label: "Live HTML fetch",
      detail: s.source === "live" ? "Διαβάστηκε η σελίδα" : s.source === "partial" ? "Μερική ανάγνωση" : "Instant σκηνή",
      pass: s.source === "live",
      weight: 4,
    },
  ];
}

export function auditScore(checks: AuditCheck[]): number {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  return total ? Math.round((got / total) * 100) : 0;
}
