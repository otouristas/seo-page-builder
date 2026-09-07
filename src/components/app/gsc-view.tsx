import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpDown, CloudUpload, FileText, Save, Trash2 } from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import type { AppTab, GscRow } from "@/lib/seo/types";
import { useLab } from "@/store/lab";
import { gscTotals, parseGscExport, SAMPLE_GSC_CSV } from "@/lib/seo/gsc";
import { ctrAt } from "@/lib/seo/ctr-curve";
import { saveGscRows } from "@/server/gsc";
import { recordLabEvent } from "@/server/stats";
import { cn, formatNumber } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/misc";
import { useToast } from "./toast";

type SortKey = keyof GscRow;
type Filter = "all" | "striking" | "ctr";

function isStriking(r: GscRow) {
  return r.position >= 8 && r.position <= 20;
}
function isCtrOpportunity(r: GscRow) {
  return r.impressions >= 100 && r.position > 0 && r.position <= 10 && r.ctr < ctrAt(Math.round(r.position)) * 0.6;
}

export function GscView({ onTab }: { onTab: (t: AppTab) => void }) {
  const lab = useLab();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "clicks", dir: "desc" });
  const [filter, setFilter] = useState<Filter>("all");
  const [saving, setSaving] = useState(false);
  const rows = lab.gscRows;
  const totals = gscTotals(rows);
  const signedIn = Boolean(lab.session?.user);

  const shown = useMemo(() => {
    const filtered = rows.filter((r) => (filter === "striking" ? isStriking(r) : filter === "ctr" ? isCtrOpportunity(r) : true));
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, filter]);

  function load(text: string, source: "sample" | "file") {
    const parsed = parseGscExport(text);
    if (!parsed.length) {
      toast.show("Couldn't find a Query column in that file");
      return;
    }
    lab.setGscRows(parsed, source);
    toast.show(`${parsed.length} queries imported`);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    load(await file.text(), "file");
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    void onFile(e.dataTransfer.files[0]);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await saveGscRows({ data: { rows } });
      toast.show(res.ok ? `Saved ${res.saved} rows to your account` : (res.error ?? "Could not save"));
      if (res.ok) lab.setGscRows(rows, "saved");
    } finally {
      setSaving(false);
    }
  }

  function stage(row: GscRow) {
    const niche = lab.stageKeyword(row.query, "gsc");
    if (niche) {
      void recordLabEvent({ data: { kind: "stage" } }).catch(() => undefined);
      onTab("serp");
    }
  }

  const striking = rows.filter(isStriking).length;
  const ctrOpp = rows.filter(isCtrOpportunity).length;

  const header = (key: SortKey, label: string, align: "left" | "right" = "right") => (
    <th className={cn("px-3 py-2 font-mono text-[10px] font-medium tracking-wider text-fg-subtle uppercase", align === "right" ? "text-right" : "text-left")}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))} className={cn("inline-flex items-center gap-1 hover:text-fg", sort.key === key && "text-fg")}>
        {label} <ArrowUpDown className="size-3" />
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card
          className={cn("relative p-6 transition-colors", drag && "bg-signal/10 ring-1 ring-signal")}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => onFile(e.target.files?.[0])} />
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink-900 text-signal ring-hairline">
              <CloudUpload className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-semibold tracking-tight">Drop a Search Console export</div>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">Performance → Queries → Export (CSV or TSV). Columns Query, Clicks, Impressions, CTR, Position. Greek headers work too. Nothing leaves your browser unless you save.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => fileRef.current?.click()} leading={<FileText className="size-4" />}>
                  Choose file
                </Button>
                <Button size="sm" variant="outline" onClick={() => load(SAMPLE_GSC_CSV, "sample")}>
                  Load sample
                </Button>
                {rows.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => lab.setGscRows([], "none")} leading={<Trash2 className="size-4" />}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Queries" value={formatNumber(totals.queries)} />
            <Stat label="Clicks" value={formatNumber(totals.clicks)} />
            <Stat label="Impressions" value={formatNumber(totals.impressions)} />
            <Stat label="Avg CTR" value={totals.impressions ? `${((totals.clicks / totals.impressions) * 100).toFixed(1)}%` : "—"} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px] text-fg-muted">
            {lab.gscSource === "saved" && <Badge tone="success" dot>Saved to your account</Badge>}
            {lab.gscSource === "sample" && <Badge tone="peri" dot>Sample data</Badge>}
            {lab.gscSource === "file" && <Badge tone="signal" dot>Imported this session</Badge>}
            {rows.length > 0 &&
              (signedIn ? (
                <Button size="xs" variant="secondary" onClick={save} disabled={saving || lab.gscSource === "saved"} leading={<Save className="size-3" />}>
                  {saving ? "Saving…" : "Save to account"}
                </Button>
              ) : lab.session?.authEnabled ? (
                <Link to="/login" className="font-medium text-signal hover:underline">
                  Sign in to keep this →
                </Link>
              ) : null)}
          </div>
        </Card>
      </div>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex-wrap">
            <div>
              <CardTitle>Queries</CardTitle>
              <div className="text-[12px] text-fg-muted">Striking distance = positions 8–20. CTR opportunity = page-one query clicking well below the curve.</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", `All (${rows.length})`],
                  ["striking", `Striking distance (${striking})`],
                  ["ctr", `CTR opportunity (${ctrOpp})`],
                ] as [Filter, string][]
              ).map(([f, label]) => (
                <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-[12px] font-medium transition-colors", filter === f ? "bg-signal text-ink-900" : "bg-white/6 text-fg-muted hover:text-fg")}>
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-white/8">
                  {header("query", "Query", "left")}
                  {header("clicks", "Clicks")}
                  {header("impressions", "Impressions")}
                  {header("ctr", "CTR")}
                  {header("position", "Position")}
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const staged = lab.analysis?.niches.some((n) => n.keyword === r.query.toLowerCase());
                  return (
                    <tr key={r.query} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                      <td className="max-w-[320px] truncate px-3 py-2.5">
                        <span className="text-fg">{r.query}</span>
                        {isStriking(r) && (
                          <Badge tone="signal" size="sm" className="ml-2">
                            striking
                          </Badge>
                        )}
                        {isCtrOpportunity(r) && (
                          <Badge tone="warn" size="sm" className="ml-2">
                            ctr
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular">{formatNumber(r.clicks)}</td>
                      <td className="px-3 py-2.5 text-right tabular">{formatNumber(r.impressions)}</td>
                      <td className="px-3 py-2.5 text-right tabular">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2.5 text-right tabular">{r.position.toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Button size="xs" variant={staged ? "ghost" : "secondary"} onClick={() => stage(r)} trailing={<ArrowRight className="size-3" />}>
                          {staged ? "Open" : "Stage"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
