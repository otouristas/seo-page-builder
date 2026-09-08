import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Market, SerpResult } from "@/lib/seo/types";
import { isMarket } from "@/lib/seo/markets";

export type LiveSerpResult =
  | { ok: true; results: SerpResult[]; quota: { used: number; limit: number } }
  | { ok: false; error: string; reason: "auth" | "quota" | "config" | "upstream"; quota?: { used: number; limit: number } };

/** Pull the real page one for a keyword through DataForSEO. Signed-in users only, 8 per day. */
export const fetchLiveSerp = createServerFn({ method: "POST" })
  .inputValidator((raw: { keyword: string; market?: string }) => {
    const keyword = String(raw?.keyword ?? "").trim().slice(0, 120);
    if (!keyword) throw new Error("Keyword is required");
    const market: Market = isMarket(raw.market) ? raw.market : "us";
    return { keyword, market };
  })
  .handler(async ({ data }): Promise<LiveSerpResult> => {
    const { currentUser } = await import("@/lib/auth/server");
    const { dataforseoConfigured, fetchDataForSeoOrganic, DATAFORSEO_DAILY_LIMIT } = await import("@/lib/seo/dataforseo");
    const { getDb, todayKey, recordEvent } = await import("@/lib/db/server");

    if (!dataforseoConfigured()) {
      return { ok: false, reason: "config", error: "Live SERP isn't configured on this deployment. The scene stays modeled." };
    }
    const user = await currentUser(new Headers(getRequestHeaders()));
    if (!user) return { ok: false, reason: "auth", error: "Sign in to pull live results (8 a day)." };

    const db = await getDb();
    const day = todayKey();
    const usage = await db
      .selectFrom("dataforseo_usage")
      .select("used")
      .where("user_id", "=", user.id)
      .where("day", "=", day)
      .executeTakeFirst();
    const used = Number(usage?.used ?? 0);
    if (used >= DATAFORSEO_DAILY_LIMIT) {
      return { ok: false, reason: "quota", error: "You've used today's 8 live lookups. Resets at midnight UTC.", quota: { used, limit: DATAFORSEO_DAILY_LIMIT } };
    }

    const results = await fetchDataForSeoOrganic(data.keyword, data.market);
    if (!results.length) {
      return { ok: false, reason: "upstream", error: "DataForSEO returned no organic results. Try again in a minute.", quota: { used, limit: DATAFORSEO_DAILY_LIMIT } };
    }

    if (usage) {
      await db.updateTable("dataforseo_usage").set({ used: used + 1 }).where("user_id", "=", user.id).where("day", "=", day).execute();
    } else {
      await db.insertInto("dataforseo_usage").values({ user_id: user.id, day, used: 1 }).execute();
    }
    void recordEvent("live").catch(() => undefined);
    return { ok: true, results, quota: { used: used + 1, limit: DATAFORSEO_DAILY_LIMIT } };
  });

export const getLiveQuota = createServerFn({ method: "GET" }).handler(async (): Promise<{ used: number; limit: number } | null> => {
  const { currentUser } = await import("@/lib/auth/server");
  const { DATAFORSEO_DAILY_LIMIT, dataforseoConfigured } = await import("@/lib/seo/dataforseo");
  if (!dataforseoConfigured()) return null;
  const user = await currentUser(new Headers(getRequestHeaders()));
  if (!user) return { used: 0, limit: DATAFORSEO_DAILY_LIMIT };
  const { getDb, todayKey } = await import("@/lib/db/server");
  const db = await getDb();
  const usage = await db
    .selectFrom("dataforseo_usage")
    .select("used")
    .where("user_id", "=", user.id)
    .where("day", "=", todayKey())
    .executeTakeFirst();
  return { used: Number(usage?.used ?? 0), limit: DATAFORSEO_DAILY_LIMIT };
});
