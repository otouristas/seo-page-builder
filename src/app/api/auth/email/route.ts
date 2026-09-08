import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, requestIdentity } from "@/lib/server/rate-limit";
import { hashToken } from "@/lib/server/crypto";
import { SITE_URL } from "@/lib/utils";
import { AppError } from "@/lib/server/errors";
export const POST = api(async (request) => {
  const { email, next } = await readJson(
    request,
    z.object({
      email: z.email().max(254),
      next: z.string().max(2200).optional(),
    }),
  );
  await rateLimit(`auth:ip:${requestIdentity(request)}`, 10, 3600);
  await rateLimit(`auth:email:${hashToken(email.toLowerCase())}`, 3, 3600);
  const path = next?.startsWith("/app") && !next.includes("\\") ? next : "/app";
  const db = await createClient();
  const { error } = await db.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(path)}`,
    },
  });
  if (error)
    throw new AppError(
      "The sign-in email could not be sent. Wait a moment and try again.",
      503,
      "email_unavailable",
    );
  return NextResponse.json({ sent: true });
});
