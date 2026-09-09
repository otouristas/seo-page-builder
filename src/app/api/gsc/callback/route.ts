import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { exchangeGscCode, finishGsc } from "@/lib/integrations/gsc";
import {
  GSC_ONBOARDING_CREDENTIALS_COOKIE,
  GSC_ONBOARDING_STATE_COOKIE,
  openOnboardingState,
  sealOnboardingCredentials,
} from "@/lib/server/gsc-onboarding";
import { SITE_URL } from "@/lib/utils";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const jar = await cookies();
  const state = q.get("state");
  const onboarding = jar.get(GSC_ONBOARDING_STATE_COOKIE)?.value;
  let pending = null;
  if (onboarding) {
    try {
      pending = openOnboardingState(onboarding);
    } catch {
      jar.delete(GSC_ONBOARDING_STATE_COOKIE);
    }
  }
  if (pending && state === pending.state) {
    try {
      if (pending.expiresAt < Date.now() || !q.get("code") || q.get("error"))
        throw new Error("Invalid onboarding authorization");
      const user = await requireUser();
      if (user.id !== pending.userId) throw new Error("Invalid user");
      const credentials = await exchangeGscCode(
        q.get("code")!,
        pending.verifier,
      );
      jar.delete(GSC_ONBOARDING_STATE_COOKIE);
      jar.set(
        GSC_ONBOARDING_CREDENTIALS_COOKIE,
        sealOnboardingCredentials(user.id, credentials),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 600,
          path: "/",
        },
      );
      return NextResponse.redirect(`${SITE_URL}/app/new?gsc=choose`);
    } catch {
      jar.delete(GSC_ONBOARDING_STATE_COOKIE);
      jar.delete(GSC_ONBOARDING_CREDENTIALS_COOKIE);
      return NextResponse.redirect(`${SITE_URL}/app/new?gsc=error`);
    }
  }
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
