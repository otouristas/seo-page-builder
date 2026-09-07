import { createAuthClient } from "better-auth/react";

/** Client-side flag: sign-in UI is shown only when the server is configured for it. */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED === "true";

export type ProviderId = "google" | "twitter";

export const PROVIDERS: { providerId: ProviderId; label: string; hint: string }[] = [
  { providerId: "google", label: "Google", hint: "Workspace or personal account" },
  { providerId: "twitter", label: "X", hint: "Formerly Twitter" },
];

export const authClient = createAuthClient();

export function signIn(providerId: ProviderId, opts: { callbackURL?: string } = {}) {
  return authClient.signIn.social({ provider: providerId, callbackURL: opts.callbackURL ?? "/app" });
}

export function signOut() {
  return authClient.signOut();
}

export const useSession = authClient.useSession;
