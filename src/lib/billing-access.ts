import { isPlan, PLANS, STARTER_TRIAL } from "./plans";

export type BillingState = {
  plan: string;
  status: string;
  stripe_subscription?: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_through?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  trial_invoice?: string | null;
  trial_used_at?: string | null;
};
/** Every provider operation uses this decision, independently of the UI. */
export function billingAccess(s: BillingState | null, now = Date.now()) {
  const time = (value?: string | null) => (value ? Date.parse(value) : 0);
  const trialEnd = Math.min(
    time(s?.trial_end),
    time(s?.trial_start) + STARTER_TRIAL.days * 86400000,
  );
  const trial = !!(
    s?.status === "trialing" &&
    s.stripe_subscription &&
    time(s.trial_start) <= now &&
    s.trial_invoice &&
    s.trial_start &&
    trialEnd > now
  );
  const active = !!(
    s?.status === "active" &&
    !!s.period_start &&
    time(s.period_start) <= now &&
    time(s.paid_through) > now &&
    time(s.period_end) > now
  );
  const plan = (trial || active) && isPlan(s?.plan) ? s.plan : "free";
  return {
    plan,
    phase:
      plan === "free"
        ? ("free" as const)
        : trial
          ? ("trial" as const)
          : ("paid" as const),
    limits:
      trial && plan !== "free" ? STARTER_TRIAL.limits : PLANS[plan].limits,
    period:
      plan === "free"
        ? "free-lifetime"
        : trial
          ? `trial:${s!.stripe_subscription}`
          : s!.period_start!,
    trialEligible: !s?.trial_used_at && !s?.stripe_subscription,
  };
}
