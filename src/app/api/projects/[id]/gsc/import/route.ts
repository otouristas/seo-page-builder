import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireProject, requireWriteAccess } from "@/lib/server/auth";
import { parseGscCsv } from "@/lib/seo/gsc";
import { hashToken } from "@/lib/server/crypto";
import { AppError } from "@/lib/server/errors";
export const POST = api(async (request, { params }) => {
  const { db, project, workspace } = await requireProject((await params).id);
  await requireWriteAccess(workspace.id);
  const { csv } = await readJson(
    request,
    z.object({ csv: z.string().max(900000) }),
  );
  let rows;
  try {
    rows = parseGscCsv(csv);
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : "Invalid CSV.");
  }
  const entries = rows.map((r) => ({
    ...r,
    workspace_id: workspace.id,
    project_id: project.id,
    property: project.gsc_property || project.url,
    dataset: "csv",
    dimension_key: hashToken(
      JSON.stringify([r.query, r.page, r.country, r.device]),
    ),
  }));
  for (let i = 0; i < entries.length; i += 500)
    checked(
      await db.from("gsc_daily").upsert(entries.slice(i, i + 500), {
        onConflict: "project_id,property,date,dataset,dimension_key",
      }),
    );
  return NextResponse.json({
    imported: rows.length,
    note: "CSV records are stored separately and do not alter API totals.",
  });
});
