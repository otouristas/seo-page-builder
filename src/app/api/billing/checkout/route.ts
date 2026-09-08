import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { checkout } from "@/lib/integrations/stripe";
export const POST = api(async (request) => {
  const { workspace } = await requireWorkspace();
  const { plan, offer } = await readJson(
    request,
    z.object({
      plan: z.enum(["maki", "nigiri", "omakase"]),
      offer: z.enum(["trial", "monthly"]).default("trial"),
    }),
  );
  return NextResponse.json(await checkout(workspace, plan, offer));
});
