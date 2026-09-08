import { NextResponse } from "next/server";
import { z } from "zod";
import { api, readJson } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { changeSubscription } from "@/lib/integrations/stripe";
export const POST = api(async (request) => {
  const { workspace } = await requireWorkspace();
  const { action, plan } = await readJson(
    request,
    z.object({
      action: z.enum(["change", "cancel", "resume"]),
      plan: z.enum(["maki", "nigiri", "omakase"]).optional(),
    }),
  );
  return NextResponse.json(
    await changeSubscription(workspace.id, action, plan),
  );
});
