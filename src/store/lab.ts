import { create } from "zustand";
import type { Analysis, AppTab, CoachMessage, GscRow, Market, Niche, SerpResult } from "@/lib/seo/types";
import { buildAudit, auditScore } from "@/lib/seo/audit";
import { buildNiche } from "@/lib/seo/niches";
import { composeScene, type Scene } from "@/lib/seo/scene";
import { coachReply } from "@/lib/seo/coach";
import { demoSnapshot } from "@/lib/seo/demo";
import { buildAnalysis } from "@/lib/seo/analysis";
import { analyzeUrl } from "@/server/analyze";
import type { SessionInfo } from "@/server/session";
import type { SeoSnapshot } from "@/lib/seo/types";

export type Device = "desktop" | "mobile";
export type Status = "idle" | "loading" | "ready" | "error";

export type LiveScene = { results: SerpResult[]; fetchedAt: string };

export const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Scores, snapshot and quick wins" },
  { id: "serp", label: "SERP Lab", hint: "The stage: plays move your result" },
  { id: "audit", label: "Audit", hint: "12 checks and a snippet editor" },
  { id: "keywords", label: "Keywords", hint: "Stage any query as a scene" },
  { id: "gsc", label: "Search Console", hint: "Import queries, spot striking distance" },
  { id: "coach", label: "Coach", hint: "Ask about the active scene" },
];

export const STEP_LOG = [
  "Resolving the URL…",
  "Fetching HTML…",
  "Parsing headings and metadata…",
  "Running 12 on-page checks…",
  "Extracting keyphrases…",
  "Staging SERP scenes…",
  "Modeling positions and plays…",
];

type LabState = {
  url: string;
  status: Status;
  error: string | null;
  step: number;
  analysis: Analysis | null;
  activeNicheId: string | null;
  applied: Record<string, string[]>;
  tab: AppTab;
  device: Device;
  market: Market;
  compare: boolean;
  gscRows: GscRow[];
  gscSource: "none" | "sample" | "file" | "saved";
  coach: CoachMessage[];
  coachOpen: boolean;
  live: Record<string, LiveScene>;
  quota: { used: number; limit: number } | null;
  liveStatus: "idle" | "loading" | "error";
  liveError: string | null;
  session: SessionInfo | null;

  setSession: (s: SessionInfo | null) => void;
  /** Edit snapshot fields (title, meta) and rebuild scores, niches and plays. Applied plays are kept by id. */
  updateSnapshot: (patch: Partial<Pick<SeoSnapshot, "title" | "metaDescription">>) => void;
  setUrl: (url: string) => void;
  setTab: (tab: AppTab) => void;
  setDevice: (d: Device) => void;
  setMarket: (m: Market) => void;
  setCompare: (v: boolean) => void;
  setCoachOpen: (v: boolean) => void;
  run: (url: string, opts?: { market?: Market }) => Promise<void>;
  loadDemo: () => void;
  loadAnalysis: (analysis: Analysis, opts?: { applied?: Record<string, string[]>; nicheId?: string }) => void;
  setActiveNiche: (id: string) => void;
  togglePlay: (nicheId: string, playId: string) => void;
  applyQuickWins: (nicheId: string) => void;
  resetPlays: (nicheId: string) => void;
  stageKeyword: (keyword: string, source?: Niche["source"]) => Niche | null;
  removeNiche: (id: string) => void;
  setGscRows: (rows: GscRow[], source: LabState["gscSource"]) => void;
  ask: (text: string) => void;
  clearCoach: () => void;
  setLive: (nicheId: string, results: SerpResult[], quota: LabState["quota"]) => void;
  setLiveStatus: (s: LabState["liveStatus"], error?: string | null) => void;
  setQuota: (q: LabState["quota"]) => void;
};

let stepTimer: ReturnType<typeof setInterval> | null = null;
let msgSeq = 0;
const nextId = () => `m-${Date.now().toString(36)}-${msgSeq++}`;

export const useLab = create<LabState>((set, get) => ({
  url: "",
  status: "idle",
  error: null,
  step: 0,
  analysis: null,
  activeNicheId: null,
  applied: {},
  tab: "overview",
  device: "desktop",
  market: "gr",
  compare: false,
  gscRows: [],
  gscSource: "none",
  coach: [],
  coachOpen: false,
  live: {},
  quota: null,
  liveStatus: "idle",
  liveError: null,
  session: null,

  setSession: (session) => set({ session }),
  updateSnapshot: (patch) =>
    set((s) => {
      if (!s.analysis) return {};
      const snapshot: SeoSnapshot = { ...s.analysis.snapshot, ...patch };
      snapshot.titleChars = snapshot.title.length;
      snapshot.descriptionChars = snapshot.metaDescription.length;
      const rebuilt = buildAnalysis(snapshot, s.analysis.market);
      // Keep staged niches that the automatic extraction wouldn't recreate.
      const audit = buildAudit(snapshot);
      const score = auditScore(audit);
      const extra = s.analysis.niches
        .filter((n) => n.source && n.source !== "headings" && !rebuilt.niches.some((r) => r.keyword === n.keyword))
        .map((n) => buildNiche(n.keyword, { snapshot, audit, score, market: s.analysis!.market }, n.source));
      const niches = [...rebuilt.niches, ...extra];
      const applied: Record<string, string[]> = {};
      for (const n of niches) {
        const prev = s.applied[n.id] ?? [];
        applied[n.id] = prev.filter((id) => n.plays.some((p) => p.id === id));
      }
      const activeNicheId = niches.some((n) => n.id === s.activeNicheId) ? s.activeNicheId : (niches[0]?.id ?? null);
      return { analysis: { ...rebuilt, niches }, applied, activeNicheId, live: {} };
    }),
  setUrl: (url) => set({ url }),
  setTab: (tab) => set({ tab }),
  setDevice: (device) => set({ device }),
  setMarket: (market) => set({ market }),
  setCompare: (compare) => set({ compare }),
  setCoachOpen: (coachOpen) => set({ coachOpen }),

  loadAnalysis: (analysis, opts) => {
    const first = opts?.nicheId ?? analysis.niches[0]?.id ?? null;
    set({
      analysis,
      status: "ready",
      error: null,
      url: analysis.snapshot.url,
      market: analysis.market,
      activeNicheId: first,
      applied: opts?.applied ?? {},
      live: {},
      coach: [],
      compare: false,
    });
  },

  run: async (rawUrl, opts) => {
    const market = opts?.market ?? get().market;
    if (stepTimer) clearInterval(stepTimer);
    set({ status: "loading", error: null, step: 0, url: rawUrl, market });
    stepTimer = setInterval(() => {
      set((s) => ({ step: Math.min(STEP_LOG.length - 1, s.step + 1) }));
    }, 650);
    try {
      const result = await analyzeUrl({ data: { url: rawUrl, market } });
      if (stepTimer) clearInterval(stepTimer);
      stepTimer = null;
      if (result.ok) {
        get().loadAnalysis(result.analysis);
      } else {
        set({ status: "error", error: result.error });
      }
    } catch (err) {
      if (stepTimer) clearInterval(stepTimer);
      stepTimer = null;
      set({ status: "error", error: err instanceof Error ? err.message : "The lab could not reach the server." });
    }
  },

  loadDemo: () => {
    const snapshot = demoSnapshot();
    get().loadAnalysis(buildAnalysis(snapshot, get().market));
  },

  setActiveNiche: (activeNicheId) => set({ activeNicheId }),

  togglePlay: (nicheId, playId) =>
    set((s) => {
      const current = s.applied[nicheId] ?? [];
      const next = current.includes(playId) ? current.filter((id) => id !== playId) : [...current, playId];
      return { applied: { ...s.applied, [nicheId]: next } };
    }),

  applyQuickWins: (nicheId) =>
    set((s) => {
      const niche = s.analysis?.niches.find((n) => n.id === nicheId);
      if (!niche) return {};
      const current = s.applied[nicheId] ?? [];
      const quick = niche.plays.filter((p) => p.quickWin && !current.includes(p.id)).map((p) => p.id);
      return { applied: { ...s.applied, [nicheId]: [...current, ...quick] } };
    }),

  resetPlays: (nicheId) => set((s) => ({ applied: { ...s.applied, [nicheId]: [] } })),

  stageKeyword: (keyword, source = "staged") => {
    const s = get();
    if (!s.analysis) return null;
    const kw = keyword.trim().toLowerCase().replace(/\s+/g, " ");
    if (!kw) return null;
    const existing = s.analysis.niches.find((n) => n.keyword === kw);
    if (existing) {
      set({ activeNicheId: existing.id });
      return existing;
    }
    const audit = buildAudit(s.analysis.snapshot);
    const niche = buildNiche(kw, { snapshot: s.analysis.snapshot, audit, score: auditScore(audit), market: s.analysis.market }, source);
    set({
      analysis: { ...s.analysis, niches: [...s.analysis.niches, niche] },
      activeNicheId: niche.id,
    });
    return niche;
  },

  removeNiche: (id) =>
    set((s) => {
      if (!s.analysis) return {};
      const niches = s.analysis.niches.filter((n) => n.id !== id);
      return {
        analysis: { ...s.analysis, niches },
        activeNicheId: s.activeNicheId === id ? (niches[0]?.id ?? null) : s.activeNicheId,
      };
    }),

  setGscRows: (gscRows, gscSource) => set({ gscRows, gscSource }),

  ask: (text) => {
    const s = get();
    const trimmed = text.trim();
    if (!trimmed || !s.analysis) return;
    const niche = s.analysis.niches.find((n) => n.id === s.activeNicheId) ?? null;
    const scene = niche ? composeScene(niche, s.analysis.score, s.applied[niche.id] ?? [], s.live[niche.id]?.results) : null;
    const reply = coachReply(trimmed, { analysis: s.analysis, niche, scene, gscRows: s.gscRows });
    set({
      coach: [
        ...s.coach,
        { id: nextId(), role: "user", text: trimmed },
        { id: nextId(), role: "assistant", text: reply },
      ],
    });
  },

  clearCoach: () => set({ coach: [] }),

  setLive: (nicheId, results, quota) =>
    set((s) => ({
      live: { ...s.live, [nicheId]: { results, fetchedAt: new Date().toISOString() } },
      quota,
      liveStatus: "idle",
      liveError: null,
    })),
  setLiveStatus: (liveStatus, error = null) => set({ liveStatus, liveError: error }),
  setQuota: (quota) => set({ quota }),
}));

/** Derived view of the active niche: scene, applied plays, live data. */
export function selectActive(s: LabState): { niche: Niche | null; scene: Scene | null; appliedIds: string[]; live: LiveScene | null } {
  const niche = s.analysis?.niches.find((n) => n.id === s.activeNicheId) ?? null;
  if (!niche || !s.analysis) return { niche: null, scene: null, appliedIds: [], live: null };
  const appliedIds = s.applied[niche.id] ?? [];
  const live = s.live[niche.id] ?? null;
  return { niche, scene: composeScene(niche, s.analysis.score, appliedIds, live?.results), appliedIds, live };
}
