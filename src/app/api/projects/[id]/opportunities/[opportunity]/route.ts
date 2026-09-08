import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireProject, requireWriteAccess } from "@/lib/server/auth";
import { AppError } from "@/lib/server/errors";
export const PATCH = api(async (request, { params }) => {
  const p = await params;
  const { db, workspace, project } = await requireProject(p.id);
  await requireWriteAccess(workspace.id);
  const { status } = await readJson(
    request,
    z.object({ status: z.enum(["open", "in-progress", "applied"]) }),
  );
  const result = checked(
    await db
      .from("opportunities")
      .update({ status, verified_at: null })
      .eq("id", p.opportunity)
      .eq("project_id", project.id)
      .eq("workspace_id", workspace.id)
      .select("id")
      .maybeSingle(),
  );
  if (!result) throw new AppError("Opportunity not found.", 404);
  return NextResponse.json({ saved: true });
});
