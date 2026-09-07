import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { SessionUser } from "@/lib/auth/server";

export type SessionInfo = {
  user: SessionUser | null;
  authEnabled: boolean;
  providers: ("google" | "twitter")[];
  dataforseo: boolean;
};

/** Who is signed in plus which integrations this deployment has configured. */
export const getSessionInfo = createServerFn({ method: "GET" }).handler(async (): Promise<SessionInfo> => {
  const { env } = await import("@/lib/env.server");
  const { authConfigured, currentUser } = await import("@/lib/auth/server");
  const { dataforseoConfigured } = await import("@/lib/seo/dataforseo");
  const providers: SessionInfo["providers"] = [];
  if (env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")) providers.push("google");
  if (env("TWITTER_CLIENT_ID") && env("TWITTER_CLIENT_SECRET")) providers.push("twitter");
  const enabled = authConfigured() && providers.length > 0;
  const user = enabled ? await currentUser(new Headers(getRequestHeaders())) : null;
  return { user, authEnabled: enabled, providers, dataforseo: dataforseoConfigured() };
});
