import { Resend } from "resend";
import { required } from "../server/errors";
import { adminClient } from "../supabase/server";
import { escapeHtml, SITE_URL } from "../utils";
import { checked } from "../server/http";
export async function sendEmail(
  workspaceId: string,
  to: string,
  key: string,
  subject: string,
  body: string,
) {
  const db = adminClient();
  const suppressed = checked(
    await db
      .from("email_suppressions")
      .select("email")
      .eq("email", to.toLowerCase())
      .maybeSingle(),
  );
  if (suppressed) return { suppressed: true };
  const previous = checked(
    await db.from("email_events").select("*").eq("key", key).maybeSingle(),
  );
  if (previous?.provider_id) return { duplicate: true };
  const resend = new Resend(required("RESEND_API_KEY"));
  const r = await resend.emails.send(
    {
      from: required("RESEND_FROM"),
      to,
      subject,
      html: `<div style="font-family:Arial,sans-serif;background:#f7f7ef;padding:32px;color:#263d31"><h1 style="font-size:25px">ranksushi.</h1><h2>${escapeHtml(subject)}</h2><p style="line-height:1.8">${escapeHtml(body)}</p><p><a href="${SITE_URL}/app">Open your workspace</a></p><p style="font-size:12px">Manage digest preferences in your project settings.</p></div>`,
    },
    { idempotencyKey: key },
  );
  if (r.error) throw new Error("Email delivery failed");
  checked(
    await db.from("email_events").upsert({
      key,
      workspace_id: workspaceId,
      recipient: to,
      provider_id: r.data?.id,
      status: "sent",
    }),
  );
  return { sent: true };
}
