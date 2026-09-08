import { NextResponse } from "next/server";
import { api } from "@/lib/server/http";
import { createClient } from "@/lib/supabase/server";
export const POST = api(async () => {
  const db = await createClient();
  await db.auth.signOut();
  return NextResponse.json({ signedOut: true });
});
