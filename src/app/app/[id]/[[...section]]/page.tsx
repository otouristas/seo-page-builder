import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace/shell";
import { projectData } from "@/lib/server/project-data";
import { NAV, type AppSection } from "@/lib/plans";
import { SetupState } from "@/components/setup-state";
import { AppError } from "@/lib/server/errors";
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; section?: string[] }>;
}) {
  const { id, section } = await params;
  const view = section?.[0] || "serp-studio";
  if ((section?.length || 0) > 1 || !NAV.some((n) => n.id === view)) notFound();
  let data;
  try {
    data = await projectData(id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    return <SetupState />;
  }
  return (
    <Suspense fallback={<div className="skeleton" />}>
      <Workspace key={id} initial={data} section={view as AppSection} />
    </Suspense>
  );
}
