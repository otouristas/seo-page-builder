export const RESEARCH_MODES = [
  {
    id: "serp",
    label: "Live Google results",
    description:
      "Up to 10 organic listings, available questions, and result features.",
  },
  {
    id: "keywords",
    label: "Keyword demand",
    description:
      "One keyword’s demand estimates, intent, advertiser competition, and monthly history.",
  },
] as const;
export type ResearchMode = (typeof RESEARCH_MODES)[number]["id"];
export const RESEARCH_LOCATIONS: Record<string, number> = {
  US: 2840,
  GB: 2826,
  GR: 2300,
  CA: 2124,
  AU: 2036,
  DE: 2276,
  FR: 2250,
  ES: 2724,
  IT: 2380,
  NL: 2528,
  IN: 2356,
  BR: 2076,
};
export type ResearchResult = {
  mode: ResearchMode;
  keyword: string;
  country: string;
  language: string;
  device: "desktop" | "database";
  source: string;
  observedAt: string;
  providerTaskId: string | null;
  providerCostUsd: number | null;
  status: "measured" | "inferred";
  coverage: string;
  results?: {
    url: string;
    title: string;
    description: string;
    rank_absolute: number | null;
    rank_group: number | null;
    breadcrumb?: string | null;
    resultType?: string;
    favicon?: string | null;
  }[];
  questions?: string[];
  features?: string[];
  metrics?: {
    searchVolume: number | null;
    cpc: number | null;
    paidCompetition: number | null;
    paidCompetitionLevel: string | null;
    keywordDifficulty: number | null;
    intent: string | null;
    updatedAt: string | null;
    monthlySearches: {
      year: number;
      month: number;
      searchVolume: number | null;
    }[];
  };
  available?: boolean;
};
export function ordinaryQuery(query: string) {
  let decoded = query;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded.replaceAll("+", " "));
      if (next === decoded) break;
      decoded = next;
    } catch {
      return false;
    }
  }
  return !/(?:allinanchor|allintext|allintitle|allinurl|cache|define|definition|filetype|id|inanchor|info|intext|intitle|inurl|link|site):/i.test(
    decoded,
  );
}
