import "server-only";
import {
  createClient,
  adminClient,
  databaseConfigured,
} from "../supabase/server";
import { AppError } from "./errors";
import { checked } from "./http";
import { billingAccess } from "../billing-access";
import type { Project } from "../types";
export async function requireUser() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    throw new AppError(
      "Sign in to access your workspace.",
      401,
      "unauthorized",
    );
  return user;
}
export async function requireWorkspace() {
  const user = await requireUser();
  if (!databaseConfigured())
    throw new AppError(
      "Your account is ready. The workspace database is still being configured.",
      503,
      "setup_required",
    );
  const db = adminClient();
  let w = checked(
    await db
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle(),
  );
  if (!w) {
    const r = await db
      .from("workspaces")
      .upsert(
        {
          owner_id: user.id,
          name: "My workspace",
          owner_email: user.email || "",
        },
        { onConflict: "owner_id" },
      )
      .select("*")
      .single();
    w = checked(r);
  }
  return {
    user,
    workspace: w as {
      id: string;
      owner_id: string;
      owner_email: string;
      name: string;
    },
    db,
  };
}
export async function requireProject(id: string) {
  const ctx = await requireWorkspace();
  const project = checked(
    await ctx.db
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", ctx.workspace.id)
      .maybeSingle(),
  ) as Project | null;
  if (!project) throw new AppError("Project not found.", 404);
  return { ...ctx, project };
}
export async function entitlements(workspaceId: string) {
  const db = adminClient();
  const s = checked(
    await db
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  );
  return {
    ...billingAccess(s),
    subscription: s,
  };
}

export async function requireWriteAccess(workspaceId: string) {
  const access = await entitlements(workspaceId);
  if (access.subscription?.stripe_subscription && access.plan === "free")
    throw new AppError(
      "Your paid access has ended or needs a payment update. Existing results are available in read-only mode.",
      402,
      "read_only",
    );
  return access;
}
