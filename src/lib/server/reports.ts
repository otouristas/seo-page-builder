import "server-only";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminClient } from "../supabase/server";
import { checked } from "./http";
import { summarizeGsc, type GscRow } from "../seo/gsc";
import { toCsv } from "../utils";
import type { Project } from "../types";
export async function buildReport(project: Project) {
  const db = adminClient();
  const results = await Promise.all([
    db
      .from("opportunities")
      .select("title,detail,page_url,status,evidence,verified_at")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .order("created_at"),
    db
      .from("gsc_daily")
      .select("*")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .eq("property", project.gsc_property || "")
      .eq("dataset", "totals")
      .order("date", { ascending: false })
      .limit(90),
    db
      .from("ai_checks")
      .select("provider,model,prompt,citations,mentions,created_at")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const [opportunities, performance, answers] = results.map(
    (r) => checked(r) || [],
  );
  return {
    project: { name: project.name, url: project.url, country: project.country },
    createdAt: new Date().toISOString(),
    opportunities,
    performance: summarizeGsc(performance as GscRow[]),
    answers,
    methodology:
      "HTML observations and Search Console measurements are evidence. AI answers are sampled API responses. Changes in traffic show association, not proof of causation. Detailed Search Console rows are not exhaustive.",
  };
}
export type ReportPayload = Awaited<ReturnType<typeof buildReport>>;
export function reportCsv(payload: ReportPayload) {
  return toCsv(
    payload.opportunities.map((o) => ({
      Finding: o.title,
      Status: o.status,
      Page: o.page_url,
      Evidence: o.detail,
      Observed: o.evidence?.observedAt || "",
    })),
  );
}
export async function reportPdf(payload: ReportPayload, title: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setAuthor("RankSushi");
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    await readFile(path.join(process.cwd(), "src/assets/fonts/NotoSans.ttf")),
    { subset: false },
  );
  const bold = font;
  let page = pdf.addPage([595, 842]),
    y = 790;
  const supported = new Set(font.getCharacterSet());
  let escapedCharacters = false;
  const safe = (s: string) =>
    [...s]
      .map((c) => {
        if (/\s/.test(c) || supported.has(c.codePointAt(0)!)) return c;
        escapedCharacters = true;
        return `[U+${c.codePointAt(0)!.toString(16).toUpperCase()}]`;
      })
      .join("");
  const line = (s: string, size = 11, isBold = false) => {
    const words = safe(s).split(/\s+/);
    let current = "";
    const draw = () => {
      if (y < 65) {
        page = pdf.addPage([595, 842]);
        y = 790;
      }
      page.drawText(current, {
        x: 48,
        y,
        size,
        font: isBold ? bold : font,
        color: rgb(0.13, 0.19, 0.15),
      });
      y -= size * 1.65;
    };
    const wrappedWords = words.flatMap((word) => {
      const chunks: string[] = [];
      let chunk = "";
      for (const c of word) {
        if (font.widthOfTextAtSize(chunk + c, size) > 499) {
          chunks.push(chunk);
          chunk = "";
        }
        chunk += c;
      }
      if (chunk) chunks.push(chunk);
      return chunks;
    });
    for (const word of wrappedWords) {
      const next = `${current} ${word}`.trim();
      if (font.widthOfTextAtSize(next, size) > 499 && current) {
        draw();
        current = word;
      } else current = next;
    }
    if (current) draw();
  };
  page.drawRectangle({
    x: 0,
    y: 820,
    width: 595,
    height: 22,
    color: rgb(0.94, 0.57, 0.46),
  });
  line("RankSushi / Useful insights, served fresh", 12, true);
  y -= 18;
  line(title, 25, true);
  line(`${payload.project.name} - ${payload.project.url}`);
  line(
    `Prepared ${payload.createdAt.slice(0, 10)} | Market: ${payload.project.country}`,
  );
  y -= 18;
  if (payload.performance) {
    const p = payload.performance;
    line("Observed Search Console performance", 15, true);
    line(
      `${p.currentStart} to ${p.end}: ${p.current.clicks} clicks, ${p.current.impressions} impressions. ${p.current.days}/28 reporting days.`,
    );
    line(
      `Previous period: ${p.previous.clicks} clicks across ${p.previous.days}/28 days.`,
    );
  } else line("Search Console performance has not been imported.");
  y -= 15;
  line("Findings and completed work", 15, true);
  if (!payload.opportunities.length)
    line("No saved opportunities in this report.");
  for (const o of payload.opportunities) {
    y -= 8;
    line(`[${o.status}] ${o.title}`, 12, true);
    line(o.page_url, 9);
    line(o.detail);
    line(
      `Source: ${o.evidence?.source || "Saved observation"} | ${o.evidence?.status || "measured"} | Observed ${o.evidence?.observedAt || "date unavailable"}`,
      9,
    );
  }
  if (payload.answers.length) {
    y -= 16;
    line("Sampled AI answers", 15, true);
    for (const a of payload.answers) {
      line(`${a.provider} / ${a.model} / ${a.created_at}`, 10);
      line(a.prompt, 11);
      line(
        `Detected brand mentions: ${(a.mentions || []).join(", ") || "None in this sampled answer"}`,
        9,
      );
      for (const citation of (a.citations || []).slice(0, 5))
        line(citation.url, 9);
    }
  }
  y -= 16;
  line("Methodology and limits", 14, true);
  line(payload.methodology, 10);
  if (escapedCharacters)
    line(
      "Characters outside this report font are represented by their Unicode code points. JSON and CSV exports preserve the original text.",
      9,
    );
  for (const [index, p] of pdf.getPages().entries())
    p.drawText(`ranksushi.com  |  ${index + 1}`, {
      x: 48,
      y: 30,
      font,
      size: 9,
      color: rgb(0.4, 0.45, 0.4),
    });
  return pdf.save();
}
