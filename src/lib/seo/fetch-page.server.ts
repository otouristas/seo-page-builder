import * as cheerio from "cheerio";
import type { SeoSnapshot } from "./types";

const USER_AGENT = "Mozilla/5.0 (compatible; RankframeBot/0.2; +https://rankframe.app/bot)";
const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 8000;

export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchError";
  }
}

async function readCapped(res: Response): Promise<{ text: string; truncated: boolean }> {
  const reader = res.body?.getReader();
  if (!reader) return { text: await res.text(), truncated: false };
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      if (received >= MAX_BYTES) {
        truncated = true;
        await reader.cancel();
        break;
      }
    }
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(merged), truncated };
}

export async function fetchSnapshot(url: string): Promise<SeoSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "accept-language": "en,el;q=0.8",
      },
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) throw new FetchError(`The page answered with HTTP ${res.status}.`);
    if (type && !/html|xml/i.test(type)) throw new FetchError(`Not an HTML page (${type.split(";")[0]}).`);
    const body = await readCapped(res);
    const xRobots = res.headers.get("x-robots-tag");
    return parseSnapshot(body.text, url, res.url || url, body.truncated ? "partial" : "live", {
      status: res.status,
      xRobots: xRobots ? xRobots.trim() : null,
    });
  } catch (err) {
    if (err instanceof FetchError) throw err;
    const name = (err as { name?: string })?.name;
    if (name === "AbortError") throw new FetchError("The page took longer than 8 seconds to answer.");
    throw new FetchError("Could not reach the page. Check the URL is public.");
  } finally {
    clearTimeout(timer);
  }
}

function collectTypes(node: unknown, out: Set<string>) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, out);
    return;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") out.add(t);
    if (Array.isArray(t)) for (const x of t) if (typeof x === "string") out.add(x);
    if (obj["@graph"]) collectTypes(obj["@graph"], out);
    if (obj["mainEntity"]) collectTypes(obj["mainEntity"], out);
  }
}

export function parseSnapshot(
  html: string,
  url: string,
  finalUrl: string,
  source: SeoSnapshot["source"],
  extras: { status?: number; xRobots?: string | null } = {},
): SeoSnapshot {
  const $ = cheerio.load(html);
  const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
  const headings = (sel: string) =>
    $(sel)
      .map((_, el) => clean($(el).text()))
      .get()
      .filter(Boolean)
      .slice(0, 40);

  const title = clean($("head > title").first().text() || $("title").first().text());
  const metaDescription = clean($('meta[name="description"]').attr("content"));
  const canonicalRaw = clean($('link[rel="canonical"]').attr("href"));
  let canonical: string | null = null;
  if (canonicalRaw) {
    try {
      canonical = new URL(canonicalRaw, finalUrl).toString();
    } catch {
      canonical = canonicalRaw;
    }
  }
  const robots = clean($('meta[name="robots"]').attr("content")) || null;
  const lang = clean($("html").attr("lang")) || null;
  const hreflang: string[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const v = clean($(el).attr("hreflang")).toLowerCase();
    if (v && !hreflang.includes(v)) hreflang.push(v);
  });

  const schemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      collectTypes(JSON.parse($(el).text()), schemaTypes);
    } catch {
      /* ignore malformed JSON-LD */
    }
  });

  const $main = cheerio.load($.html());
  $main("script, style, noscript, template, svg, header, nav, footer, aside, [role=navigation], [role=banner], [role=contentinfo]").remove();
  const mainText = clean($main("body").text());
  const wordCountMain = mainText ? mainText.split(" ").length : 0;
  const excerpt = mainText.slice(0, 400);

  $("script, style, noscript, template, svg").remove();
  const bodyText = clean($("body").text());
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  let imagesTotal = 0;
  let imagesWithAlt = 0;
  $("img").each((_, el) => {
    imagesTotal++;
    if (clean($(el).attr("alt"))) imagesWithAlt++;
  });

  let host = "";
  try {
    host = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    /* keep empty */
  }
  let linksInternal = 0;
  let linksExternal = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
    try {
      const target = new URL(href, finalUrl);
      const targetHost = target.hostname.replace(/^www\./, "");
      if (targetHost === host) linksInternal++;
      else linksExternal++;
    } catch {
      /* ignore */
    }
  });

  return {
    url,
    finalUrl,
    title,
    metaDescription,
    canonical,
    robots,
    lang,
    h1: headings("h1"),
    h2: headings("h2"),
    h3: headings("h3"),
    ogTitle: clean($('meta[property="og:title"]').attr("content")) || null,
    ogDescription: clean($('meta[property="og:description"]').attr("content")) || null,
    ogImage: clean($('meta[property="og:image"]').attr("content")) || null,
    twitterCard: clean($('meta[name="twitter:card"]').attr("content")) || null,
    schemaTypes: [...schemaTypes].slice(0, 12),
    wordCount,
    wordCountMain,
    excerpt,
    hreflang,
    xRobots: extras.xRobots ?? null,
    status: extras.status ?? 200,
    redirected: Boolean(finalUrl && url && finalUrl !== url),
    imagesTotal,
    imagesWithAlt,
    linksInternal,
    linksExternal,
    hasViewport: $('meta[name="viewport"]').length > 0,
    titleChars: title.length,
    descriptionChars: metaDescription.length,
    fetchedAt: new Date().toISOString(),
    source,
  };
}
