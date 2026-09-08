import "server-only";
import Stripe from "stripe";
import { adminClient } from "../supabase/server";
import { AppError, required } from "../server/errors";
import { checked } from "../server/http";
import { PAID_PLANS, PLANS } from "../plans";
import { SITE_URL } from "../utils";
import type { PlanId } from "../types";
export const stripe = () =>
  new Stripe(required("STRIPE_SECRET_KEY"), {
    maxNetworkRetries: 2,
    timeout: 20000,
  });
export function planForPrice(price: string): PlanId {
  return (
    PAID_PLANS.find(
      (p) => process.env[`STRIPE_PRICE_${p.toUpperCase()}`] === price,
    ) || "free"
  );
}
export function subscriptionState(s: Stripe.Subscription) {
  const item = s.items.data[0];
  return {
    stripe_customer:
      typeof s.customer === "string" ? s.customer : s.customer.id,
    stripe_subscription: s.id,
    plan: planForPrice(item?.price.id || ""),
    status: s.status,
    period_start: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: s.cancel_at_period_end,
  };
}
export async function reconcileCustomer(customerId: string) {
  const observed = new Date().toISOString();
  const api = stripe(),
    db = adminClient();
  const customer = await api.customers.retrieve(customerId);
  if (customer.deleted) return;
  const workspace = customer.metadata.workspace_id;
  if (!workspace) return;
  const owner = checked(
    await db.from("workspaces").select("id").eq("id", workspace).maybeSingle(),
  );
  if (!owner) return;
  const saved = checked(
    await db
      .from("subscriptions")
      .select("stripe_customer")
      .eq("workspace_id", workspace)
      .maybeSingle(),
  );
  if (saved?.stripe_customer && saved.stripe_customer !== customerId)
    throw new AppError("Billing customer mismatch.", 409);
  const list = await api.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  const known = list.data
    .filter(
      (s) =>
        s.metadata.workspace_id === workspace &&
        s.items.data.some((i) => planForPrice(i.price.id) !== "free"),
    )
    .sort((a, b) => b.created - a.created);
  const sub =
    known.find((s) =>
      [
        "active",
        "trialing",
        "past_due",
        "unpaid",
        "incomplete",
        "paused",
      ].includes(s.status),
    ) || known[0];
  if (!sub) return;
  checked(
    await db.rpc("sync_subscription", {
      p_workspace: workspace,
      p_observed: observed,
      p_state: subscriptionState(sub),
    }),
  );
  return sub;
}
export async function checkout(
  workspace: { id: string; owner_email: string },
  plan: (typeof PAID_PLANS)[number],
) {
  const api = stripe(),
    db = adminClient();
  const key = required("STRIPE_SECRET_KEY");
  if (
    (key.startsWith("sk_live_") || key.startsWith("rk_live_")) &&
    (process.env.BILLING_LIVE_ENABLED !== "true" ||
      process.env.BILLING_COSTS_APPROVED !== "true" ||
      process.env.BILLING_MERCHANT_READY !== "true")
  )
    throw new AppError(
      "Live sales are not enabled yet.",
      503,
      "billing_not_live",
    );
  const price = required(`STRIPE_PRICE_${plan.toUpperCase()}`);
  const livePrice = await api.prices.retrieve(price);
  if (
    !livePrice.active ||
    livePrice.currency !== "usd" ||
    livePrice.unit_amount !== PLANS[plan].price * 100 ||
    livePrice.recurring?.interval !== "month" ||
    livePrice.recurring.interval_count !== 1
  )
    throw new AppError("The configured subscription price needs review.", 503);
  let row = checked(
    await db
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  );
  if (row?.stripe_customer) {
    const current = await reconcileCustomer(row.stripe_customer);
    if (current && !["canceled", "incomplete_expired"].includes(current.status))
      throw new AppError(
        "Manage your existing subscription in Billing. Plan changes take effect next period.",
        409,
      );
  }
  if (!row?.stripe_customer) {
    const customer = await api.customers.create(
      {
        email: workspace.owner_email,
        metadata: { workspace_id: workspace.id },
      },
      { idempotencyKey: `workspace-customer-${workspace.id}` },
    );
    checked(
      await db
        .from("subscriptions")
        .upsert(
          { workspace_id: workspace.id, stripe_customer: customer.id },
          { onConflict: "workspace_id" },
        ),
    );
    row = { ...row, stripe_customer: customer.id };
  }
  const intent = checked(
    await db.rpc("checkout_intent", {
      p_workspace: workspace.id,
      p_plan: plan,
    }),
  );
  if (intent.plan !== plan)
    throw new AppError(
      "A checkout for another plan is open. Finish or wait for the open checkout to expire.",
      409,
    );
  if (intent.session_url) return { url: intent.session_url };
  let automaticTax = false;
  if (process.env.STRIPE_AUTOMATIC_TAX === "true") {
    const registrations = await api.tax.registrations.list({
      status: "active",
      limit: 1,
    });
    if (!registrations.data.length)
      throw new AppError(
        "Stripe Tax needs an active verified registration before collection can be enabled.",
        503,
      );
    automaticTax = true;
  }
  const session = await api.checkout.sessions.create(
    {
      mode: "subscription",
      customer: row!.stripe_customer,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: workspace.id,
      subscription_data: { metadata: { workspace_id: workspace.id } },
      metadata: { workspace_id: workspace.id },
      success_url: `${SITE_URL}/app?billing=processing`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
      expires_at: Math.floor(new Date(intent.expires_at).getTime() / 1000),
      automatic_tax: { enabled: automaticTax },
      billing_address_collection: "required",
      customer_update: { address: "auto", name: "auto" },
      integration_identifier: "ranksushi-checkout-qhznxmpa",
    },
    { idempotencyKey: `checkout-${intent.id}` },
  );
  if (!session.url) throw new AppError("Checkout could not be opened.", 502);
  checked(
    await db
      .from("checkout_intents")
      .update({ session_url: session.url, session_id: session.id })
      .eq("id", intent.id),
  );
  return { url: session.url };
}
export async function billingPortal(workspaceId: string) {
  const row = checked(
    await adminClient()
      .from("subscriptions")
      .select("stripe_customer")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  );
  if (!row?.stripe_customer)
    throw new AppError(
      "There is no billing account yet. Choose a plan first.",
      409,
    );
  const configuration = required("STRIPE_PORTAL_CONFIGURATION");
  const session = await stripe().billingPortal.sessions.create({
    customer: row.stripe_customer,
    configuration,
    return_url: `${SITE_URL}/app?settings=billing`,
  });
  return { url: session.url };
}
export async function changeSubscription(
  workspaceId: string,
  action: "cancel" | "resume" | "change",
  plan?: (typeof PAID_PLANS)[number],
) {
  const db = adminClient(),
    api = stripe();
  const row = checked(
    await db
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  );
  if (!row?.stripe_subscription)
    throw new AppError("No subscription was found.", 404);
  const s = await api.subscriptions.retrieve(row.stripe_subscription);
  const customer = typeof s.customer === "string" ? s.customer : s.customer.id;
  if (
    customer !== row.stripe_customer ||
    s.metadata.workspace_id !== workspaceId
  )
    throw new AppError("Billing account mismatch.", 403);
  if (!["active", "trialing"].includes(s.status))
    throw new AppError(
      "Resolve your payment status in the customer portal first.",
      409,
    );
  const scheduleId =
    typeof s.schedule === "string" ? s.schedule : s.schedule?.id;
  if (action === "cancel" || action === "resume") {
    if (scheduleId) await api.subscriptionSchedules.release(scheduleId);
    await api.subscriptions.update(s.id, {
      cancel_at_period_end: action === "cancel",
      proration_behavior: "none",
    });
  } else {
    if (!plan) throw new AppError("Choose a plan.");
    const item = s.items.data[0],
      price = required(`STRIPE_PRICE_${plan.toUpperCase()}`);
    if (price === item.price.id)
      throw new AppError("You are already on that plan.");
    if (s.cancel_at_period_end)
      await api.subscriptions.update(s.id, { cancel_at_period_end: false });
    const schedule = scheduleId
      ? await api.subscriptionSchedules.retrieve(scheduleId)
      : await api.subscriptionSchedules.create(
          { from_subscription: s.id },
          { idempotencyKey: `schedule-${s.id}-${item.current_period_end}` },
        );
    await api.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      proration_behavior: "none",
      phases: [
        {
          start_date: item.current_period_start,
          end_date: item.current_period_end,
          items: [{ price: item.price.id, quantity: 1 }],
          proration_behavior: "none",
        },
        {
          start_date: item.current_period_end,
          items: [{ price, quantity: 1 }],
          proration_behavior: "none",
          metadata: { workspace_id: workspaceId },
        },
      ],
    });
  }
  await reconcileCustomer(customer);
  return {
    message:
      action === "cancel"
        ? "Cancellation is scheduled for the end of this billing period."
        : action === "resume"
          ? "Your subscription will renew."
          : "Your plan change is scheduled for the next billing period.",
  };
}
