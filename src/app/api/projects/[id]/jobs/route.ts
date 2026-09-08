import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { requireProject } from "@/lib/server/auth";
import { enqueueJob, jobInput } from "@/lib/jobs/queue";
import { rateLimit } from "@/lib/server/rate-limit";
export const POST = api(async (request, { params }) => {
  const { project } = await requireProject((await params).id);
  await rateLimit(`jobs:${project.workspace_id}`, 30, 60);
  const input = await readJson(request, jobInput);
  const key = z
    .string()
    .uuid()
    .optional()
    .parse(request.headers.get("idempotency-key") || undefined);
  return NextResponse.json(
    { job: await enqueueJob(project, input, key) },
    { status: 202 },
  );
});
