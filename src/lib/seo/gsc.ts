import type { GscRow } from "./types";

function num(raw: string): number {
  const cleaned = raw.replace(/%/g, "").replace(/,/g, "").replace(/\s/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parseGscExport(text: string): GscRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0]!.toLowerCase();
  const delim = header.includes("\t") ? "\t" : ",";
  const cols = header.split(delim).map((c) => c.replace(/"/g, "").trim());

  const qi = cols.findIndex((c) => /query|ερώτημα|orisma|keyword/.test(c));
  const ci = cols.findIndex((c) => /click|κλικ/.test(c));
  const ii = cols.findIndex((c) => /impression|εμφαν/.test(c));
  const ti = cols.findIndex((c) => /ctr/.test(c));
  const pi = cols.findIndex((c) => /position|θέση|thesi/.test(c));
  if (qi < 0) return [];

  const rows: GscRow[] = [];
  for (const line of lines.slice(1)) {
    const parts = line.split(delim).map((p) => p.replace(/^"|"$/g, "").trim());
    const query = parts[qi] ?? "";
    if (!query) continue;
    const clicks = ci >= 0 ? num(parts[ci] ?? "0") : 0;
    const impressions = ii >= 0 ? num(parts[ii] ?? "0") : 0;
    let ctr = ti >= 0 ? num(parts[ti] ?? "0") : 0;
    if (ctr > 1) ctr = ctr / 100;
    const position = pi >= 0 ? num(parts[pi] ?? "0") : 0;
    rows.push({ query, clicks, impressions, ctr, position });
  }
  return rows.slice(0, 200);
}

export function gscTotals(rows: GscRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.clicks += row.clicks;
      acc.impressions += row.impressions;
      acc.queries += 1;
      return acc;
    },
    { clicks: 0, impressions: 0, queries: 0 },
  );
}

export const SAMPLE_GSC_CSV = `Query,Clicks,Impressions,CTR,Position
payment processing,420,18200,2.3,6.4
online payments,310,14110,2.2,8.1
stripe billing,188,6200,3.0,4.7
best payment gateway,96,9100,1.1,14.2
financial infrastructure,54,2400,2.2,9.8`;
