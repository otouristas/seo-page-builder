import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireProject, requireWriteAccess } from "@/lib/server/auth";
import { AppError } from "@/lib/server/errors";
import { escapeHtml, toCsv } from "@/lib/utils";
async function context(params: Promise<Record<string, string>>) {
  const p = await params;
  const ctx = await requireProject(p.id);
  const draft = checked(
    await ctx.db
      .from("drafts")
      .select("*,draft_revisions(*)")
      .eq("id", p.draft)
      .eq("project_id", ctx.project.id)
      .eq("workspace_id", ctx.workspace.id)
      .maybeSingle(),
  );
  if (!draft) throw new AppError("Draft not found.", 404);
  return { ...ctx, draft };
}
export const PATCH = api(async (request, { params }) => {
  const { db, workspace, draft } = await context(params);
  await requireWriteAccess(workspace.id);
  const { content } = await readJson(
    request,
    z.object({ content: z.string().min(1).max(100000) }),
  );
  const revision = checked(
    await db.rpc("save_draft_revision", {
      p_draft: draft.id,
      p_workspace: workspace.id,
      p_content: content,
    }),
  );
  return NextResponse.json({ revision });
});
export const GET = api(async (request, { params }) => {
  const { draft } = await context(params);
  const format = new URL(request.url).searchParams.get("format") || "json";
  const revisions = draft.draft_revisions as {
    version: number;
    content: string;
  }[];
  const latest = revisions.sort((a, b) => b.version - a.version)[0];
  if (!latest) throw new AppError("No revision was found.", 404);
  let text = "",
    type = "",
    ext = "";
  if (format === "md") {
    text = latest.content;
    type = "text/markdown";
    ext = "md";
  } else if (format === "html") {
    text = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escapeHtml(draft.title)}</title><body><article><h1>${escapeHtml(draft.title)}</h1><pre style="white-space:pre-wrap">${escapeHtml(latest.content)}</pre></article></body></html>`;
    type = "text/html";
    ext = "html";
  } else if (format === "csv") {
    text = toCsv([
      {
        title: draft.title,
        kind: draft.kind,
        version: latest.version,
        content: latest.content,
      },
    ]);
    type = "text/csv";
    ext = "csv";
  } else {
    text = JSON.stringify(
      {
        title: draft.title,
        kind: draft.kind,
        version: latest.version,
        content: latest.content,
      },
      null,
      2,
    );
    type = "application/json";
    ext = "json";
  }
  return new Response(text, {
    headers: {
      "Content-Type": `${type}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="ranksushi-draft.${ext}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
});
