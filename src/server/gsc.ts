import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { GscRow } from "@/lib/seo/types";

type SaveInput = { rows: GscRow[] };

function cleanRows(raw: unknown): GscRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({
      query: String((r as GscRow)?.query ?? "").slice(0, 200),
      clicks: Number((r as GscRow)?.clicks) || 0,
      impressions: Number((r as GscRow)?.impressions) || 0,
      ctr: Number((r as GscRow)?.ctr) || 0,
      position: Number((r as GscRow)?.position) || 0,
    }))
    .filter((r) => r.query)
    .slice(0, 500);
}

/** Persist a GSC export for the signed-in user (replaces the previous import). */
export const saveGscRows = createServerFn({ method: "POST" })
  .inputValidator((raw: SaveInput) => ({ rows: cleanRows(raw?.rows) }))
  .handler(async ({ data }): Promise<{ ok: boolean; saved: number; error?: string }> => {
    const { currentUser } = await import("@/lib/auth/server");
    const user = await currentUser(new Headers(getRequestHeaders()));
    if (!user) return { ok: false, saved: 0, error: "Sign in to keep your Search Console data." };
    const { getDb } = await import("@/lib/db/server");
    const db = await getDb();
    await db.deleteFrom("gsc_rows").where("user_id", "=", user.id).execute();
    if (data.rows.length) {
      await db
        .insertInto("gsc_rows")
        .values(data.rows.map((r) => ({ ...r, user_id: user.id })))
        .execute();
    }
    return { ok: true, saved: data.rows.length };
  });

export const loadGscRows = createServerFn({ method: "GET" }).handler(async (): Promise<GscRow[]> => {
  const { currentUser } = await import("@/lib/auth/server");
  const user = await currentUser(new Headers(getRequestHeaders()));
  if (!user) return [];
  const { getDb } = await import("@/lib/db/server");
  const db = await getDb();
  const rows = await db
    .selectFrom("gsc_rows")
    .select(["query", "clicks", "impressions", "ctr", "position"])
    .where("user_id", "=", user.id)
    .orderBy("clicks", "desc")
    .limit(500)
    .execute();
  return rows.map((r) => ({
    query: r.query,
    clicks: Number(r.clicks),
    impressions: Number(r.impressions),
    ctr: Number(r.ctr),
    position: Number(r.position),
  }));
});
