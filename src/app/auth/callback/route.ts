import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/utils";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/app";
  const safeNext =
    next.startsWith("/app") && !next.startsWith("//") && !next.includes("\\")
      ? next
      : "/app";
  const db = await createClient();
  const code = url.searchParams.get("code"),
    token = url.searchParams.get("token_hash");
  const result = code
    ? await db.auth.exchangeCodeForSession(code)
    : token
      ? await db.auth.verifyOtp({ token_hash: token, type: "email" })
      : null;
  if (result && !result.error)
    return NextResponse.redirect(`${SITE_URL}${safeNext}`);
  return NextResponse.redirect(`${SITE_URL}/login?error=expired`);
}
