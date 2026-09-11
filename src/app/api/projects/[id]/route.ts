import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson, checked } from "@/lib/server/http";
import { requireProject } from "@/lib/server/auth";
import { projectData } from "@/lib/server/project-data";
import { safeIconUrl } from "@/lib/site-icons";
export const GET = api(async (_r, { params }) =>
  NextResponse.json(await projectData((await params).id)),
);
export const PATCH = api(async (request, { params }) => {
  const { db, workspace, project } = await requireProject((await params).id);
  const data = await readJson(
    request,
    z.object({
      name: z.string().min(2).max(80).optional(),
      description: z.string().min(10).max(2000).optional(),
      country: z
        .string()
        .regex(/^[A-Z]{2}$/)
        .optional(),
      language: z
        .string()
        .regex(/^[a-z]{2,3}(-[A-Z]{2})?$/)
        .optional(),
      weekly_scan: z.boolean().optional(),
      scan_limit: z.number().int().min(1).max(200).optional(),
      email_digest: z.boolean().optional(),
      logo: z.string().max(2048).nullable().optional(),
    }),
  );
  /* A logo is only ever stored as an absolute http(s) image address. */
  const update =
    data.logo === undefined
      ? data
      : {
          ...data,
          logo: data.logo ? safeIconUrl(data.logo, project.url) : null,
        };
  checked(
    await db
      .from("projects")
      .update(update)
      .eq("id", project.id)
      .eq("workspace_id", workspace.id),
  );
  return NextResponse.json({ saved: true });
});
