"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Search, BookOpen } from "lucide-react";
import { Badge, Button } from "../ui";
import { download, ExternalLink } from "./shared";
import {
  RESEARCH_MODES,
  RESEARCH_LOCATIONS,
  type ResearchMode,
  type ResearchResult,
} from "@/lib/research";
import { displayDate, toCsv } from "@/lib/utils";
import type { WorkspaceContext } from "./shell";
export function ResearchPanel({ ctx }: { ctx: WorkspaceContext }) {
  const [query, setQuery] = useState(""),
    [mode, setMode] = useState<ResearchMode>("serp"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { data } = ctx;
  const jobs = data.jobs.filter((j) => j.kind === "serp");
  const latest = jobs.find(
    (j) =>
      j.status === "completed" &&
      j.output &&
      (j.output.mode ?? "serp") === mode,
  );
  const result = latest?.output as ResearchResult | undefined;
  const pending = jobs.find((j) => ["queued", "running"].includes(j.status));
  const remaining = Math.max(
    0,
    data.limits.serps -
      (data.usage.find((u) => u.kind === "serps")?.amount ?? 0),
  );
  const configured = data.connections.providers.serp;
  const supported = !!RESEARCH_LOCATIONS[data.project.country];
  return (
    <section className="panel research-panel" id="market-research">
      <div className="panel-header">
        <div>
          <h2>A little market perspective.</h2>
          <p>
            DataForSEO research, kept separate from your own Search Console
            data.
          </p>
        </div>
        <Badge tone={configured ? "green" : "neutral"}>
          {data.sample
            ? "Demo · no paid requests"
            : configured
              ? "Account configured"
              : "Setup required"}
        </Badge>
      </div>
      <div className="panel-body">
        <div className="research-mode" role="group" aria-label="Research type">
          {RESEARCH_MODES.map((m) => (
            <button
              key={m.id}
              aria-pressed={mode === m.id}
              onClick={() => {
                setMode(m.id);
                setError("");
              }}
            >
              <strong>{m.label}</strong>
              <small>{m.description}</small>
            </button>
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (data.sample) {
                ctx.notify(
                  "Research examples do not call DataForSEO. Create a real project to run a lookup.",
                );
                return;
              }
              await ctx.run({ kind: "serp", mode, query });
              setQuery("");
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="research-query">
            <div className="field">
              <label htmlFor="research-query">
                {mode === "keywords" ? "Keyword phrase" : "Google search query"}
              </label>
              <input
                id="research-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                minLength={2}
                maxLength={mode === "keywords" ? 80 : 200}
                required
                placeholder="e.g. extra virgin olive oil"
              />
            </div>
            <Button
              busy={busy}
              disabled={
                !data.sample && (!configured || !supported || !remaining)
              }
            >
              <Search size={15} />
              Run research · 1 lookup
            </Button>
          </div>
          <p className="small-note">
            {data.project.country} · {data.project.language} ·{" "}
            {mode === "serp"
              ? "Desktop Google results"
              : "Keyword database estimates"}{" "}
            · {remaining} lookups left. Each mode runs one bounded request.
          </p>
          {!supported && (
            <p className="form-error">
              Research currently supports US, GB, GR, CA, AU, DE, FR, ES, IT,
              NL, IN, and BR.
            </p>
          )}
          {!configured && !data.sample && (
            <p className="small-note">
              The platform’s DataForSEO connection needs setup.{" "}
              <Link href="/help/dataforseo-research">
                Understand this connection.
              </Link>
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
        {pending && (
          <p className="notice" role="status">
            {pending.stage}. You can leave this page; the job will continue.
          </p>
        )}
        {result ? (
          <ResearchEvidence result={result} createdAt={latest!.created_at} />
        ) : (
          <div className="research-empty">
            <BookOpen size={22} aria-hidden="true" />
            <div>
              <h3>
                {data.sample
                  ? "Real research starts with your website."
                  : "Your next lookup will appear here."}
              </h3>
              <p>
                {data.sample
                  ? "This demo makes no paid provider calls. The live workspace saves returned evidence, dates, and coverage with each job."
                  : "No estimates to guess at. No invented competitors. Choose a query and inspect what the provider returns."}
              </p>
            </div>
          </div>
        )}
        <Link
          href="/learn/search-intent-content-map"
          className="knowledge-link"
        >
          Turn research into a content map <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
function ResearchEvidence({
  result: r,
  createdAt,
}: {
  result: ResearchResult;
  createdAt: string;
}) {
  const metrics = r.metrics;
  const metric = (value: number | null | undefined) =>
    value === null || value === undefined
      ? "Unavailable"
      : value.toLocaleString("en-US");
  const exportRows = () => {
    const common = {
      query: r.keyword,
      country: r.country,
      language: r.language,
      source: r.source,
      observedAt: r.observedAt ?? createdAt,
      evidence: r.status ?? "measured",
    };
    const rows =
      r.mode === "keywords"
        ? [
            {
              ...common,
              ...metrics,
              monthlySearches: JSON.stringify(metrics?.monthlySearches ?? []),
            },
          ]
        : (r.results ?? []).map((v) => ({ ...common, ...v }));
    download("ranksushi-research.csv", toCsv(rows), "text/csv");
  };
  return (
    <div className="research-evidence">
      <div className="research-evidence-heading">
        <div>
          <h3>{r.keyword}</h3>
          <p>
            {r.source} · {displayDate(r.observedAt ?? createdAt)}
          </p>
        </div>
        <Button variant="secondary" onClick={exportRows}>
          <Download size={14} />
          Export CSV
        </Button>
      </div>
      <div className="research-provenance">
        <Badge tone={r.mode === "keywords" ? "orange" : "green"}>
          {r.mode === "keywords" ? "Provider estimates" : "Observed results"}
        </Badge>
        <span>
          {r.country} · {r.language} · {r.device ?? "desktop"}
        </span>
        {metrics?.updatedAt && (
          <span>Metric data updated: {metrics.updatedAt}</span>
        )}
      </div>
      {r.mode === "keywords" && metrics ? (
        <>
          <div className="research-metrics">
            {[
              ["Monthly searches", metric(metrics.searchVolume)],
              [
                "CPC · USD",
                metrics.cpc === null
                  ? "Unavailable"
                  : `$${metrics.cpc.toFixed(2)}`,
              ],
              [
                "Advertiser competition",
                metrics.paidCompetitionLevel ?? "Unavailable",
              ],
              [
                "Organic difficulty estimate",
                metrics.keywordDifficulty === null
                  ? "Unavailable"
                  : `${metric(metrics.keywordDifficulty)} / 100`,
              ],
              ["Inferred search intent", metrics.intent ?? "Unavailable"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {!r.available && (
            <p className="notice">
              The provider has no keyword record for this phrase and market.
              Missing values are not zero.
            </p>
          )}
          {metrics.monthlySearches.length > 0 && (
            <details>
              <summary>Monthly search-demand estimates</summary>
              <div
                className="table-scroll"
                role="region"
                tabIndex={0}
                aria-label="Monthly keyword demand table"
              >
                <table>
                  <caption className="sr-only">
                    Provider monthly demand history
                  </caption>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Estimated searches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.monthlySearches.map((m, i) => (
                      <tr key={`${m.year}-${m.month}-${i}`}>
                        <td>
                          {m.year}-{String(m.month).padStart(2, "0")}
                        </td>
                        <td>{metric(m.searchVolume)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      ) : (
        <>
          <ol className="research-results">
            {(r.results ?? []).map((v, i) => (
              <li key={`${v.url}-${i}`}>
                <span className="research-rank">{v.rank_group ?? "—"}</span>
                <div>
                  <ExternalLink href={v.url}>{v.title}</ExternalLink>
                  <span className="research-url">{v.url}</span>
                  <p>{v.description}</p>
                </div>
              </li>
            ))}
          </ol>
          {!r.results?.length && (
            <p className="notice">
              No organic listings were returned in this response. This does not
              establish that no results exist.
            </p>
          )}
          {!!r.questions?.length && (
            <div className="research-questions">
              <h4>Questions returned with this result</h4>
              <ul>
                {r.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {!!r.features?.length && (
            <p className="small-note">
              Other returned result types:{" "}
              {r.features.map((f) => f.replaceAll("_", " ")).join(", ")}.
            </p>
          )}
        </>
      )}
      <p className="small-note research-coverage">
        {r.coverage ??
          "One Google organic results snapshot. Results can vary by time, device, and location."}
      </p>
    </div>
  );
}
