import Stripe from "stripe";
import { readFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
const env = {
  ...(existsSync(".env.local")
    ? parseEnv(readFileSync(".env.local", "utf8"))
    : {}),
  ...process.env,
};
if (!/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || ""))
  throw new Error(
    "This setup command only accepts an explicitly configured Stripe test key.",
  );
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2 });
for (const [id, name, amount] of [
  ["maki", "Maki", 2900],
  ["nigiri", "Nigiri", 7900],
  ["omakase", "Omakase", 14900],
]) {
  const existing = await stripe.prices.list({
    lookup_keys: [`ranksushi_${id}_usd_monthly_v1`],
    limit: 1,
  });
  let price = existing.data[0];
  if (!price) {
    const product = await stripe.products.create(
      { name: `RankSushi ${name}`, metadata: { app: "ranksushi", plan: id } },
      { idempotencyKey: `ranksushi-product-${id}-v1` },
    );
    price = await stripe.prices.create(
      {
        product: product.id,
        currency: "usd",
        unit_amount: amount,
        recurring: { interval: "month" },
        lookup_key: `ranksushi_${id}_usd_monthly_v1`,
      },
      { idempotencyKey: `ranksushi-price-${id}-v1` },
    );
  }
  if (
    price.currency !== "usd" ||
    price.unit_amount !== amount ||
    price.recurring?.interval !== "month"
  )
    throw new Error("Existing test price does not match the approved catalog.");
  console.log(`STRIPE_PRICE_${id.toUpperCase()}=${price.id}`);
}
const configs = await stripe.billingPortal.configurations.list({
  active: true,
  limit: 100,
});
let config = configs.data.find((c) => c.metadata?.app === "ranksushi");
const settings = {
  business_profile: {
    headline: "RankSushi — Touristas Technologies",
    privacy_policy_url: "https://ranksushi.com/privacy",
    terms_of_service_url: "https://ranksushi.com/terms",
  },
  features: {
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
    subscription_update: { enabled: false },
  },
  metadata: { app: "ranksushi" },
};
config = config
  ? await stripe.billingPortal.configurations.update(config.id, settings)
  : await stripe.billingPortal.configurations.create(settings, {
      idempotencyKey: "ranksushi-portal-v1",
    });
console.log(`STRIPE_PORTAL_CONFIGURATION=${config.id}`);
console.log(
  "Test catalog prepared. Webhooks, test clocks and payment lifecycle validation remain required. No subscription or charge was created.",
);
