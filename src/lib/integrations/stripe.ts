import "server-only";
import Stripe from "stripe";
import { adminClient } from "../supabase/server";
import { AppError, required } from "../server/errors";
import { checked } from "../server/http";
import { PAID_PLANS, PLANS, STARTER_TRIAL } from "../plans";
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
export function subscriptionState(
  s: Stripe.Subscription,
  trialInvoice: string | null = null,
) {
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
    trial_start: s.trial_start
      ? new Date(s.trial_start * 1000).toISOString()
      : null,
    trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
    trial_invoice: trialInvoice,
    paid_through:
      s.status === "active" &&
      typeof s.latest_invoice === "object" &&
      s.latest_invoice?.status === "paid" &&
      item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
  };
}
// The subscription's trialing status alone is not proof that the $1 was paid.
export function isPaidTrialInvoice(
  invoice: Stripe.Invoice,
  sub: Stripe.Subscription,
  price: string,
) {
  const customer =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  const subCustomer =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const invoiceSub = invoice.parent?.subscription_details?.subscription;
  return (
    sub.metadata.offer === STARTER_TRIAL.offer &&
    invoice.status === "paid" &&
    invoice.currency === "usd" &&
    invoice.amount_paid >= STARTER_TRIAL.price * 100 &&
    invoice.billing_reason === "subscription_create" &&
    customer === subCustomer &&
    (typeof invoiceSub === "string" ? invoiceSub : invoiceSub?.id) === sub.id &&
    invoice.lines.data.some(
      (line) =>
        line.pricing?.price_details?.price === price &&
        line.amount === STARTER_TRIAL.price * 100 &&
        line.quantity === 1,
    )
  );
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
      .select("stripe_customer,stripe_subscription,trial_invoice")
      .eq("workspace_id", workspace)
      .maybeSingle(),
  );
  if (saved?.stripe_customer && saved.stripe_customer !== customerId)
    throw new AppError("Billing customer mismatch.", 409);
  const list = await api.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
    expand: ["data.latest_invoice"],
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
  let trialInvoice: string | null = null;
  if (sub.metadata.offer === STARTER_TRIAL.offer) {
    if (saved?.stripe_subscription === sub.id && saved.trial_invoice) {
      const invoice = await api.invoices.retrieve(saved.trial_invoice);
      if (isPaidTrialInvoice(invoice, sub, required("STRIPE_PRICE_TRIAL")))
        trialInvoice = invoice.id;
    } else {
      const invoices = await api.invoices.list({
        subscription: sub.id,
        limit: 100,
        status: "paid",
      });
      trialInvoice =
        invoices.data.find((i) =>
          isPaidTrialInvoice(i, sub, required("STRIPE_PRICE_TRIAL")),
        )?.id || null;
    }
  }
  checked(
    await db.rpc("sync_subscription", {
      p_workspace: workspace,
      p_observed: observed,
      p_state: subscriptionState(sub, trialInvoice),
    }),
  );
  return sub;
}
export async function checkout(
  workspace: { id: string; owner_email: string },
  plan: (typeof PAID_PLANS)[number],
  offer: "trial" | "monthly" = "trial",
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
  const trial = offer === "trial";
  const trialPrice = trial ? required("STRIPE_PRICE_TRIAL") : null;
  if (trialPrice) {
    const upfront = await api.prices.retrieve(trialPrice);
    if (
      !upfront.active ||
      upfront.currency !== "usd" ||
      upfront.unit_amount !== STARTER_TRIAL.price * 100 ||
      upfront.recurring
    )
      throw new AppError("The configured trial price needs review.", 503);
  }
  let row = checked(
    await db
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  );
  // A failed initial payment can resume the same open Checkout session.
  // Never create a second subscription while its payment is pending.
  if (
    row?.stripe_subscription &&
    !row.trial_used_at &&
    ["incomplete", "trialing"].includes(row.status)
  ) {
    const pending = checked(
      await db
        .from("checkout_intents")
        .select("*")
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
    );
    if (
      pending?.session_url &&
      pending.plan === plan &&
      pending.trial === trial &&
      new Date(pending.expires_at).getTime() > Date.now()
    )
      return { url: pending.session_url };
  }
  if (trial && (row?.trial_used_at || row?.stripe_subscription))
    throw new AppError(
      "The $1 trial is available once for a new workspace. Choose a monthly subscription to continue.",
      409,
      "trial_used",
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
      p_trial: trial,
    }),
  );
  if (intent.plan !== plan || intent.trial !== trial)
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
      line_items: [
        { price, quantity: 1 },
        ...(trialPrice ? [{ price: trialPrice, quantity: 1 }] : []),
      ],
      payment_method_collection: "always",
      custom_text: {
        submit: {
          message: trial
            ? `$1 USD today for 3 days with limited usage. Then $${PLANS[plan].price} USD/month for ${PLANS[plan].name}, automatically, until canceled. Applicable tax is additional. Cancel in RankSushi Billing before the renewal date shown above.`
            : `$${PLANS[plan].price} USD/month for ${PLANS[plan].name}, automatically, until canceled. Applicable tax is additional.`,
        },
      },
      client_reference_id: workspace.id,
      subscription_data: {
        metadata: {
          workspace_id: workspace.id,
          offer: trial ? STARTER_TRIAL.offer : "monthly",
        },
        ...(trial
          ? {
              trial_period_days: STARTER_TRIAL.days,
              trial_settings: {
                end_behavior: { missing_payment_method: "cancel" as const },
              },
            }
          : {}),
      },
      metadata: {
        workspace_id: workspace.id,
        offer: trial ? STARTER_TRIAL.offer : "monthly",
      },
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
    const configured = await api.prices.retrieve(price);
    if (
      !configured.active ||
      configured.currency !== "usd" ||
      configured.unit_amount !== PLANS[plan].price * 100 ||
      configured.recurring?.interval !== "month" ||
      configured.recurring.interval_count !== 1
    )
      throw new AppError(
        "The configured subscription price needs review.",
        503,
      );
    if (price === item.price.id)
      throw new AppError("You are already on that plan.");
    if (s.cancel_at_period_end)
      await api.subscriptions.update(s.id, { cancel_at_period_end: false });
    if (s.status === "trialing") {
      if (scheduleId) await api.subscriptionSchedules.release(scheduleId);
      await api.subscriptions.update(s.id, {
        items: [{ id: item.id, price }],
        proration_behavior: "none",
      });
    } else {
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
