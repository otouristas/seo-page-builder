import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { requireProject } from "@/lib/server/auth";
import { gscAuthorization } from "@/lib/integrations/gsc";
export const POST = api(async (request) => {
  const { projectId } = await readJson(
    request,
    z.object({ projectId: z.string().uuid() }),
  );
  const { project, user } = await requireProject(projectId);
  const { url, state } = await gscAuthorization(project, user.id);
  const response = NextResponse.json({ url });
  response.cookies.set("gsc_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/gsc/callback",
  });
  return response;
});
