import { beforeEach, expect, it, vi } from "vitest";
import Stripe from "stripe";
const state = vi.hoisted(() => ({
  events: new Map<string, { status: string }>(),
  reconcile: vi.fn(),
}));
vi.mock("@/lib/integrations/stripe", async () => {
  const { default: Stripe } = await import("stripe");
  return {
    stripe: () => new Stripe("sk_test_fixture"),
    reconcileCustomer: state.reconcile,
  };
});
vi.mock("@/lib/supabase/server", () => ({
  adminClient: () => ({
    from: () => ({
      select: () => {
        let id = "";
        const chain = {
          eq: (_k: string, v: string) => {
            id = v;
            return chain;
          },
          maybeSingle: async () => ({
            data: state.events.get(id) || null,
            error: null,
          }),
        };
        return chain;
      },
      upsert: async (value: { id: string; status: string }) => {
        if (!state.events.has(value.id))
          state.events.set(value.id, { status: value.status });
        return { data: null, error: null };
      },
      update: (value: { status: string }) => ({
        eq: async (_k: string, id: string) => {
          state.events.set(id, value);
          return { data: null, error: null };
        },
      }),
    }),
  }),
}));
import { POST } from "@/app/api/webhooks/stripe/route";
const api = new Stripe("sk_test_fixture");
function delivery(id = "evt_test", signature = true) {
  const payload = JSON.stringify({
    id,
    type: "invoice.paid",
    data: { object: { customer: "cus_test" } },
    created: 123,
  });
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: {
      "stripe-signature": signature
        ? api.webhooks.generateTestHeaderString({
            payload,
            secret: "whsec_fixture",
          })
        : "invalid",
    },
  });
}
beforeEach(() => {
  state.events.clear();
  state.reconcile.mockReset();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture");
});
it("rejects invalid signatures before changing billing", async () => {
  expect((await POST(delivery("bad", false))).status).toBe(400);
  expect(state.events.size).toBe(0);
  expect(state.reconcile).not.toHaveBeenCalled();
});
it("processes a verified delivery once and acknowledges provider retries", async () => {
  expect((await POST(delivery())).status).toBe(200);
  expect((await POST(delivery())).status).toBe(200);
  expect(state.reconcile).toHaveBeenCalledExactlyOnceWith("cus_test");
  expect(state.events.get("stripe:evt_test")?.status).toBe("processed");
});
it("returns a retryable failure until current Stripe state can be reconciled", async () => {
  state.reconcile
    .mockRejectedValueOnce(new Error("provider unavailable"))
    .mockResolvedValueOnce({});
  expect((await POST(delivery())).status).toBe(500);
  expect(state.events.get("stripe:evt_test")?.status).toBe("pending");
  expect((await POST(delivery())).status).toBe(200);
  expect(state.reconcile).toHaveBeenCalledTimes(2);
  expect(state.events.get("stripe:evt_test")?.status).toBe("processed");
});
