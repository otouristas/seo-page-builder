import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireProject } from "@/lib/server/auth";
import {
  listProperties,
  disconnectGsc,
  propertyMatchesWebsite,
} from "@/lib/integrations/gsc";
import { enqueueJob } from "@/lib/jobs/queue";
import { AppError } from "@/lib/server/errors";
export const GET = api(async (_r, { params }) => {
  const { project } = await requireProject((await params).id);
  return NextResponse.json({ properties: await listProperties(project) });
});
export const POST = api(async (request, { params }) => {
  const { db, project, workspace } = await requireProject((await params).id);
  const { property } = await readJson(
    request,
    z.object({ property: z.string().max(2048) }),
  );
  const properties = await listProperties(project);
  if (
    !properties.some((p) => p.siteUrl === property) ||
    !propertyMatchesWebsite(property, project.url)
  )
    throw new AppError(
      "Choose a verified property covering this project website.",
      400,
    );
  checked(
    await db
      .from("projects")
      .update({ gsc_property: property })
      .eq("id", project.id)
      .eq("workspace_id", workspace.id),
  );
  let job = null;
  try {
    job = await enqueueJob(
      { ...project, gsc_property: property },
      { kind: "gsc-sync", initial: true },
    );
  } catch (error) {
    if (
      !(error instanceof AppError) ||
      !["paid_required", "jobs_unconfigured"].includes(error.code)
    )
      throw error;
  }
  return NextResponse.json({ saved: true, job });
});
export const DELETE = api(async (_r, { params }) => {
  const { project } = await requireProject((await params).id);
  await disconnectGsc(project);
  return NextResponse.json({ disconnected: true });
});
