export type GscRow = {
  date: string;
  dataset: string;
  query: string;
  page: string;
  country: string;
  device: string;
  clicks: number;
  impressions: number;
  position: number;
  property?: string;
};
export function summarizeGsc(rows: GscRow[]) {
  const totals = rows.filter((r) => r.dataset === "totals");
  const dates = [...new Set(totals.map((r) => r.date))].sort();
  if (!dates.length) return null;
  const end = dates.at(-1)!;
  const start = new Date(`${end}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 27);
  const previous = new Date(start);
  previous.setUTCDate(previous.getUTCDate() - 28);
  const currentStart = start.toISOString().slice(0, 10),
    previousStart = previous.toISOString().slice(0, 10);
  const sum = (data: GscRow[]) => {
    const clicks = data.reduce((s, r) => s + r.clicks, 0),
      impressions = data.reduce((s, r) => s + r.impressions, 0);
    return {
      clicks,
      impressions,
      ctr: impressions ? clicks / impressions : 0,
      position: impressions
        ? data.reduce((s, r) => s + r.position * r.impressions, 0) / impressions
        : 0,
      days: new Set(data.map((r) => r.date)).size,
    };
  };
  const current = sum(
    totals.filter((r) => r.date >= currentStart && r.date <= end),
  );
  const prior = sum(
    totals.filter((r) => r.date >= previousStart && r.date < currentStart),
  );
  return {
    current,
    previous: prior,
    currentStart,
    previousStart,
    end,
    complete: current.days === 28 && prior.days === 28,
    change: prior.clicks
      ? (current.clicks - prior.clicks) / prior.clicks
      : null,
    series: totals
      .filter((r) => r.date >= currentStart && r.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
// CSV fallback is deliberately separate from API totals and never added to them.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV has an unclosed quoted field.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function parseGscCsv(text: string) {
  const [headers, ...records] = parseCsv(text.replace(/^\uFEFF/, ""));
  if (!headers) throw new Error("The CSV is empty.");
  const h = headers.map((v) => v.trim().toLowerCase());
  const index = (name: string) => h.indexOf(name);
  if (
    !["date", "clicks", "impressions", "position"].every((k) => index(k) >= 0)
  )
    throw new Error(
      "Use a dated Search Console CSV with Date, Clicks, Impressions and Position columns.",
    );
  if (records.length > 10000)
    throw new Error("Import up to 10,000 rows at a time.");
  return records.map((r, n) => {
    const date = r[index("date")]?.trim();
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date
    )
      throw new Error(`Row ${n + 2}: use dates in YYYY-MM-DD format.`);
    const number = (key: string) => {
      const value = Number(r[index(key)]?.replace(/,/g, ""));
      if (!Number.isFinite(value) || value < 0)
        throw new Error(`Row ${n + 2}: invalid ${key}.`);
      return value;
    };
    return {
      date,
      query: r[index("query")] || r[index("top queries")] || "",
      page: r[index("page")] || r[index("top pages")] || "",
      country: r[index("country")] || "",
      device: r[index("device")] || "",
      clicks: number("clicks"),
      impressions: number("impressions"),
      position: number("position"),
    };
  });
}
