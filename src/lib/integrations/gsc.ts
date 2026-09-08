import "server-only";
import { adminClient } from "../supabase/server";
import {
  decrypt,
  encrypt,
  hashToken as hash,
  randomToken,
} from "../server/crypto";
import { AppError, required } from "../server/errors";
import { checked } from "../server/http";
import { providerJson } from "./http";
import { SITE_URL } from "../utils";
import type { Project } from "../types";
const redirectUri = () => `${SITE_URL}/api/gsc/callback`;
type Credentials = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};
export async function gscAuthorization(project: Project, userId: string) {
  const state = randomToken(),
    verifier = randomToken();
  const db = adminClient();
  checked(
    await db.from("oauth_states").insert({
      hash: hash(state),
      workspace_id: project.workspace_id,
      project_id: project.id,
      user_id: userId,
      verifier: encrypt(verifier),
      expires_at: new Date(Date.now() + 600000).toISOString(),
    }),
  );
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: required("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
    code_challenge: Buffer.from(hash(verifier), "hex").toString("base64url"),
    code_challenge_method: "S256",
  }).toString();
  return { url: url.href, state };
}
export async function finishGsc(code: string, state: string, userId: string) {
  const db = adminClient();
  const row = checked(
    await db
      .from("oauth_states")
      .delete()
      .eq("hash", hash(state))
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .select("*")
      .maybeSingle(),
  );
  if (!row)
    throw new AppError(
      "This authorization link expired or was already used. Connect again.",
      400,
    );
  const tokens = await providerJson<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      code_verifier: decrypt<string>(row.verifier),
    }),
  });
  if (!tokens.refresh_token)
    throw new AppError(
      "Google did not grant offline access. Reconnect and grant access to Search Console.",
      409,
    );
  checked(
    await db.from("integrations").upsert(
      {
        workspace_id: row.workspace_id,
        project_id: row.project_id,
        provider: "gsc",
        credentials: encrypt(
          JSON.stringify({
            ...tokens,
            expires_at: Date.now() + tokens.expires_in * 1000,
          }),
        ),
        status: "connected",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id,provider" },
    ),
  );
  return row.project_id as string;
}
export async function gscToken(project: Project) {
  const db = adminClient();
  const integration = checked(
    await db
      .from("integrations")
      .select("*")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .eq("provider", "gsc")
      .maybeSingle(),
  );
  if (!integration || integration.status !== "connected")
    throw new AppError(
      "Reconnect Google Search Console in Settings.",
      409,
      "gsc_disconnected",
    );
  const creds = JSON.parse(
    decrypt<string>(integration.credentials),
  ) as Credentials;
  if (creds.expires_at > Date.now() + 120000) return creds.access_token;
  try {
    const t = await providerJson<{
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    }>("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: required("GOOGLE_CLIENT_ID"),
        client_secret: required("GOOGLE_CLIENT_SECRET"),
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const updated = {
      ...creds,
      ...t,
      refresh_token: t.refresh_token || creds.refresh_token,
      expires_at: Date.now() + t.expires_in * 1000,
    };
    checked(
      await db
        .from("integrations")
        .update({
          credentials: encrypt(JSON.stringify(updated)),
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id)
        .eq("status", "connected"),
    );
    return updated.access_token;
  } catch (e) {
    if (e instanceof AppError && e.code === "provider_auth") {
      await db
        .from("integrations")
        .update({ status: "revoked" })
        .eq("id", integration.id);
      throw new AppError(
        "Google access was revoked. Reconnect in Settings.",
        409,
        "gsc_revoked",
      );
    }
    throw e;
  }
}
export async function listProperties(project: Project) {
  const token = await gscToken(project);
  const r = await providerJson<{
    siteEntry?: { siteUrl: string; permissionLevel: string }[];
  }>("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (r.siteEntry || []).filter(
    (s) => s.permissionLevel !== "siteUnverifiedUser",
  );
}
export function propertyMatchesWebsite(property: string, website: string) {
  const site = new URL(website);
  if (property.startsWith("sc-domain:")) {
    const host = property.slice(10).toLowerCase();
    return site.hostname === host || site.hostname.endsWith(`.${host}`);
  }
  try {
    const p = new URL(property);
    return p.origin === site.origin && site.pathname.startsWith(p.pathname);
  } catch {
    return false;
  }
}
export async function disconnectGsc(project: Project) {
  const db = adminClient();
  const row = checked(
    await db
      .from("integrations")
      .select("credentials")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .eq("provider", "gsc")
      .maybeSingle(),
  );
  if (row) {
    const c = JSON.parse(decrypt<string>(row.credentials)) as Credentials;
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        body: new URLSearchParams({ token: c.refresh_token }),
        signal: AbortSignal.timeout(10000),
      });
    } catch {}
    checked(
      await db
        .from("integrations")
        .delete()
        .eq("project_id", project.id)
        .eq("workspace_id", project.workspace_id)
        .eq("provider", "gsc"),
    );
  }
  checked(
    await db
      .from("projects")
      .update({ gsc_property: null })
      .eq("id", project.id)
      .eq("workspace_id", project.workspace_id),
  );
}
export function completeDate(now = new Date()) {
  const pacific = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const d = new Date(`${pacific}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 3);
  return d.toISOString().slice(0, 10);
}
export function dateWindow(days: number, end = completeDate()) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(`${end}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}
type GRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  position: number;
};
export async function importGscDay(project: Project, date: string) {
  if (!project.gsc_property)
    throw new AppError("Choose a Search Console property first.", 409);
  const token = await gscToken(project);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(project.gsc_property)}/searchAnalytics/query`;
  const query = (dimensions: string[], startRow = 0) =>
    providerJson<{ rows?: GRow[]; responseAggregationType?: string }>(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: date,
        endDate: date,
        dimensions,
        type: "web",
        dataState: "final",
        rowLimit: 25000,
        startRow,
        aggregationType: dimensions.length ? "byPage" : "byProperty",
      }),
    });
  const totals = await query([]);
  const details: GRow[] = [];
  let capped = false;
  for (let page = 0; page < 2; page++) {
    const r = await query(["query", "page", "country", "device"], page * 25000);
    details.push(...(r.rows || []));
    if ((r.rows?.length || 0) < 25000) break;
    if (page === 1) capped = true;
  }
  const rows = [
    ...(totals.rows || []).map((r) => ({
      dataset: "totals",
      dimension_key: "total",
      query: "",
      page: "",
      country: "",
      device: "",
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position,
    })),
    ...details.map((r) => {
      const [q = "", page = "", country = "", device = ""] = r.keys || [];
      return {
        dataset: "detail",
        dimension_key: hash(JSON.stringify([q, page, country, device])),
        query: q,
        page,
        country,
        device,
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      };
    }),
  ];
  checked(
    await adminClient().rpc("replace_gsc_day", {
      p_project: project.id,
      p_workspace: project.workspace_id,
      p_property: project.gsc_property,
      p_date: date,
      p_rows: rows,
    }),
  );
  return {
    date,
    rows: details.length,
    capped,
    note: "Detailed API rows are a limited sample; totals are stored separately.",
  };
}

export async function saveGscOpportunities(project: Project) {
  if (!project.gsc_property) return 0;
  const db = adminClient();
  const dates = dateWindow(28);
  const rows = checked(
    await db.rpc("gsc_opportunity_signals", {
      p_project: project.id,
      p_workspace: project.workspace_id,
      p_property: project.gsc_property,
      p_since: dates[0],
    }),
  ) as {
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    position: number;
  }[];
  let added = 0;
  for (const r of rows || []) {
    if (!propertyMatchesWebsite(project.gsc_property, r.page)) continue;
    const key = `gsc-query:${hash(r.query).slice(0, 24)}`;
    const detail = `“${r.query}” produced ${Math.round(r.impressions)} observed detailed-row impressions and ${Math.round(r.clicks)} clicks during ${dates[0]}–${dates.at(-1)}. Review whether this page answers that intent clearly. These are limited detailed API rows, not an exhaustive query total or a forecast.`;
    checked(
      await db.from("opportunities").upsert(
        {
          workspace_id: project.workspace_id,
          project_id: project.id,
          finding_key: key,
          title: `Review the page answering “${r.query}”`,
          detail,
          page_url: r.page,
          effort: "medium",
          evidence: {
            source: "Google Search Console detailed API rows",
            observedAt: new Date().toISOString(),
            market: project.country,
            status: "measured",
            url: r.page,
            detail,
            severity: "low",
            demand: r.impressions,
            query: r.query,
          },
        },
        { onConflict: "project_id,finding_key,page_url" },
      ),
    );
    added++;
  }
  return added;
}
