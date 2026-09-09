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
        .select("id")
        .eq("workspace_id", workspace.id)
        .order("created_at")
        .limit(1),
    );
    target = projects?.[0]
      ? `/app/${projects[0].id}${params.settings || params.billing || params.gsc ? "/settings" : ""}${params.billing ? "?billing=processing" : params.gsc ? "?gsc=reconnect" : params.settings ? "?tab=billing" : ""}`
      : "/app/new?gsc=start";
  } catch {
    return <SetupState />;
  }
  redirect(target);
}
