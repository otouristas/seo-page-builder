import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { freeAudit } from "@/lib/server/free-audit";
import { rateLimit, requestIdentity } from "@/lib/server/rate-limit";
import { normalizePublicUrl } from "@/lib/seo/safe-fetch";
import { hashToken } from "@/lib/server/crypto";
export const maxDuration = 60;
export const POST = api(async (request) => {
  const { url, honey } = await readJson(
    request,
    z.object({
      url: z.string().min(4).max(2048),
      honey: z.string().max(100).optional(),
    }),
  );
  if (honey)
    return NextResponse.json(
      { error: "Unable to process that request." },
      { status: 400 },
    );
  const target = normalizePublicUrl(url);
  await rateLimit(`audit:ip:${requestIdentity(request)}`, 10, 3600);
  await rateLimit(`audit:host:${hashToken(target.hostname)}`, 10, 86400);
  await rateLimit("audit:global", 500, 86400);
  return NextResponse.json(await freeAudit(target.href));
});
