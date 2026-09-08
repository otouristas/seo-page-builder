import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { finishGsc } from "@/lib/integrations/gsc";
import { SITE_URL } from "@/lib/utils";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const jar = await cookies();
  const state = q.get("state");
  const expected = jar.get("gsc_oauth_state")?.value;
  jar.delete("gsc_oauth_state");
  try {
    if (!state || state !== expected || !q.get("code") || q.get("error"))
      throw new Error("Invalid state");
    const user = await requireUser();
    const projectId = await finishGsc(q.get("code")!, state, user.id);
    return NextResponse.redirect(
      `${SITE_URL}/app/${projectId}/settings?gsc=connected`,
    );
  } catch {
    return NextResponse.redirect(`${SITE_URL}/app?gsc=reconnect`);
  }
}
