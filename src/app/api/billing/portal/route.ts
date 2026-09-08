import { NextResponse } from "next/server";
import { api } from "@/lib/server/http";
import { requireWorkspace } from "@/lib/server/auth";
import { billingPortal } from "@/lib/integrations/stripe";
export const POST = api(async () => {
  const { workspace } = await requireWorkspace();
  return NextResponse.json(await billingPortal(workspace.id));
});
