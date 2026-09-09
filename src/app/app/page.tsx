import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/server/auth";
import { checked } from "@/lib/server/http";
import { SetupState } from "@/components/setup-state";
export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  let target = "";
  try {
    const { db, workspace } = await requireWorkspace();
    const projects = checked(
      await db
        .from("projects")
        .select("id,gsc_property")
        .eq("workspace_id", workspace.id)
        .order("created_at")
        .limit(1),
    );
    const firstProject = projects?.[0];
    const needsSearchConsoleOnboarding =
      Boolean(firstProject && !firstProject.gsc_property) &&
      !params.gsc &&
      !params.settings &&
      !params.billing;
    target = firstProject
      ? `/app/${firstProject.id}${params.settings || params.billing || params.gsc || params.onboarding || needsSearchConsoleOnboarding ? "/settings" : ""}${params.billing ? "?billing=processing" : params.gsc ? "?gsc=reconnect" : params.onboarding || needsSearchConsoleOnboarding ? "?gsc=onboarding" : params.settings ? "?tab=billing" : ""}`
      : "/app/new?gsc=start";
  } catch {
    return <SetupState />;
  }
  redirect(target);
}
