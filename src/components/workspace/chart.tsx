import { Info } from "lucide-react";
import type { GscRow } from "@/lib/seo/gsc";
export function PerformanceChart({
  rows,
  sample = false,
}: {
  rows: GscRow[];
  sample?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.clicks));
  const points = rows
    .map(
      (r, i) =>
        `${(i / Math.max(1, rows.length - 1)) * 500},${145 - (r.clicks / max) * 128}`,
    )
    .join(" ");
  return (
    <>
      <div className="performance-chart">
        <div className="chart-scale">
          <span>{Math.ceil(max)}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
        <svg
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${sample ? "Illustrative " : "Search Console "}daily clicks. ${rows.reduce((a, r) => a + r.clicks, 0).toLocaleString()} clicks over ${rows.length} days.`}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#94AF69" stopOpacity=".25" />
              <stop offset="100%" stopColor="#94AF69" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[15, 80, 145].map((y) => (
            <line
              key={y}
              x1="0"
              x2="500"
              y1={y}
              y2={y}
              stroke="#E6EADC"
              strokeDasharray="4 5"
            />
          ))}
          <polygon points={`0,150 ${points} 500,150`} fill="url(#chart-fill)" />
          <polyline
            points={points}
            fill="none"
            stroke="#789949"
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="chart-labels">
        <span>{rows[0]?.date}</span>
        <span>{rows.at(-1)?.date}</span>
      </div>
      <div className="chart-footer">
        <Info size={11} />
        {sample
          ? "Illustrative sample data"
          : "Source: Search Console property totals"}{" "}
        · Measured traffic does not establish causation.
      </div>
    </>
  );
}
