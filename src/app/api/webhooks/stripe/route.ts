import { readTextLimited } from "@/lib/server/body";
import { stripe, reconcileCustomer } from "@/lib/integrations/stripe";
import { adminClient } from "@/lib/supabase/server";
import { required } from "@/lib/server/errors";
import { checked } from "@/lib/server/http";
import * as Sentry from "@sentry/nextjs";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 1000000)
    return new Response("Too large", { status: 413 });
  let raw: string;
  try {
    raw = await readTextLimited(request);
  } catch {
    return new Response("Too large", { status: 413 });
  }
  let event;
  try {
    event = stripe().webhooks.constructEvent(
      raw,
      request.headers.get("stripe-signature") || "",
      required("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    const db = adminClient();
    const existing = checked(
      await db
        .from("webhook_events")
        .select("status")
        .eq("id", `stripe:${event.id}`)
        .maybeSingle(),
    );
    if (existing?.status === "processed")
      return Response.json({ received: true });
    const object = event.data.object as { customer?: string | { id: string } };
    const customer =
      typeof object.customer === "string"
        ? object.customer
        : object.customer?.id;
    checked(
      await db.from("webhook_events").upsert(
        {
          id: `stripe:${event.id}`,
          provider: "stripe",
          payload: { type: event.type, customer },
          status: "pending",
        },
        { onConflict: "id", ignoreDuplicates: true },
      ),
    );
    if (
      customer &&
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.paid",
        "invoice.payment_failed",
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
      ].includes(event.type)
    )
      await reconcileCustomer(customer);
    checked(
      await db
        .from("webhook_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", `stripe:${event.id}`),
    );
    return Response.json({ received: true });
  } catch (error) {
    Sentry.captureException(error);
    return new Response("Retry delivery", { status: 500 });
  }
}
