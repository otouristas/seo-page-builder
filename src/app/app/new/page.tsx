import { Onboarding } from "@/components/auth";
import { ProjectLimit } from "@/components/project-limit";
import { SetupState } from "@/components/setup-state";
import { requireWorkspace, entitlements } from "@/lib/server/auth";
import { checked } from "@/lib/server/http";
import type { Project } from "@/lib/types";
export default async function NewProject({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  let projects: Pick<Project, "id" | "name" | "url" | "logo">[] = [];
  let access;
  try {
    const { db, workspace } = await requireWorkspace();
    projects =
      checked(
        await db
          .from("projects")
          .select("id,name,url,logo")
          .eq("workspace_id", workspace.id)
          .order("created_at"),
      ) || [];
    access = await entitlements(workspace.id);
  } catch {
    return <SetupState />;
  }
  /* The allowance is explained before the form, never after a filled-in form. */
  if (projects.length >= access.limits.projects)
    return (
      <ProjectLimit
        projects={projects}
        plan={access.plan}
        phase={access.phase}
        limit={access.limits.projects}
      />
    );
  return <Onboarding website={p.website} plan={p.plan} gsc={p.gsc} />;
}
