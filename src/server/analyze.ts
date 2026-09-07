import { createServerFn } from "@tanstack/react-start";
import type { AnalyzeResult, Market } from "@/lib/seo/types";
import { isMarket } from "@/lib/seo/markets";
import { normalizeUrl } from "@/lib/utils";

export type AnalyzeInput = { url: string; market: Market };

/** Blocks loopback/private targets unless ALLOW_PRIVATE_URLS=true (used for local testing). */
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return h === "::1" || h.startsWith("[");
}

export const analyzeUrl = createServerFn({ method: "POST" })
  .inputValidator((raw: { url: string; market?: string }): AnalyzeInput => {
    const url = normalizeUrl(String(raw?.url ?? ""));
    if (!url) throw new Error("Enter a valid public URL, like https://example.com/page");
    const market: Market = isMarket(raw.market) ? raw.market : "gr";
    return { url, market };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const { fetchSnapshot, FetchError } = await import("@/lib/seo/fetch-page.server");
    const { buildAnalysis } = await import("@/lib/seo/analysis");
    const { env } = await import("@/lib/env.server");
    const { recordEvent } = await import("@/lib/db/server");

    let host = "";
    try {
      host = new URL(data.url).hostname;
    } catch {
      return { ok: false, error: "That URL could not be parsed." };
    }
    if (isPrivateHost(host) && env("ALLOW_PRIVATE_URLS") !== "true") {
      return { ok: false, error: "Private and local addresses can't be analyzed. Use a public URL." };
    }

    try {
      const snapshot = await fetchSnapshot(data.url);
      const analysis = buildAnalysis(snapshot, data.market);
      void recordEvent("analyze", host).catch(() => undefined);
      return { ok: true, analysis };
    } catch (err) {
      if (err instanceof FetchError) return { ok: false, error: err.message };
      return { ok: false, error: "The lab hit an unexpected error while reading the page." };
    }
  });
