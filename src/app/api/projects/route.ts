import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireWorkspace, entitlements } from "@/lib/server/auth";
import { validatePublicUrl } from "@/lib/seo/safe-fetch";
import { AppError } from "@/lib/server/errors";
import { rateLimit } from "@/lib/server/rate-limit";
export const GET = api(async () => {
  const { db, workspace } = await requireWorkspace();
  return NextResponse.json({
    projects: checked(
      await db
        .from("projects")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at"),
    ),
  });
});
export const POST = api(async (request) => {
  const { db, workspace } = await requireWorkspace();
  await rateLimit(`project:${workspace.id}`, 10, 3600);
  const body = await readJson(
    request,
    z.object({
      name: z.string().trim().min(2).max(80),
      url: z.string().min(4).max(2048),
      description: z.string().trim().min(10).max(2000),
      country: z.string().regex(/^[A-Z]{2}$/),
      language: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/),
      auditToken: z.string().max(100).optional(),
    }),
  );
  const { url } = await validatePublicUrl(body.url);
  const access = await entitlements(workspace.id);
  const result = await db.rpc("create_project", {
    p_workspace: workspace.id,
    p_limit: access.limits.projects,
    p_data: { ...body, url: url.href },
  });
  if (result.error?.message.includes("project_limit"))
    throw new AppError(
      "Your workspace has reached its project allowance.",
      402,
      "project_limit",
    );
  const project = checked(result);
  if (body.auditToken) {
    const { adoptFreeAudit } = await import("@/lib/server/free-audit");
    await adoptFreeAudit(project, body.auditToken);
  }
  checked(
    await db.from("product_events").insert({
      workspace_id: workspace.id,
      event: "project.created",
      metadata: { projectId: project.id },
    }),
  );
  return NextResponse.json({ project }, { status: 201 });
});
