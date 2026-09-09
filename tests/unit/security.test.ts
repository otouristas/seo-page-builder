import { describe, it, expect, vi, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { encrypt, decrypt, verifyHmac, hashToken } from "@/lib/server/crypto";
import { readTextLimited } from "@/lib/server/body";
import { scrubEvent } from "@/lib/monitoring";
import { subscriptionState } from "@/lib/integrations/stripe";
import { assertOrigin } from "@/lib/server/http";
import Stripe from "stripe";
afterEach(() => vi.unstubAllEnvs());
describe("Credential and request safety", () => {
  it("encrypts credentials with tamper detection", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", Buffer.alloc(32, 17).toString("base64"));
    const secret = { refresh_token: "test-private-refresh" };
    const value = encrypt(secret);
    expect(value).not.toContain("test-private");
    expect(decrypt(value)).toEqual(secret);
    const parts = value.split(".");
    parts[3] = Buffer.from("changed ciphertext").toString("base64");
    expect(() => decrypt(parts.join("."))).toThrow();
    expect(hashToken("report-token")).not.toContain("report-token");
  });
  it("requires exact webhook signatures", () => {
    const body = '{"id":"job"}',
      key = "unit-test-webhook-secret";
    const sig = createHmac("sha256", key).update(body).digest("hex");
    expect(verifyHmac(body, `sha256=${sig}`, key)).toBe(true);
    expect(verifyHmac(`${body} `, sig, key)).toBe(false);
    expect(verifyHmac(body, "garbage", key)).toBe(false);
    expect(verifyHmac(body, null, key)).toBe(false);
  });
  it("caps streamed bodies even without a Content-Length header", async () => {
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(15));
        c.enqueue(new Uint8Array(20));
        c.close();
      },
    });
    const req = new Request("https://example.com", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    await expect(readTextLimited(req, 20)).rejects.toThrow("too large");
  });
  it("scrubs telemetry identities, bodies and report tokens", () => {
    const r = scrubEvent({
      type: undefined,
      user: { email: "private@example.com" },
      request: {
        url: "https://ranksushi.com/share/private-token?access_token=secret",
        data: "private draft",
        headers: { Authorization: "Bearer secret" },
      },
      extra: { prompt: "private" },
      breadcrumbs: [{ message: "private" }],
      exception: { values: [{ type: "Error", value: "secret token here" }] },
    });
    expect(JSON.stringify(r)).not.toContain("private");
    expect(JSON.stringify(r)).not.toContain("secret");
    expect(r.request?.url).toContain("/share/[token]");
  });
  it.each(["https://ranksushi.vercel.app", "https://ranksushi.com"])(
    "accepts the RankSushi production origin %s",
    (origin) => {
      expect(() =>
        assertOrigin(
          new Request("https://ranksushi.com/api/auth/email", {
            headers: { origin },
          }),
        ),
      ).not.toThrow();
    },
  );
  it("rejects an unrelated request origin", () => {
    expect(() =>
      assertOrigin(
        new Request("https://ranksushi.com/api/auth/email", {
          headers: { origin: "https://example.com" },
        }),
      ),
    ).toThrow("The request origin is not allowed.");
  });
});
describe("Stripe lifecycle interpretation and signatures", () => {
  const fixture = (status: Stripe.Subscription.Status): Stripe.Subscription =>
    ({
      id: "sub_test",
      customer: "cus_test",
      status,
      cancel_at_period_end: false,
      items: {
        data: [
          {
            price: { id: "price_maki" },
            current_period_start: 1788220800,
            current_period_end: 1790812800,
          },
        ],
      },
    }) as Stripe.Subscription;
  it.each(["active", "past_due", "unpaid", "canceled", "incomplete"] as const)(
    "retains authoritative %s state",
    (status) => {
      vi.stubEnv("STRIPE_PRICE_MAKI", "price_maki");
      const s = subscriptionState(fixture(status));
      expect(s.status).toBe(status);
      expect(s.plan).toBe("maki");
      expect(s.period_end).toBe("2026-10-01T00:00:00.000Z");
    },
  );
  it("never infers an entitlement from an unknown price", () => {
    expect(subscriptionState(fixture("active")).plan).toBe("free");
  });
  it("rejects altered, old and unsigned Stripe events", () => {
    const api = new Stripe("sk_test_fixture_only_not_a_key");
    const payload = JSON.stringify({
      id: "evt_test",
      object: "event",
      type: "invoice.paid",
      data: { object: { customer: "cus_test" } },
    });
    const secret = "whsec_fixture_only";
    const header = api.webhooks.generateTestHeaderString({ payload, secret });
    expect(api.webhooks.constructEvent(payload, header, secret).id).toBe(
      "evt_test",
    );
    expect(() =>
      api.webhooks.constructEvent(payload + " ", header, secret),
    ).toThrow();
    const expired = api.webhooks.generateTestHeaderString({
      payload,
      secret,
      timestamp: 1000,
    });
    expect(() =>
      api.webhooks.constructEvent(payload, expired, secret),
    ).toThrow();
  });
});
