import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api, checked, readJson } from "@/lib/server/http";
import { entitlements, requireWorkspace } from "@/lib/server/auth";
import { validatePublicUrl } from "@/lib/seo/safe-fetch";
import {
  listPropertiesForToken,
  propertyWebsite,
} from "@/lib/integrations/gsc";
import { encrypt } from "@/lib/server/crypto";
import { AppError } from "@/lib/server/errors";
import {
  openOnboardingCredentials,
  GSC_ONBOARDING_CREDENTIALS_COOKIE,
} from "@/lib/server/gsc-onboarding";
import { enqueueJob } from "@/lib/jobs/queue";
import { projectLimitMessage } from "@/lib/plans";
import type { Project } from "@/lib/types";

async function onboardingSession() {
  const { user, workspace, db } = await requireWorkspace();
  const jar = await cookies();
  const value = jar.get(GSC_ONBOARDING_CREDENTIALS_COOKIE)?.value;
  if (!value)
    throw new AppError(
      "Connect Google Search Console first, then choose your website.",
      409,
      "gsc_onboarding_required",
    );
  try {
    const session = openOnboardingCredentials(value);
    if (session.userId !== user.id) throw new Error("Invalid user");
    return { user, workspace, db, jar, session };
  } catch {
    throw new AppError(
      "This Google connection expired. Connect Search Console again.",
      409,
      "gsc_onboarding_expired",
    );
  }
}

export const GET = api(async () => {
  const { session } = await onboardingSession();
  return NextResponse.json({
    properties: await listPropertiesForToken(session.credentials.access_token),
  });
});

export const POST = api(async (request) => {
  const { workspace, db, session } = await onboardingSession();
  const body = await readJson(
    request,
    z.object({
      property: z.string().min(1).max(2048),
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().max(2000).optional(),
      country: z.string().regex(/^[A-Z]{2}$/),
      language: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/),
    }),
  );
  const properties = await listPropertiesForToken(
    session.credentials.access_token,
  );
  if (!properties.some((p) => p.siteUrl === body.property))
    throw new AppError(
      "Choose one of the verified Search Console properties returned by Google.",
      400,
      "gsc_property_invalid",
    );
  const website = propertyWebsite(body.property);
  const { url } = await validatePublicUrl(website);
  const access = await entitlements(workspace.id);
  const result = await db.rpc("create_project", {
    p_workspace: workspace.id,
    p_limit: access.limits.projects,
    p_data: {
      name: body.name,
      url: url.href,
      description:
        body.description || `Search visibility for ${new URL(url).hostname}.`,
      country: body.country,
      language: body.language,
    },
  });
  if (result.error?.message.includes("project_limit"))
    throw new AppError(
      projectLimitMessage(access.plan, access.limits.projects, access.phase),
      402,
      "project_limit",
    );
  const project = checked(result) as Project;
  checked(
    await db
      .from("projects")
      .update({ gsc_property: body.property })
      .eq("id", project.id)
      .eq("workspace_id", workspace.id),
  );
  checked(
    await db.from("integrations").upsert(
      {
        workspace_id: workspace.id,
        project_id: project.id,
        provider: "gsc",
        credentials: encrypt(JSON.stringify(session.credentials)),
        status: "connected",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id,provider" },
    ),
  );
  checked(
    await db.from("product_events").insert({
      workspace_id: workspace.id,
      event: "project.created_from_gsc",
      metadata: { projectId: project.id, property: body.property },
    }),
  );
  let job = null;
  try {
    job = await enqueueJob(
      { ...project, url: url.href, gsc_property: body.property },
      { kind: "gsc-sync", initial: true },
    );
  } catch (error) {
    if (
      !(error instanceof AppError) ||
      !["paid_required", "jobs_unconfigured"].includes(error.code)
    )
      throw error;
  }
  const response = NextResponse.json({
    project: { ...project, url: url.href, gsc_property: body.property },
    job,
  });
  response.cookies.set(GSC_ONBOARDING_CREDENTIALS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
});
