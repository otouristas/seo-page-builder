import "server-only";
import { adminClient } from "../supabase/server";
import { fetchPublicPage } from "../seo/safe-fetch";
import { parseSnapshot, actionableFindings } from "../seo/audit";
import { checked } from "./http";
import { randomToken, hashToken } from "./crypto";
import type { Project, PageSnapshot } from "../types";
export async function freeAudit(url: string) {
  const response = await fetchPublicPage(url);
  const snapshot = parseSnapshot(response.text, url, {
    finalUrl: response.url,
    status: response.status,
    robotsHeader: response.headers["x-robots-tag"],
    truncated: response.truncated,
  });
  const token = randomToken();
  checked(
    await adminClient()
      .from("free_audits")
      .insert({
        hash: hashToken(token),
        snapshot,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      }),
  );
  return { snapshot, token };
}
export async function adoptFreeAudit(project: Project, token: string) {
  const db = adminClient();
  const result = checked(
    await db.rpc("adopt_free_audit", {
      p_hash: hashToken(token),
      p_workspace: project.workspace_id,
      p_project: project.id,
    }),
  );
  if (!result) return;
  const s = result as PageSnapshot;
  for (const f of actionableFindings(s))
    checked(
      await db.from("opportunities").upsert(
        {
          workspace_id: project.workspace_id,
          project_id: project.id,
          finding_key: f.id,
          title: f.title,
          detail: `${f.detail} ${f.recommendation}`,
          page_url: s.finalUrl,
          effort: f.effort,
          evidence: { ...f.evidence, severity: f.severity },
        },
        { onConflict: "project_id,finding_key,page_url" },
      ),
    );
}
