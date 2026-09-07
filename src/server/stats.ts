import { createServerFn } from "@tanstack/react-start";

export type LiveStats = { analyses: number; keywords: number; plays: number; available: boolean };

/** Live counters for the landing page. Fails soft: returns available:false when the DB is unreachable. */
export const getLiveStats = createServerFn({ method: "GET" }).handler(async (): Promise<LiveStats> => {
  try {
    const { countEvents } = await import("@/lib/db/server");
    const counts = await countEvents();
    return { ...counts, available: true };
  } catch {
    return { analyses: 0, keywords: 0, plays: 0, available: false };
  }
});

export const recordLabEvent = createServerFn({ method: "POST" })
  .inputValidator((raw: { kind: string; host?: string }) => {
    const kind = String(raw?.kind ?? "");
    if (!["stage", "play", "live"].includes(kind)) throw new Error("Unknown event");
    return { kind, host: raw.host ? String(raw.host).slice(0, 200) : undefined };
  })
  .handler(async ({ data }) => {
    try {
      const { recordEvent } = await import("@/lib/db/server");
      await recordEvent(data.kind, data.host);
    } catch {
      /* counters are best-effort */
    }
    return { ok: true };
  });
