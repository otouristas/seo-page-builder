import { beforeEach, afterEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  row: null as Record<string, unknown> | null,
  create: vi.fn(),
  prices: vi.fn(),
  rpc: vi.fn(),
  update: vi.fn(),
}));
vi.mock("stripe", () => ({
  default: class {
    prices = { retrieve: mocks.prices };
    customers = { create: vi.fn(async () => ({ id: "cus_new" })) };
    checkout = { sessions: { create: mocks.create } };
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  adminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: mocks.row, error: null }),
        }),
      }),
      upsert: async () => ({ data: null, error: null }),
      update: (data: unknown) => {
        mocks.update(data);
        return { eq: async () => ({ data: null, error: null }) };
      },
    }),
    rpc: mocks.rpc,
  }),
}));
import { checkout } from "@/lib/integrations/stripe";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.row = null;
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
  vi.stubEnv("STRIPE_PRICE_MAKI", "price_maki");
  vi.stubEnv("STRIPE_PRICE_TRIAL", "price_trial");
  vi.stubEnv("STRIPE_AUTOMATIC_TAX", "false");
  mocks.prices.mockImplementation(async (id: string) => ({
    id,
    active: true,
    currency: "usd",
    unit_amount: id === "price_trial" ? 100 : 2900,
    recurring:
      id === "price_trial" ? null : { interval: "month", interval_count: 1 },
  }));
  mocks.create.mockResolvedValue({
    id: "cs_test",
    url: "https://checkout.stripe.com/test",
  });
  mocks.rpc.mockImplementation(
    async (_name: string, params: { p_trial: boolean }) => ({
      data: {
        id: "intent_same",
        plan: "maki",
        trial: params.p_trial,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      error: null,
    }),
  );
});
afterEach(() => vi.unstubAllEnvs());
it("charges $1 once and starts recurring billing after 3 days, with consent and stable idempotency", async () => {
  await checkout(
    { id: "workspace", owner_email: "fixture@example.com" },
    "maki",
    "trial",
  );
  const [session, options] = mocks.create.mock.calls[0];
  expect(session.line_items).toEqual([
    { price: "price_maki", quantity: 1 },
    { price: "price_trial", quantity: 1 },
  ]);
  expect(session.subscription_data.trial_period_days).toBe(3);
  expect(
    session.subscription_data.trial_settings.end_behavior
      .missing_payment_method,
  ).toBe("cancel");
  expect(session.consent_collection.terms_of_service).toBe("required");
  expect(session.custom_text.submit.message).toContain("$29 USD/month");
  expect(session.custom_text.submit.message).toContain("$1 USD today");
  expect(session.payment_method_collection).toBe("always");
  expect(session).not.toHaveProperty("payment_method_types");
  expect(options.idempotencyKey).toBe("checkout-intent_same");
});
it("does not add a trial or $1 fee to a regular monthly subscription", async () => {
  await checkout(
    { id: "workspace", owner_email: "fixture@example.com" },
    "maki",
    "monthly",
  );
  const [session] = mocks.create.mock.calls[0];
  expect(session.line_items).toHaveLength(1);
  expect(session.subscription_data).not.toHaveProperty("trial_period_days");
});
it("rejects a used trial, a wrong fee, or an incompatible open checkout before creating a session", async () => {
  mocks.row = { trial_used_at: new Date().toISOString() };
  await expect(
    checkout({ id: "workspace", owner_email: "fixture@example.com" }, "maki"),
  ).rejects.toThrow("once");
  mocks.row = null;
  mocks.prices
    .mockResolvedValueOnce({
      active: true,
      currency: "usd",
      unit_amount: 2900,
      recurring: { interval: "month", interval_count: 1 },
    })
    .mockResolvedValueOnce({
      active: true,
      currency: "usd",
      unit_amount: 1000,
    });
  await expect(
    checkout({ id: "workspace", owner_email: "fixture@example.com" }, "maki"),
  ).rejects.toThrow("trial price");
  mocks.rpc.mockResolvedValue({
    data: { plan: "nigiri", trial: true },
    error: null,
  });
  await expect(
    checkout({ id: "workspace", owner_email: "fixture@example.com" }, "maki"),
  ).rejects.toThrow("another plan");
  expect(mocks.create).not.toHaveBeenCalled();
});
it("keeps live charges disabled until launch gates are satisfied", async () => {
  vi.stubEnv("STRIPE_SECRET_KEY", "rk_live_fixture");
  vi.stubEnv("BILLING_LIVE_ENABLED", "false");
  await expect(
    checkout({ id: "workspace", owner_email: "fixture@example.com" }, "maki"),
  ).rejects.toThrow("not enabled");
  expect(mocks.create).not.toHaveBeenCalled();
});

it("resumes an open initial payment without creating a second subscription", async () => {
  mocks.row = {
    stripe_subscription: "sub_pending",
    status: "incomplete",
    trial_used_at: null,
    session_url: "https://checkout.stripe.com/pending",
    plan: "maki",
    trial: true,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
  expect(
    await checkout(
      { id: "workspace", owner_email: "fixture@example.com" },
      "maki",
    ),
  ).toEqual({ url: "https://checkout.stripe.com/pending" });
  expect(mocks.create).not.toHaveBeenCalled();
});
