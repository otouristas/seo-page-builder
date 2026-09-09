import "server-only";
import { decrypt, encrypt } from "./crypto";
import type { GscCredentials } from "../integrations/gsc";

export const GSC_ONBOARDING_STATE_COOKIE = "ranksushi_gsc_onboarding_state";
export const GSC_ONBOARDING_CREDENTIALS_COOKIE =
  "ranksushi_gsc_onboarding_credentials";
export const GSC_ONBOARDING_MAX_AGE = 10 * 60;

export type GscOnboardingState = {
  state: string;
  verifier: string;
  userId: string;
  expiresAt: number;
};

export type GscOnboardingCredentials = {
  userId: string;
  credentials: GscCredentials;
  expiresAt: number;
};

export function sealOnboardingState(value: GscOnboardingState) {
  return encrypt(value);
}

export function openOnboardingState(value: string) {
  return decrypt<GscOnboardingState>(value);
}

export function sealOnboardingCredentials(
  userId: string,
  credentials: GscCredentials,
) {
  return encrypt({
    userId,
    credentials,
    expiresAt: Date.now() + GSC_ONBOARDING_MAX_AGE * 1000,
  } satisfies GscOnboardingCredentials);
}

export function openOnboardingCredentials(value: string) {
  const session = decrypt<GscOnboardingCredentials>(value);
  if (!session.userId || session.expiresAt < Date.now())
    throw new Error("This Google connection has expired. Start again.");
  return session;
}
