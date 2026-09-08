import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing";
import { SectionLabel } from "@/components/ui";
import { FreeAuditTool, MetadataTool, SchemaTool } from "@/components/tools";
import { TOOL_PAGES } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
export function generateStaticParams() {
  return Object.keys(TOOL_PAGES).map((tool) => ({ tool }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const p = TOOL_PAGES[tool as keyof typeof TOOL_PAGES];
  return p ? pageMetadata(p.title, p.description, `/tools/${tool}`) : {};
}
export default async function Tool({
  params,
  searchParams,
}: {
  params: Promise<{ tool: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { tool } = await params;
  const p = TOOL_PAGES[tool as keyof typeof TOOL_PAGES];
  if (!p) notFound();
  const q = await searchParams;
  return (
    <>
      <SiteHeader />
      <main id="main" className="container tools-page">
        <header className="public-heading">
          <SectionLabel>{p.kicker}</SectionLabel>
          <h1>{p.title}</h1>
          <p>{p.lead}</p>
        </header>
        {tool === "seo-audit" ? (
          <FreeAuditTool initialUrl={q.url} />
        ) : tool === "metadata-preview" ? (
          <MetadataTool />
        ) : (
          <SchemaTool />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
