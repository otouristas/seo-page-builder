import { describe, it, expect, vi, afterEach } from "vitest";
import type Stripe from "stripe";
import { billingAccess, type BillingState } from "@/lib/billing-access";
import {
  isPaidTrialInvoice,
  subscriptionState,
} from "@/lib/integrations/stripe";
import { STARTER_TRIAL, PLANS } from "@/lib/plans";
const now = Date.parse("2026-09-10T12:00:00Z");
const trial: BillingState = {
  plan: "omakase",
  status: "trialing",
  stripe_subscription: "sub_trial",
  period_start: "2026-09-09T12:00:00Z",
  period_end: "2026-09-12T12:00:00Z",
  trial_start: "2026-09-09T12:00:00Z",
  trial_end: "2026-09-12T12:00:00Z",
  trial_invoice: "in_paid",
  trial_used_at: "2026-09-09T12:00:00Z",
};
afterEach(() => vi.unstubAllEnvs());
describe("Paid starter trial access", () => {
  it("caps every selected tier and retains one stable usage period through plan changes", () => {
    for (const plan of ["maki", "nigiri", "omakase"]) {
      const access = billingAccess({ ...trial, plan }, now);
      expect(access.limits).toEqual(STARTER_TRIAL.limits);
      expect(access.period).toBe("trial:sub_trial");
      expect(access.phase).toBe("trial");
      expect(access.trialEligible).toBe(false);
    }
  });
  it("does not grant access for an unpaid trial or unknown price", () => {
    expect(billingAccess({ ...trial, trial_invoice: null }, now).plan).toBe(
      "free",
    );
    expect(billingAccess({ ...trial, plan: "unknown" }, now).plan).toBe("free");
  });
  it("expires at the exact deadline even without a webhook and rejects extensions", () => {
    const deadline = Date.parse(trial.trial_end!);
    expect(billingAccess(trial, deadline - 1).phase).toBe("trial");
    expect(billingAccess(trial, deadline).phase).toBe("free");
    expect(
      billingAccess({ ...trial, trial_end: "2026-10-01" }, deadline).phase,
    ).toBe("free");
  });
  it.each(["past_due", "unpaid", "canceled", "incomplete", "paused"])(
    "denies %s access and a repeat trial",
    (status) => {
      const access = billingAccess({ ...trial, status }, now);
      expect(access.plan).toBe("free");
      expect(access.trialEligible).toBe(false);
    },
  );
  it("unlocks monthly limits only after payment and changes the quota period", () => {
    const renewal = {
      ...trial,
      status: "active",
      period_start: "2026-09-12T12:00:00Z",
      period_end: "2026-10-12T12:00:00Z",
    };
    expect(billingAccess(renewal, now).plan).toBe("free");
    const paid = billingAccess(
      { ...renewal, paid_through: renewal.period_end },
      Date.parse("2026-09-13T12:00:00Z"),
    );
    expect(paid.limits).toEqual(PLANS.omakase.limits);
    expect(paid.period).toBe(renewal.period_start);
    expect(paid.phase).toBe("paid");
  });
  it("keeps a new account eligible and never renews expired access from a saved plan name", () => {
    expect(billingAccess(null, now).trialEligible).toBe(true);
    expect(
      billingAccess(
        { ...trial, status: "active", paid_through: "2026-09-01" },
        now,
      ).plan,
    ).toBe("free");
  });
});
const sub = {
  id: "sub_trial",
  customer: "cus_owner",
  metadata: { offer: STARTER_TRIAL.offer },
  status: "trialing",
  items: {
    data: [
      {
        price: { id: "price_maki" },
        current_period_start: 1788955200,
        current_period_end: 1789214400,
      },
    ],
  },
} as unknown as Stripe.Subscription;
const invoice = {
  id: "in_paid",
  status: "paid",
  customer: "cus_owner",
  currency: "usd",
  amount_paid: 100,
  billing_reason: "subscription_create",
  parent: { subscription_details: { subscription: "sub_trial" } },
  lines: {
    data: [
      {
        quantity: 1,
        amount: 100,
        pricing: { price_details: { price: "price_trial" } },
      },
    ],
  },
} as Stripe.Invoice;
describe("Stripe payment evidence", () => {
  it("requires the actual paid $1 price on this customer's initial subscription invoice", () => {
    expect(isPaidTrialInvoice(invoice, sub, "price_trial")).toBe(true);
    for (const change of [
      { status: "open" },
      { amount_paid: 0 },
      { customer: "cus_other" },
      { currency: "eur" },
      { billing_reason: "subscription_cycle" },
      { parent: { subscription_details: { subscription: "sub_other" } } },
      { lines: { data: [] } },
    ]) {
      expect(
        isPaidTrialInvoice(
          { ...invoice, ...change } as Stripe.Invoice,
          sub,
          "price_trial",
        ),
      ).toBe(false);
    }
    expect(isPaidTrialInvoice(invoice, sub, "price_wrong")).toBe(false);
    expect(
      isPaidTrialInvoice(invoice, { ...sub, metadata: {} }, "price_trial"),
    ).toBe(false);
  });
  it("an active subscription with an open renewal invoice grants no paid period", () => {
    vi.stubEnv("STRIPE_PRICE_MAKI", "price_maki");
    const active = {
      ...sub,
      status: "active",
    } as unknown as Stripe.Subscription;
    expect(
      subscriptionState({
        ...active,
        latest_invoice: { ...invoice, status: "open" },
      }).paid_through,
    ).toBeNull();
    expect(
      subscriptionState({ ...active, latest_invoice: invoice }).paid_through,
    ).toBeTruthy();
  });
});
