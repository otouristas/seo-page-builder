import { readTextLimited } from "@/lib/server/body";
import { verifyHmac, hashToken } from "@/lib/server/crypto";
import { required } from "@/lib/server/errors";
import { adminClient } from "@/lib/supabase/server";
import { checked } from "@/lib/server/http";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 2000000)
    return new Response("Too large", { status: 413 });
  let body: string;
  try {
    body = await readTextLimited(request);
  } catch {
    return new Response("Too large", { status: 413 });
  }
  if (
    !verifyHmac(
      body,
      request.headers.get("x-firecrawl-signature"),
      required("FIRECRAWL_WEBHOOK_SECRET"),
    )
  )
    return new Response("Invalid signature", { status: 401 });
  try {
    const payload = JSON.parse(body) as { id?: string; type?: string };
    if (!payload.id) return new Response("Missing crawl id", { status: 400 });
    const db = adminClient();
    const job = checked(
      await db
        .from("jobs")
        .select("id")
        .eq("provider_id", payload.id)
        .maybeSingle(),
    );
    if (job)
      checked(
        await db.from("webhook_events").upsert(
          {
            id: `firecrawl:${hashToken(body)}`,
            provider: "firecrawl",
            payload: { jobId: job.id, type: payload.type },
            status: "processed",
            processed_at: new Date().toISOString(),
          },
          { onConflict: "id", ignoreDuplicates: true },
        ),
      );
    return Response.json({ received: true });
  } catch {
    return new Response("Retry delivery", { status: 500 });
  }
}
