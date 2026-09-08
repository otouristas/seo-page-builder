import { readTextLimited } from "@/lib/server/body";
import { Resend } from "resend";
import { required } from "@/lib/server/errors";
import { adminClient } from "@/lib/supabase/server";
import { checked } from "@/lib/server/http";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 1000000)
    return new Response("Too large", { status: 413 });
  let body: string;
  try {
    body = await readTextLimited(request);
  } catch {
    return new Response("Too large", { status: 413 });
  }
  let event;
  try {
    event = new Resend(required("RESEND_API_KEY")).webhooks.verify({
      payload: body,
      headers: {
        id: request.headers.get("svix-id") || "",
        timestamp: request.headers.get("svix-timestamp") || "",
        signature: request.headers.get("svix-signature") || "",
      },
      webhookSecret: required("RESEND_WEBHOOK_SECRET"),
    });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }
  try {
    const db = adminClient();
    const id = `resend:${request.headers.get("svix-id")}`;
    const existing = checked(
      await db
        .from("webhook_events")
        .select("id")
        .eq("id", id)
        .eq("status", "processed")
        .maybeSingle(),
    );
    if (existing) return Response.json({ received: true });
    const data = event.data as { email_id?: string; to?: string[] };
    if (data.email_id)
      checked(
        await db
          .from("email_events")
          .update({ status: event.type })
          .eq("provider_id", data.email_id),
      );
    if (
      ["email.bounced", "email.complained", "email.suppressed"].includes(
        event.type,
      )
    )
      for (const email of data.to || [])
        checked(
          await db
            .from("email_suppressions")
            .upsert(
              { email: email.toLowerCase(), reason: event.type },
              { onConflict: "email" },
            ),
        );
    checked(
      await db.from("webhook_events").upsert(
        {
          id,
          provider: "resend",
          status: "processed",
          payload: { type: event.type },
          processed_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      ),
    );
    return Response.json({ received: true });
  } catch {
    return new Response("Retry delivery", { status: 500 });
  }
}
