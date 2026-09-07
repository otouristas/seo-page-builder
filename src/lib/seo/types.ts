export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type PlayPillar =
  | "on-page"
  | "content"
  | "technical"
  | "authority"
  | "intent";

export type Effort = "low" | "mid" | "high";

export type SeoSnapshot = {
  url: string;
  finalUrl: string;
  title: string;
  metaDescription: string;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  h1: string[];
  h2: string[];
  h3: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  schemaTypes: string[];
  wordCount: number;
  imagesTotal: number;
  imagesWithAlt: number;
  linksInternal: number;
  linksExternal: number;
  hasViewport: boolean;
  titleChars: number;
  descriptionChars: number;
  fetchedAt: string;
  source: "live" | "partial" | "demo";
};

export type Play = {
  id: string;
  title: string;
  detail: string;
  impact: number;
  pillar: PlayPillar;
  effort: Effort;
};

export type SerpKind =
  | "ai-overview"
  | "featured"
  | "organic"
  | "paa"
  | "you";

export type SerpResult = {
  id: string;
  kind: SerpKind;
  domain: string;
  url: string;
  title: string;
  snippet: string;
  sitelinks?: string[];
  questions?: string[];
  isYou?: boolean;
};

export type Niche = {
  id: string;
  keyword: string;
  intent: SearchIntent;
  volumeHint: "low" | "mid" | "high";
  difficulty: number;
  currentRank: number | null;
  why: string;
  results: SerpResult[];
  plays: Play[];
};

export type CoachMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type Analysis = {
  snapshot: SeoSnapshot;
  score: number;
  summary: string;
  niches: Niche[];
  briefing: string;
  usedAi: boolean;
};

export type AppTab = "overview" | "serp" | "audit" | "keywords" | "gsc" | "coach";

export type GscRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type AnalyzeOk = { ok: true; analysis: Analysis };
export type AnalyzeErr = { ok: false; error: string };
export type AnalyzeResult = AnalyzeOk | AnalyzeErr;

export type CoachOk = { ok: true; text: string };
export type CoachErr = { ok: false; error: string };
export type CoachResult = CoachOk | CoachErr;
