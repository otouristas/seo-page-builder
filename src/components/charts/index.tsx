import { useEffect, useState, type ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

/** Recharts needs the DOM; render children after mount and a same-size placeholder before. */
export function ClientChart({ height, children, className }: { height: number; children: ReactNode; className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {ready ? children : <div className="h-full w-full animate-shimmer rounded-xl bg-white/4 bg-shimmer" />}
    </div>
  );
}

const SERIES_COLORS = ["#c7ff3b", "#7c9bff", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"];

export type RankSeries = { name: string; points: (number | null)[] };

function rankValue(r: number | null) {
  return r === null ? 11 : r;
}

function RankTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-ink-950 px-3 py-2 text-[12px] shadow-card ring-hairline">
      <div className="mb-1 font-mono text-[10px] tracking-wider text-fg-subtle uppercase">Step {label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-fg-muted">{p.name}</span>
          <span className="ml-auto font-medium tabular">{p.value >= 11 ? "Page 2" : `#${p.value}`}</span>
        </div>
      ))}
    </div>
  );
}

/** Multi-series modeled rank chart. Y axis is inverted so #1 sits on top. */
export function RankChart({ series, height = 220 }: { series: RankSeries[]; height?: number }) {
  const len = Math.max(2, ...series.map((s) => s.points.length));
  const data = Array.from({ length: len }, (_, i) => {
    const row: Record<string, number> = { step: i };
    series.forEach((s) => {
      const v = s.points[Math.min(i, s.points.length - 1)] ?? null;
      row[s.name] = rankValue(v);
    });
    return row;
  });
  return (
    <ClientChart height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -18 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="step" tick={{ fill: "#5b6478", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis reversed domain={[1, 11]} ticks={[1, 3, 5, 7, 9, 11]} tick={{ fill: "#5b6478", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 11 ? "P2" : `#${v}`)} />
          <Tooltip content={<RankTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
          {series.map((s, i) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: SERIES_COLORS[i % SERIES_COLORS.length] }} activeDot={{ r: 5 }} isAnimationActive />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ClientChart>
  );
}

/** Single-series area for a niche's trajectory. */
export function RankArea({ points, height = 140, color = "#c7ff3b" }: { points: (number | null)[]; height?: number; color?: string }) {
  const data = points.map((p, i) => ({ step: i, rank: rankValue(p) }));
  return (
    <ClientChart height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="step" hide />
          <YAxis reversed domain={[1, 11]} ticks={[1, 5, 11]} tick={{ fill: "#5b6478", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 11 ? "P2" : `#${v}`)} />
          <Tooltip content={<RankTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
          <Area type="monotone" dataKey="rank" name="Modeled" stroke={color} strokeWidth={2.5} fill="url(#rankFill)" dot={{ r: 3, strokeWidth: 0, fill: color }} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </ClientChart>
  );
}

/** Tiny inline SVG sparkline of ranks (1 on top). */
export function Sparkline({ points, width = 120, height = 36, color = "#c7ff3b", className }: { points: (number | null)[]; width?: number; height?: number; color?: string; className?: string }) {
  const vals = points.length >= 2 ? points : [...points, ...points];
  const n = vals.length;
  const coords = vals.map((p, i) => {
    const x = (i / (n - 1)) * (width - 6) + 3;
    const y = ((rankValue(p) - 1) / 10) * (height - 8) + 4;
    return [x, y] as const;
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1]!;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} />
    </svg>
  );
}

/** SVG arc gauge for 0–100 scores. */
export function RadialGauge({ value, size = 96, stroke = 8, label, tone, className, paper }: { value: number; size?: number; stroke?: number; label?: ReactNode; tone?: "auto" | "signal" | "peri"; className?: string; paper?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const dash = (v / 100) * arc;
  const color = tone === "peri" ? "#7c9bff" : tone === "signal" ? "#c7ff3b" : v >= 80 ? "#34d399" : v >= 55 ? "#c7ff3b" : v >= 35 ? "#fbbf24" : "#f87171";
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={paper ? "rgba(10,15,30,0.08)" : "rgba(255,255,255,0.08)"} strokeWidth={stroke} strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${c}`} strokeLinecap="round" className="transition-[stroke-dasharray] duration-700 ease-fluid" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={cn("font-display font-semibold tracking-tight tabular", size >= 120 ? "text-3xl" : "text-xl", paper ? "text-ink-900" : "text-fg")}>{Math.round(v)}</div>
          {label && <div className={cn("-mt-0.5 font-mono text-[10px] tracking-wider uppercase", paper ? "text-paper-muted" : "text-fg-subtle")}>{label}</div>}
        </div>
      </div>
    </div>
  );
}
