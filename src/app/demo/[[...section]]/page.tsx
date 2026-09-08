import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace/shell";
import { DEMO_DATA } from "@/lib/demo";
import { NAV, type AppSection } from "@/lib/plans";
export const metadata = {
  title: "SERP Studio walkthrough",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo" },
};
export default async function Demo({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const id = section?.[0] || "serp-studio";
  if ((section?.length || 0) > 1 || !NAV.some((n) => n.id === id)) notFound();
  return (
    <Suspense fallback={<div className="skeleton" />}>
      <Workspace initial={DEMO_DATA} section={id as AppSection} />
    </Suspense>
  );
}
