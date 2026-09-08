import "server-only";
import { z } from "zod";
import { required, AppError } from "../server/errors";
import { providerJson } from "./http";
import {
  RESEARCH_LOCATIONS,
  ordinaryQuery,
  type ResearchMode,
  type ResearchResult,
} from "../research";
const envelope = z.object({
  status_code: z.number(),
  cost: z.number().nullable().optional(),
  tasks: z
    .array(
      z.object({
        id: z.string().optional(),
        status_code: z.number(),
        cost: z.number().nullable().optional(),
        result: z
          .array(z.record(z.string(), z.unknown()))
          .nullable()
          .optional(),
      }),
    )
    .nullable()
    .optional(),
});
const item = z.object({
  type: z.string().optional(),
  url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  rank_absolute: z.number().nullable().optional(),
  rank_group: z.number().nullable().optional(),
  items: z.array(z.unknown()).nullable().optional(),
});
const number = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const string = (v: unknown) => (typeof v === "string" ? v : null);
const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
export function normalizeResearch(
  raw: unknown,
  mode: ResearchMode,
  keyword: string,
  country: string,
  language: string,
): ResearchResult {
  const parsed = envelope.safeParse(raw);
  if (!parsed.success)
    throw new AppError(
      "The research provider returned an unreadable result.",
      502,
      "provider_error",
    );
  const data = parsed.data,
    task = data.tasks?.[0];
  if (data.status_code !== 20000 || task?.status_code !== 20000) {
    const code = task?.status_code ?? data.status_code;
    if ([40100, 40101, 40102, 40200, 40201, 40202, 40203].includes(code))
      throw new AppError(
        "DataForSEO account access or allowance needs the operator’s attention. No research results were returned.",
        503,
        "provider_auth",
      );
    throw new AppError(
      "DataForSEO could not complete this research request. Review the job before retrying.",
      502,
      "provider_error",
    );
  }
  const result = task.result?.[0];
  if (!result || (!Array.isArray(result.items) && result.items !== null))
    throw new AppError(
      "DataForSEO returned incomplete research evidence.",
      502,
      "provider_error",
    );
  const base = {
    mode,
    keyword,
    country,
    language,
    observedAt: new Date().toISOString(),
    providerTaskId: task.id ?? null,
    providerCostUsd: number(task.cost ?? data.cost),
  };
  if (mode === "serp") {
    const items = (result.items ?? [])
      .map((x) => item.safeParse(x))
      .filter((x) => x.success)
      .map((x) => x.data!);
    const questions = items
      .filter((x) => x.type === "people_also_ask")
      .flatMap((x) => x.items ?? [])
      .map((x) => string(record(x).title))
      .filter((x): x is string => !!x);
    const results = items
      .filter(
        (x) => x.type === "organic" && x.url && /^https?:\/\//.test(x.url),
      )
      .slice(0, 10)
      .map((x) => ({
        url: x.url!,
        title: x.title ?? x.url!,
        description: x.description ?? "",
        rank_absolute: x.rank_absolute ?? null,
        rank_group: x.rank_group ?? null,
      }));
    return {
      ...base,
      device: "desktop",
      source: "DataForSEO Google organic live",
      status: "measured",
      coverage:
        "One desktop Google results snapshot, up to 10 organic listings. Features and questions are included only when returned. No extra question-expansion clicks.",
      results,
      questions: [...new Set(questions)].slice(0, 10),
      features: [
        ...new Set(
          items
            .map((x) => x.type)
            .filter((x): x is string => !!x && x !== "organic"),
        ),
      ],
      available: results.length > 0,
    };
  }
  const returned = (result.items ?? [])
    .map(record)
    .find(
      (x) =>
        string(x.keyword)?.trim().toLowerCase() ===
        keyword.trim().toLowerCase(),
    );
  const info = record(returned?.keyword_info),
    properties = record(returned?.keyword_properties),
    intent = record(returned?.search_intent_info);
  const monthly = Array.isArray(info.monthly_searches)
    ? info.monthly_searches
        .map(record)
        .filter(
          (x) =>
            number(x.year) !== null &&
            number(x.month) !== null &&
            Number(x.month) >= 1 &&
            Number(x.month) <= 12,
        )
        .map((x) => ({
          year: Number(x.year),
          month: Number(x.month),
          searchVolume: number(x.search_volume),
        }))
        .slice(0, 24)
    : [];
  return {
    ...base,
    device: "database",
    source: "DataForSEO Labs Google keyword database",
    status: "inferred",
    coverage:
      "Provider database estimates, not your website analytics. Missing values mean unavailable. CPC and competition describe paid search; difficulty is a provider estimate. Clickstream add-ons are disabled.",
    available: !!returned,
    metrics: {
      searchVolume: number(info.search_volume),
      cpc: number(info.cpc),
      paidCompetition: number(info.competition),
      paidCompetitionLevel: string(info.competition_level),
      keywordDifficulty: number(properties.keyword_difficulty),
      intent: string(intent.main_intent),
      updatedAt: string(info.last_updated_time),
      monthlySearches: monthly,
    },
  };
}
export async function fetchResearch(
  keyword: string,
  country: string,
  language: string,
  mode: ResearchMode = "serp",
) {
  if (!RESEARCH_LOCATIONS[country])
    throw new AppError(
      "Research is not available for this project country yet. Supported markets: US, GB, GR, CA, AU, DE, FR, ES, IT, NL, IN, BR.",
      400,
    );
  if (!ordinaryQuery(keyword))
    throw new AppError(
      "Use a plain search phrase. Advanced operators have different provider pricing and are not enabled.",
      400,
    );
  if (
    mode === "keywords" &&
    (keyword.length > 80 || keyword.trim().split(/\s+/).length > 10)
  )
    throw new AppError(
      "Keyword demand accepts one phrase of up to 80 characters and 10 words.",
      400,
    );
  const path =
    mode === "serp"
      ? "serp/google/organic/live/advanced"
      : "dataforseo_labs/google/keyword_overview/live";
  const market = {
    location_code: RESEARCH_LOCATIONS[country],
    language_code: language.split("-")[0].toLowerCase(),
  };
  const body =
    mode === "serp"
      ? { ...market, keyword, depth: 10, device: "desktop", os: "windows" }
      : {
          ...market,
          keywords: [keyword],
          include_serp_info: false,
          include_clickstream_data: false,
        };
  const data = await providerJson<unknown>(
    `https://api.dataforseo.com/v3/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${required("DATAFORSEO_LOGIN")}:${required("DATAFORSEO_PASSWORD")}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([body]),
    },
    60_000,
  );
  return normalizeResearch(data, mode, keyword, country, market.language_code);
}
export const fetchSerp = (keyword: string, country: string, language: string) =>
  fetchResearch(keyword, country, language, "serp");
