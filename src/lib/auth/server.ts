import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "@/lib/env.server";
import { getDb, getDialect } from "@/lib/db/server";

export function authConfigured(): boolean {
  return Boolean(env("BETTER_AUTH_SECRET"));
}

/** Built lazily so the DB dialect (pg or PGLite) is ready before Better Auth touches it. */
async function createAuth() {
  await getDb(); // runs the SQL migrations so Better Auth's schema check passes
  const dialect = await getDialect();
  const googleId = env("GOOGLE_CLIENT_ID");
  const googleSecret = env("GOOGLE_CLIENT_SECRET");
  const twitterId = env("TWITTER_CLIENT_ID");
  const twitterSecret = env("TWITTER_CLIENT_SECRET");
  return betterAuth({
    appName: "Rankframe",
    secret: env("BETTER_AUTH_SECRET") ?? "rankframe-dev-secret-change-me-please-now",
    baseURL: env("BETTER_AUTH_URL"),
    database: { dialect, type: "postgres" as const },
    socialProviders: {
      ...(googleId && googleSecret ? { google: { clientId: googleId, clientSecret: googleSecret } } : {}),
      ...(twitterId && twitterSecret ? { twitter: { clientId: twitterId, clientSecret: twitterSecret } } : {}),
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    plugins: [tanstackStartCookies()],
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;
let authPromise: Promise<Auth> | null = null;

export function getAuth(): Promise<Auth> {
  if (!authPromise) authPromise = createAuth();
  return authPromise;
}

export type SessionUser = { id: string; name: string; email: string; image?: string | null };

/** Resolve the signed-in user for the current request, or null. */
export async function currentUser(headers: Headers): Promise<SessionUser | null> {
  if (!authConfigured()) return null;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) return null;
    const u = session.user;
    return { id: u.id, name: u.name, email: u.email, image: u.image ?? null };
  } catch {
    return null;
  }
}
