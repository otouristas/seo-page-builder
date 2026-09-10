import { NextResponse } from "next/server";
import { api } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { randomToken } from "@/lib/server/crypto";
import {
  GSC_ONBOARDING_MAX_AGE,
  GSC_ONBOARDING_STATE_COOKIE,
  sealOnboardingState,
} from "@/lib/server/gsc-onboarding";
import { gscAuthorizationUrl } from "@/lib/integrations/gsc";

export const POST = api(async () => {
  const { user } = await requireWorkspace();
  const state = randomToken();
  const verifier = randomToken();
  const response = NextResponse.json({
    url: gscAuthorizationUrl(state, verifier),
  });
  response.cookies.set(
    GSC_ONBOARDING_STATE_COOKIE,
    sealOnboardingState({
      state,
      verifier,
      userId: user.id,
      expiresAt: Date.now() + GSC_ONBOARDING_MAX_AGE * 1000,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: GSC_ONBOARDING_MAX_AGE,
      path: "/api/gsc/callback",
    },
  );
  return response;
});
