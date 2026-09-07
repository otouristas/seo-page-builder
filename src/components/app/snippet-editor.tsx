import { RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLab } from "@/store/lab";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/misc";
import { SnippetPreview } from "./snippet-preview";

const TITLE_PX = 580;
const DESC_PX = 920;

/** Measures rendered text width with a canvas; falls back to a per-character estimate on the server. */
function useTextWidth(text: string, font: string) {
  const [width, setWidth] = useState(() => text.length * (font.startsWith("20px") ? 9.2 : 6.6));
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = font;
    setWidth(ctx.measureText(text).width);
  }, [text, font]);
  return width;
}

function Meter({ label, px, limit, chars, range }: { label: string; px: number; limit: number; chars: number; range: [number, number] }) {
  const pct = (px / limit) * 100;
  const over = px > limit;
  const okChars = chars >= range[0] && chars <= range[1];
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-fg-muted">{label}</span>
        <span className={cn("font-mono tabular", over ? "text-danger" : okChars ? "text-success" : "text-warn")}>
          {chars} chars · {Math.round(px)}/{limit}px
        </span>
      </div>
      <Progress value={pct} tone={over ? "danger" : okChars ? "success" : "warn"} className="mt-1.5" />
    </div>
  );
}

export function SnippetEditor() {
  const lab = useLab();
  const snapshot = lab.analysis!.snapshot;
  const [title, setTitle] = useState(snapshot.title);
  const [desc, setDesc] = useState(snapshot.metaDescription);
  useEffect(() => {
    setTitle(snapshot.title);
    setDesc(snapshot.metaDescription);
  }, [snapshot.title, snapshot.metaDescription]);

  const titlePx = useTextWidth(title, "20px arial");
  const descPx = useTextWidth(desc, "14px arial");
  const dirty = title !== snapshot.title || desc !== snapshot.metaDescription;
  const keywords = useMemo(() => lab.analysis!.niches.map((n) => n.keyword), [lab.analysis]);
  const titleHasKw = keywords.some((k) => title.toLowerCase().includes(k));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted" htmlFor="snippet-title">
            Title tag
          </label>
          <Input id="snippet-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt-2">
            <Meter label={titleHasKw ? "Contains a staged keyword" : "No staged keyword in the title"} px={titlePx} limit={TITLE_PX} chars={title.length} range={[15, 60]} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted" htmlFor="snippet-desc">
            Meta description
          </label>
          <Textarea id="snippet-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="mt-2">
            <Meter label="Two lines on desktop" px={descPx} limit={DESC_PX} chars={desc.length} range={[70, 160]} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={!dirty} onClick={() => lab.updateSnapshot({ title, metaDescription: desc })} leading={<Save className="size-3.5" />}>
            Apply to the scene
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!dirty}
            onClick={() => {
              setTitle(snapshot.title);
              setDesc(snapshot.metaDescription);
            }}
            leading={<RotateCcw className="size-3.5" />}
          >
            Reset
          </Button>
          <span className="text-[12px] text-fg-muted">Applying re-runs the checks and re-models every scene with the new copy.</span>
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-[12px] font-medium text-fg-muted">Preview</div>
        <SnippetPreview url={snapshot.finalUrl} title={title} description={desc} />
      </div>
    </div>
  );
}
