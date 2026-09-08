import { notFound } from "next/navigation";
import Link from "next/link";
import { adminClient, databaseConfigured } from "@/lib/supabase/server";
import { hashToken } from "@/lib/server/crypto";
import { Logo } from "@/components/maki";
import { Badge } from "@/components/ui";
import type { ReportPayload } from "@/lib/server/reports";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Shared report",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
  alternates: { canonical: "/share" },
};
export default async function SharedReport({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!databaseConfigured()) notFound();
  const { token } = await params;
  if (!/^[a-zA-Z0-9_-]{43}$/.test(token)) notFound();
  const { data: row, error } = await adminClient()
    .from("reports")
    .select("title,payload,created_at")
    .eq("share_hash", hashToken(token))
    .gt("share_expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !row) notFound();
  const payload = row.payload as ReportPayload;
  return (
    <main id="main" className="report-body">
      <Link href="/">
        <Logo />
      </Link>
      <div style={{ marginTop: 35 }}>
        <Badge tone="green">SHARED REPORT</Badge>
      </div>
      <h1>{row.title}</h1>
      <p>
        {payload.project.url} · Prepared{" "}
        {new Date(row.created_at).toLocaleDateString("en-US")}
      </p>
      <h2>Observed performance</h2>
      {payload.performance ? (
        <p>
          {payload.performance.current.clicks} clicks and{" "}
          {payload.performance.current.impressions} impressions across{" "}
          {payload.performance.current.days} reporting days. Previous period:{" "}
          {payload.performance.previous.clicks} clicks.
        </p>
      ) : (
        <p>
          Search Console data was not available when this report was created.
        </p>
      )}
      <h2>Findings and completed work</h2>
      {payload.opportunities.map((o, i) => (
        <article className="finding-item" style={{ marginBottom: 15 }} key={i}>
          <h3>
            {o.title}
            <Badge>{o.status}</Badge>
          </h3>
          <p>{o.detail}</p>
          <div className="finding-evidence">{o.page_url}</div>
        </article>
      ))}
      {!payload.opportunities.length && (
        <p>No opportunities were saved when this report was created.</p>
      )}
      <h2>How to read this report</h2>
      <p>{payload.methodology}</p>
      <p className="small-note" style={{ marginTop: 25 }}>
        This link expires automatically and can be revoked by its owner. Report
        content is a snapshot of the evidence at creation time.
      </p>
    </main>
  );
}
