import { env } from "@/lib/env.server";
import type { SerpResult } from "./types";

export const DATAFORSEO_DAILY_LIMIT = 8;

export function dataforseoConfigured(): boolean {
  return Boolean(env("DATAFORSEO_LOGIN") && env("DATAFORSEO_PASSWORD"));
}

type DfsItem = {
  type?: string;
  url?: string;
  domain?: string;
  title?: string;
  description?: string;
};

export async function fetchDataForSeoOrganic(keyword: string): Promise<SerpResult[]> {
  const login = env("DATAFORSEO_LOGIN");
  const password = env("DATAFORSEO_PASSWORD");
  if (!login || !password) return [];

  const token = Buffer.from(`${login}:${password}`).toString("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/regular", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keyword,
          location_code: 2356,
          language_code: "el",
          depth: 10,
        },
      ]),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      tasks?: { result?: { items?: DfsItem[] }[] }[];
    };
    const items = body.tasks?.[0]?.result?.[0]?.items ?? [];
    const out: SerpResult[] = [];
    for (const item of items) {
      if (item.type !== "organic" || !item.url || !item.title) continue;
      let domain = item.domain ?? "";
      try {
        domain = domain || new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        domain = item.url.slice(0, 40);
      }
      out.push({
        id: `dfs-${out.length}-${domain}`,
        kind: "organic",
        domain,
        url: item.url,
        title: item.title.slice(0, 72),
        snippet: (item.description ?? "").slice(0, 170),
      });
      if (out.length >= 8) break;
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
