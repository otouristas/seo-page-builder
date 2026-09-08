import { NextResponse } from "next/server";
import { api, checked } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { AppError } from "@/lib/server/errors";
import { cancelJob } from "@/lib/jobs/queue";
export const GET = api(async (_request, { params }) => {
  const { db, workspace } = await requireWorkspace();
  const job = checked(
    await db
      .from("jobs")
      .select("id,kind,status,stage,output,error,created_at,updated_at")
      .eq("id", (await params).id)
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  );
  if (!job) throw new AppError("Job not found.", 404);
  return NextResponse.json({ job });
});
export const DELETE = api(async (_request, { params }) => {
  const { db, workspace } = await requireWorkspace();
  const job = checked(
    await db
      .from("jobs")
      .select("*")
      .eq("id", (await params).id)
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  );
  if (!job) throw new AppError("Job not found.", 404);
  if (!["queued", "running"].includes(job.status))
    throw new AppError("This job has already finished.", 409);
  await cancelJob(job);
  return NextResponse.json({ cancelled: true });
});
