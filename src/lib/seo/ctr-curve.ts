/**
 * Industry-average organic click-through rate by position (desktop, non-branded).
 * Values are a blend of public CTR studies; they are an estimate, labeled as such in the UI.
 */
export const CTR_BY_POSITION: Record<number, number> = {
  1: 0.276,
  2: 0.158,
  3: 0.11,
  4: 0.084,
  5: 0.063,
  6: 0.049,
  7: 0.039,
  8: 0.033,
  9: 0.027,
  10: 0.024,
};

export function ctrAt(position: number | null): number {
  if (position === null) return 0.008;
  const p = Math.max(1, Math.round(position));
  return CTR_BY_POSITION[p] ?? (p <= 20 ? 0.012 : 0.004);
}

export function clicksAt(impressions: number, position: number | null): number {
  return Math.round(impressions * ctrAt(position));
}

/** Multiplier vs. the current position (e.g. moving 7 → 2 is ~4×). */
export function liftFactor(from: number | null, to: number | null): number {
  const a = ctrAt(from);
  const b = ctrAt(to);
  return a > 0 ? b / a : 1;
}
