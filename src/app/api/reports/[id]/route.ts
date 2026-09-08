import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { randomToken, hashToken } from "@/lib/server/crypto";
import { AppError } from "@/lib/server/errors";
import { reportPdf, reportCsv } from "@/lib/server/reports";
import { SITE_URL } from "@/lib/utils";
async function context(params: Promise<Record<string, string>>) {
  const { db, workspace } = await requireWorkspace();
  const row = checked(
    await db
      .from("reports")
      .select("*")
      .eq("id", (await params).id)
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  );
  if (!row) throw new AppError("Report not found.", 404);
  return { db, workspace, row };
}
export const GET = api(async (request, { params }) => {
  const { row } = await context(params);
  const format = new URL(request.url).searchParams.get("format") || "json";
  if (format === "pdf")
    return new Response(Buffer.from(await reportPdf(row.payload, row.title)), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ranksushi-report.pdf"',
      },
    });
  if (format === "csv")
    return new Response(reportCsv(row.payload), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ranksushi-report.csv"',
      },
    });
  return Response.json({ report: row.payload });
});
export const POST = api(async (request, { params }) => {
  const { db, workspace, row } = await context(params);
  const { action } = await readJson(
    request,
    z.object({ action: z.enum(["share", "revoke"]) }),
  );
  const token = action === "share" ? randomToken() : null;
  const expires = token
    ? new Date(Date.now() + 30 * 86400000).toISOString()
    : null;
  checked(
    await db
      .from("reports")
      .update({
        share_hash: token ? hashToken(token) : null,
        share_expires_at: expires,
      })
      .eq("id", row.id)
      .eq("workspace_id", workspace.id),
  );
  return Response.json({
    url: token ? `${SITE_URL}/share/${token}` : null,
    expiresAt: expires,
  });
});
