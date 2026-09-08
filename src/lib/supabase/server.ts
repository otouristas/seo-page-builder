import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as supabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export function databaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
  );
}
export async function createClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components rely on proxy refresh. */
          }
        },
      },
    },
  );
}
export function adminClient() {
  if (!databaseConfigured())
    throw new Error(
      "Database setup is incomplete. Add SUPABASE_SECRET_KEY on the server.",
    );
  return supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
