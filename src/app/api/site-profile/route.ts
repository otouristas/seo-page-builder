import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { fetchPublicPage, normalizePublicUrl } from "@/lib/seo/safe-fetch";
import { parseSiteProfile, nameFromHostname } from "@/lib/seo/site-profile";
import { rateLimit } from "@/lib/server/rate-limit";
import { AppError } from "@/lib/server/errors";
export const maxDuration = 30;
/**
 * Read a website's own public metadata so setting up a project does not mean
 * retyping what the website already says. Everything returned stays editable.
 */
export const POST = api(async (request) => {
  const { workspace } = await requireWorkspace();
  const { url } = await readJson(
    request,
    z.object({ url: z.string().min(4).max(2048) }),
  );
  const target = normalizePublicUrl(url);
  await rateLimit(`site-profile:${workspace.id}`, 40, 3600);
  try {
    const response = await fetchPublicPage(target.href);
    if (response.status >= 400)
      throw new AppError(
        `The website answered with HTTP ${response.status}. Check the address, or fill the details in yourself.`,
        422,
        "site_unavailable",
      );
    return NextResponse.json({
      profile: parseSiteProfile(response.text, target.href, response.url),
    });
  } catch (error) {
    /* A website we cannot read is never a reason to block project setup. */
    if (error instanceof AppError && error.status < 500)
      return NextResponse.json({
        profile: null,
        reason: error.message,
        fallback: {
          url: target.href,
          name: nameFromHostname(target.hostname),
        },
      });
    throw error;
  }
});
