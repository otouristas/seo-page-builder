"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Eye,
  Focus,
  Globe2,
  History,
  Link2,
  Monitor,
  MousePointer2,
  RefreshCw,
  Search,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import { Maki } from "../maki";
import { FixKit } from "../fix-kit";
import { SiteIcon } from "../site-icon";
import { Button } from "../ui";
import { download } from "./shared";
import type { WorkspaceContext } from "./shell";
import type { ResearchResult } from "@/lib/research";
import { RESEARCH_LOCATIONS } from "@/lib/research";
import type { PageSnapshot } from "@/lib/types";
import { RECORDED_SCENE } from "@/lib/studio/recorded";
import {
  hostName,
  locatePage,
  observedEdits,
  pageIdentity,
  proposeMoves,
  queryTerms,
  sameSearch,
  sceneExport,
  termCoverage,
  serpOverview,
  verifyEdits,
  type StudioEdits,
  type StudioField,
} from "@/lib/studio/scene";

const fields: Record<StudioField, string> = {
  title: "Search title",
  description: "Meta description",
  h1: "Main page heading",
  answer: "Answer draft",
};
const stamp = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
export function MarkedText({ text, query }: { text: string; query: string }) {
  const terms = new Set(queryTerms(query));
  return (
    <>
      {text
        .split(/([\p{L}\p{N}]+)/u)
        .map((part, i) =>
          terms.has(part.normalize("NFKC").toLocaleLowerCase()) ? (
            <mark key={i}>{part}</mark>
          ) : (
            part
          ),
        )}
    </>
  );
}
export function SerpStudio(ctx: WorkspaceContext) {
  const { data } = ctx;
  const params = useSearchParams();
  const jobs = data.jobs.filter(
    (j) => j.kind === "serp" && j.input.mode !== "keywords",
  );
  const captures: ResearchResult[] = data.sample
    ? RECORDED_SCENE.serps
    : jobs
        .filter(
          (j) =>
            j.status === "completed" &&
            j.output &&
            Array.isArray(j.output.results),
        )
        .map(
          (j) =>
            ({
              ...j.output,
              mode: "serp",
              device: "desktop",
              observedAt: j.output!.observedAt || j.created_at,
              source: j.output!.source || "DataForSEO Google organic live",
            }) as ResearchResult,
        );
  const firstQuery = data.sample
    ? RECORDED_SCENE.serps[0].keyword
    : params.get("query") || captures[0]?.keyword || "";
  const firstPage = data.sample
    ? RECORDED_SCENE.page.finalUrl
    : params.get("url") || data.pages[0]?.finalUrl || data.project.url;
  const [query, setQuery] = useState(firstQuery),
    [pageUrl, setPageUrl] = useState(firstPage);
  const [stagedQuery, setStagedQuery] = useState(firstQuery),
    [stagedPage, setStagedPage] = useState(firstPage);
  const [selectedAt, setSelectedAt] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const history = captures.filter(
    (s) =>
      s.keyword.trim().toLowerCase() === stagedQuery.trim().toLowerCase() &&
      s.country === (data.sample ? "US" : data.project.country) &&
      s.language ===
        (data.sample
          ? "en"
          : data.project.language.split("-")[0].toLowerCase()),
  );
  const serp = history.find((s) => s.observedAt === selectedAt) || history[0];
  const previous =
    serp &&
    history.find(
      (s) =>
        sameSearch(s, serp) &&
        new Date(s.observedAt) < new Date(serp.observedAt),
    );
  const page = data.sample
    ? RECORDED_SCENE.page
    : data.pages.find(
        (p) =>
          pageIdentity(p.finalUrl) === pageIdentity(stagedPage) ||
          pageIdentity(p.url) === pageIdentity(stagedPage),
      );
  const relevantJob = jobs.find(
    (j) =>
      String(j.input.query).trim().toLowerCase() ===
      stagedQuery.trim().toLowerCase(),
  );
  const pending =
    relevantJob && ["queued", "running"].includes(relevantJob.status)
      ? relevantJob
      : null;
  const remaining = Math.max(
    0,
    data.limits.serps -
      (data.usage.find((u) => u.kind === "serps")?.amount ?? 0),
  );
  const configured =
    data.connections.providers.serp && data.connections.providers.background;
  const supported = !!RESEARCH_LOCATIONS[data.project.country];
  return (
    <div className="serp-studio">
      <div className="serp-studio-intro">
        <div>
          <span className="eyebrow">
            <Focus size={13} /> THE SERP STUDIO
          </span>
          <h1>
            See the search. <br className="studio-heading-break" />
            <em>Make your next move.</em>
          </h1>
          <p>One keyword. Your page. The competition, brought into focus.</p>
        </div>
        <div className="studio-maki">
          <Maki pose="thinking" />
          <span>
            Less staring at rankings.
            <br />
            More knowing what to do.
          </span>
        </div>
      </div>
      <form
        className="serp-command"
        onSubmit={async (e) => {
          e.preventDefault();
          if (data.sample) return;
          setError("");
          setBusy(true);
          try {
            await ctx.run({ kind: "serp", mode: "serp", query, pageUrl });
            setStagedQuery(query);
            setStagedPage(pageUrl);
            setSelectedAt("");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <label htmlFor="stage-keyword">
            <Search size={13} /> Search keyword
          </label>
          <input
            id="stage-keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            readOnly={data.sample}
            minLength={2}
            maxLength={200}
            required
            placeholder="What would your customer search?"
          />
        </div>
        <div>
          <label htmlFor="stage-page">
            <Link2 size={13} /> Your page
          </label>
          <input
            id="stage-page"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            readOnly={data.sample}
            type="url"
            required
            maxLength={2048}
            list="studio-pages"
          />
          <datalist id="studio-pages">
            {data.pages
              .map((p) => p.finalUrl)
              .filter((v, i, all) => all.indexOf(v) === i)
              .map((url) => (
                <option key={url} value={url} />
              ))}
          </datalist>
        </div>
        {data.sample ? (
          <Link className="button primary" href="/login">
            Use your own keyword <ArrowUpRight size={15} />
          </Link>
        ) : (
          <Button
            busy={busy}
            disabled={!configured || !supported || !remaining || !!pending}
          >
            <RefreshCw size={14} /> Stage live results · 1 lookup
          </Button>
        )}
      </form>
      <div className="studio-source-bar">
        <span>
          <Globe2 size={12} />{" "}
          {data.sample
            ? "US · English"
            : `${data.project.country} · ${data.project.language}`}{" "}
          <span className="source-separator">/</span> Desktop Google
        </span>
        <span className="studio-data-label">
          <span />{" "}
          {data.sample
            ? "Recorded real results · interactive walkthrough"
            : `${remaining} lookups left · refresh on request`}
        </span>
      </div>
      {!data.sample && !configured && (
        <p className="notice">
          Live staging needs the DataForSEO connection and background jobs.{" "}
          <Link href={`${ctx.base}/settings`}>Review connection setup →</Link>
        </p>
      )}
      {!data.sample && !supported && (
        <p role="alert" className="form-error">
          This project’s market is not yet supported by the research adapter.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {pending && (
        <div className="studio-progress" role="status">
          <RefreshCw className="spin" size={16} />
          <strong>{pending.stage}</strong>
          <span>
            The previous snapshot stays visible until a new one is ready.
          </span>
        </div>
      )}
      {relevantJob?.status === "failed" && (
        <p className="form-error" role="alert">
          {relevantJob.error ||
            "The lookup could not finish. Review the job before retrying."}
        </p>
      )}
      {serp && (
        <div className="studio-history">
          <span>
            <History size={13} /> Search snapshots
          </span>
          {history.slice(0, 6).map((s, i) => (
            <button
              key={s.observedAt}
              aria-pressed={s.observedAt === serp.observedAt}
              onClick={() => setSelectedAt(s.observedAt)}
            >
              {i === 0 ? "Latest · " : ""}
              {stamp(s.observedAt)}
            </button>
          ))}
        </div>
      )}
      {serp && page ? (
        <SceneWorkbench
          key={`${stagedPage}:${stagedQuery}`}
          page={page}
          serp={serp}
          previous={previous}
          name={data.sample ? RECORDED_SCENE.name : data.project.name}
          ctx={ctx}
        />
      ) : (
        <div className="studio-start">
          <Focus size={34} />
          <h2>
            {!serp
              ? "Every useful move starts with a real search."
              : "Your search is ready. Add the page evidence."}
          </h2>
          <p>
            {!serp
              ? "Enter a keyword and a page to bring the returned Google results into this canvas. Nothing is fetched or charged until you start a lookup."
              : "Inspect this page so the studio can connect the search results to your title, headings, and content."}
          </p>
          {!page && (
            <Button
              onClick={async () => {
                try {
                  await ctx.run({ kind: "recheck", url: stagedPage });
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Inspect this page · 1 page
            </Button>
          )}
          {!serp && (
            <Link href="/demo" className="text-link">
              Explore the recorded walkthrough <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function SceneWorkbench({
  page,
  serp,
  previous,
  name,
  ctx,
}: {
  page: PageSnapshot;
  serp: ResearchResult;
  previous?: ResearchResult;
  name: string;
  ctx: WorkspaceContext;
}) {
  const [before] = useState(page),
    [edits, setEdits] = useState<StudioEdits>(() => observedEdits(page));
  const [active, setActive] = useState<StudioField>("title"),
    [draft, setDraft] = useState(false),
    [phone, setPhone] = useState(false);
  const [peerUrl, setPeerUrl] = useState(""),
    [rechecking, setRechecking] = useState(false),
    [error, setError] = useState("");
  const editorRef = useRef<HTMLElement>(null);
  const [question, setQuestion] = useState(serp.questions?.[0] || "");
  const selectMove = (field: StudioField) => {
    setActive(field);
    if (window.matchMedia("(max-width: 1240px)").matches) {
      editorRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    }
  };
  const moves = proposeMoves(before, serp, name),
    move = moves.find((m) => m.id === active)!;
  const overview = serpOverview(before, serp);
  const peer =
    serp.results?.find((r) => r.url === peerUrl) || serp.results?.[0];
  const target = locatePage(serp, page),
    prior = previous ? locatePage(previous, page) : null;
  const shown = draft ? edits : observedEdits(page);
  const changed = (Object.keys(edits) as StudioField[]).filter(
    (k) => edits[k] !== observedEdits(before)[k],
  );
  const checks = verifyEdits(before, page, edits);
  const pageJob = ctx.data.jobs.find(
    (job) =>
      job.kind === "recheck" &&
      pageIdentity(String(job.input.url)) === pageIdentity(page.finalUrl),
  );
  const pagePending = pageJob && ["queued", "running"].includes(pageJob.status);

  const usage = Math.max(
    0,
    ctx.data.limits.pages -
      (ctx.data.usage.find((u) => u.kind === "pages")?.amount ?? 0),
  );
  return (
    <>
      <div className="serp-workbench">
        <aside className="studio-moves" aria-label="Suggested next moves">
          <div className="studio-panel-label">
            <Sparkles size={15} />
            <h2>Your next moves</h2>
          </div>
          <p className="studio-aside-note">
            Select a move. See the evidence. Try the wording.
          </p>
          {moves.map((m, i) => (
            <button
              key={m.id}
              className={`studio-move ${active === m.id ? "selected" : ""}`}
              aria-pressed={active === m.id}
              onClick={() => selectMove(m.id)}
            >
              <span className="move-index">
                {changed.includes(m.id) ? <Check size={14} /> : `0${i + 1}`}
              </span>
              <span>
                <strong>{m.title}</strong>
                <small>
                  {changed.includes(m.id) ? "Draft changed" : fields[m.id]}
                </small>
              </span>
              <ArrowUpRight size={14} />
            </button>
          ))}
          <div className="studio-observation">
            <span className="eyebrow">WHAT WE CAN SEE</span>
            <p>{move.observation}</p>
            <Link href={`/learn/${move.guide}`}>
              Explore the method <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="studio-rank-note">
            <Focus size={20} />
            <strong>
              {target?.listing.rank_group != null
                ? `Organic #${target.listing.rank_group}`
                : target
                  ? "Found · position unavailable"
                  : "Not in this returned set"}
            </strong>
            <p>
              {target
                ? `${target.match === "canonical" ? "Your declared canonical URL" : "Your page"} was observed in this snapshot.`
                : `We did not observe this URL or its canonical among these ${serp.results?.length ?? 0} organic results. This is not a “page two” measurement.`}
            </p>
            {previous && (
              <small>
                Earlier snapshot:{" "}
                {prior?.listing.rank_group != null
                  ? `organic #${prior.listing.rank_group}`
                  : prior
                    ? "found · position unavailable"
                    : "not observed"}
              </small>
            )}
          </div>
        </aside>
        <section
          className="serp-arena"
          aria-label="Google results visualization"
        >
          <div className="arena-caption">
            <span>
              <span className="tiny-dot" /> THE SEARCH, IN FOCUS
            </span>
            <span>{serp.results?.length ?? 0} returned organic results</span>
          </div>
          <div className="serp-browser-bar">
            <span className="browser-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <Search size={12} /> {serp.keyword}
            </span>
            <Monitor size={14} />
          </div>
          <div
            className={`your-page-preview ${draft ? "is-draft" : ""} ${phone ? "phone-preview" : ""}`}
          >
            <div className="your-page-label">
              <span>
                <Focus size={13} />{" "}
                {draft ? "DRAFT PREVIEW" : "YOUR FETCHED PAGE"}
              </span>
              <span>{draft ? "Not published" : page.htmlSource + " HTML"}</span>
            </div>
            <span className="preview-domain">
              <SiteIcon url={page.finalUrl} iconUrl={page.favicon} />
              {hostName(page.finalUrl)}
            </span>
            <h2 data-testid="studio-preview-title">
              <MarkedText
                text={shown.title || "No title found"}
                query={serp.keyword}
              />
            </h2>
            <p data-testid="studio-preview-description">
              {shown.description ||
                "No description was found in the inspected page."}
            </p>
            {(active === "h1" || active === "answer") && (
              <div className="page-content-preview">
                <span>ON THE PAGE</span>
                <h3>{shown.h1 || "No H1 found"}</h3>
                {active === "answer" && (
                  <p>
                    {draft && edits.answer
                      ? edits.answer
                      : "Use the editor to prepare a supported answer."}
                  </p>
                )}
              </div>
            )}
            <div
              className="studio-preview-controls"
              role="group"
              aria-label="Page preview"
            >
              <button aria-pressed={!draft} onClick={() => setDraft(false)}>
                Current page
              </button>
              <button aria-pressed={draft} onClick={() => setDraft(true)}>
                My draft {changed.length > 0 && <span>{changed.length}</span>}
              </button>
              <button
                className="phone-switch"
                aria-pressed={phone}
                onClick={() => setPhone(!phone)}
                aria-label="Preview at phone width"
              >
                <Monitor size={13} /> {phone ? "Phone" : "Desktop"}
              </button>
            </div>
          </div>
          <div className="arena-bridge">
            <ArrowDown size={16} />
            <em>Compare with the captured search results</em>
          </div>
          <div className="serp-engine-bar">
            <strong>
              Google <span>organic snapshot</span>
            </strong>
            <span>
              {stamp(serp.observedAt)} · {serp.results?.length ?? 0} organic ·{" "}
              {serp.questions?.length ?? 0} related questions
            </span>
          </div>
          <div
            className="serp-stack"
            role="region"
            tabIndex={0}
            aria-label="Scroll through recorded organic results"
          >
            <ol>
              {(serp.results ?? []).map((r, i) => {
                const isTarget = target?.listing.url === r.url;
                const priorRow = previous?.results?.find(
                  (p) => pageIdentity(p.url) === pageIdentity(r.url),
                );
                const delta =
                  priorRow?.rank_group != null && r.rank_group != null
                    ? priorRow.rank_group - r.rank_group
                    : null;
                return (
                  <li
                    key={`${r.url}:${i}`}
                    className={`${peer?.url === r.url ? "is-selected" : ""} ${isTarget ? "is-your-page" : ""}`}
                  >
                    <span
                      className="serp-position"
                      title="Returned organic position"
                    >
                      {r.rank_group ?? "—"}
                    </span>
                    <button
                      className="serp-result"
                      aria-label={`Inspect result ${r.rank_group ?? "position unavailable"}: ${r.title}`}
                      aria-pressed={peer?.url === r.url}
                      onClick={() => setPeerUrl(r.url)}
                    >
                      <span className="serp-result-domain">
                        <SiteIcon url={r.url} iconUrl={r.favicon} />
                        {hostName(r.url)}
                        {isTarget && (
                          <b>
                            Your{" "}
                            {target?.match === "canonical"
                              ? "canonical"
                              : "page"}
                          </b>
                        )}
                        {delta !== null && delta !== 0 && (
                          <b>
                            {delta > 0 ? "↑" : "↓"}
                            {Math.abs(delta)} since prior
                          </b>
                        )}
                      </span>
                      <strong>
                        <MarkedText text={r.title} query={serp.keyword} />
                      </strong>
                      <p>
                        <MarkedText text={r.description} query={serp.keyword} />
                      </p>
                      {r.breadcrumb && (
                        <span className="serp-breadcrumb">
                          <Globe2 size={10} /> {r.breadcrumb}
                        </span>
                      )}
                      <span className="serp-inspect-hint">
                        <MousePointer2 size={10} /> Inspect this result{" "}
                        <ArrowUpRight size={10} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {!serp.results?.length && (
              <p className="studio-aside-note">
                No organic listings were returned in this snapshot.
              </p>
            )}
          </div>
          <p className="arena-footnote">
            Preview changes appear instantly. Observed Google positions change
            only with a new snapshot. Preview width does not change the measured
            device.
          </p>
        </section>
        <aside
          className="studio-editor"
          aria-label="Change editor"
          ref={editorRef}
        >
          <div className="studio-editor-top">
            <TextCursorInput size={19} />
            <span>LET’S WORK THE PAGE</span>
            <span className="editor-step">
              0{moves.findIndex((m) => m.id === active) + 1} / 04
            </span>
          </div>
          <h2>{move.title}</h2>
          <p className="studio-move-why">{move.why}</p>
          <section
            className="studio-competitor-insights"
            aria-labelledby="competitor-insights-title"
          >
            <div className="studio-insights-heading">
              <Globe2 size={14} />
              <span id="competitor-insights-title">
                WHAT THE RETURNED RESULTS REPEAT
              </span>
            </div>
            <div className="studio-insight-grid">
              <div>
                <strong>
                  {overview.titlesWithQueryTerms}/{overview.resultCount}
                </strong>
                <span>titles use a query term</span>
              </div>
              <div>
                <strong>
                  {overview.descriptionsPresent}/{overview.resultCount}
                </strong>
                <span>descriptions are present</span>
              </div>
              <div>
                <strong>
                  {overview.userTitleTerms}/{overview.queryTermCount}
                </strong>
                <span>in your title</span>
              </div>
              <div>
                <strong>{overview.questions}</strong>
                <span>related questions</span>
              </div>
            </div>
            <p className="studio-insight-tip">
              <Sparkles size={12} /> <strong>Try this:</strong>{" "}
              {overview.commonTerms.length
                ? `make the page’s promise as clear as “${overview.commonTerms.join(", ")}” — only if it is true for your page.`
                : "state the page’s specific promise in its title and first heading."}
            </p>
            <small>Measured clues from this snapshot, not ranking causes.</small>
          </section>
          {active === "answer" && question && (
            <p className="studio-selected-question">
              <span>Question from this search</span>
              <strong>{question}</strong>
            </p>
          )}
          <label htmlFor="studio-edit">{fields[active]}</label>
          <textarea
            key={active}
            id="studio-edit"
            value={edits[active]}
            maxLength={
              active === "answer" ? 2000 : active === "description" ? 500 : 200
            }
            rows={active === "answer" ? 7 : 4}
            placeholder={
              active === "answer"
                ? "Write an answer supported by your page or confirmed business facts…"
                : "Describe this page clearly…"
            }
            onChange={(e) => {
              setEdits({ ...edits, [active]: e.target.value });
              setDraft(true);
            }}
          />
          <div className="editor-character-count">
            <span>{edits[active].length} characters</span>
            <span>Editable proposal</span>
          </div>
          <div
            className="editor-live-preview"
            aria-label="Inline draft preview"
          >
            <span>YOUR LIVE PREVIEW · {draft ? "DRAFT" : "CURRENT PAGE"}</span>
            <h3>{active === "h1" ? shown.h1 : shown.title}</h3>
            <p>
              {active === "answer"
                ? shown.answer || "Your supported answer will appear here."
                : shown.description}
            </p>
          </div>
          {move.proposal && (
            <button
              className="studio-try"
              onClick={() => {
                setEdits({ ...edits, [active]: move.proposal });
                setDraft(true);
              }}
            >
              <Sparkles size={14} /> Try this wording <ArrowRight size={15} />
            </button>
          )}
          <div className="studio-change-status" role="status">
            <span className={changed.length ? "has-edits" : ""} />{" "}
            {changed.length
              ? `${changed.length} draft ${changed.length === 1 ? "field" : "fields"} changed. Your website is unchanged.`
              : "Try a move and watch the preview respond."}
          </div>
          <div className="studio-editor-actions">
            <Button
              variant="secondary"
              disabled={!changed.length}
              onClick={() =>
                download(
                  "ranksushi-serp-change.md",
                  sceneExport(before, serp, edits),
                  "text/markdown",
                )
              }
            >
              <Download size={14} /> Export this change
            </Button>
            <button
              className="studio-reset"
              disabled={!changed.length}
              onClick={() => {
                setEdits(observedEdits(before));
                setDraft(false);
              }}
            >
              Reset draft
            </button>
          </div>
          <FixKit
            context={{
              key: active,
              title: move.title,
              url: page.finalUrl,
              detail: move.observation,
              recommendation: move.why,
              proposed: edits[active],
              query: serp.keyword,
              evidence: {
                source: `${page.htmlSource} page HTML + ${serp.source}`,
                observedAt: page.fetchedAt,
                market: `${serp.country} / ${serp.language} / ${serp.device}`,
                status: "inferred",
                detail: move.observation,
              },
            }}
          />
          <div className="studio-publish-note">
            <span>01 Review</span>
            <ArrowRight size={11} />
            <span>02 Publish in your CMS</span>
            <ArrowRight size={11} />
            <span>03 Recheck</span>
          </div>
          {ctx.data.sample ? (
            <Link href="/login" className="studio-recheck-link">
              Recheck your own website <ArrowUpRight size={13} />
            </Link>
          ) : (
            <Button
              variant="secondary"
              busy={rechecking}
              disabled={
                !ctx.data.connections.providers.firecrawl ||
                !ctx.data.connections.providers.background ||
                !usage ||
                !!pagePending
              }
              onClick={async () => {
                setError("");
                setRechecking(true);
                try {
                  await ctx.run({ kind: "recheck", url: page.finalUrl });
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setRechecking(false);
                }
              }}
            >
              <RefreshCw size={13} /> Recheck page · 1 page
            </Button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {pagePending && (
            <p className="studio-recheck-status" role="status">
              <RefreshCw size={13} className="spin" />
              {pageJob.stage}
            </p>
          )}
          {pageJob?.status === "failed" && (
            <p className="form-error" role="alert">
              {pageJob.error ||
                "The page could not be rechecked. Your draft is still here."}
            </p>
          )}
          {checks.length > 0 && (
            <ul className="studio-verification">
              {checks.map((c) => (
                <li key={c.field}>
                  <span>{fields[c.field]}</span>
                  <strong>
                    {c.status === "matched"
                      ? "Found on recheck"
                      : c.status === "awaiting-recheck"
                        ? "Awaiting recheck"
                        : "Not found in recheck"}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          <p className="studio-page-stamp">
            Page evidence: {stamp(page.fetchedAt)}.{" "}
            {page.truncated
              ? "The inspected response was truncated."
              : "Verification covers the inspected content."}
          </p>
        </aside>
      </div>
      <div className="studio-evidence-strip">
        <section className="peer-evidence">
          <span className="eyebrow">
            <Eye size={13} /> UNDER THE SELECTED RESULT
          </span>
          {peer ? (
            <>
              <h2 className="peer-domain-heading">
                <SiteIcon url={peer.url} size="medium" />
                {hostName(peer.url)}
              </h2>
              <p>
                {termCoverage(peer.title, serp.keyword).length} of{" "}
                {queryTerms(serp.keyword).length} query terms appear in its
                returned title. These are visible clues, not a full explanation
                of its rank.
              </p>
              <div className="peer-query-tokens">
                {queryTerms(serp.keyword).map((t) => (
                  <span
                    className={
                      termCoverage(peer.title, serp.keyword).includes(t)
                        ? "present"
                        : ""
                    }
                    key={t}
                  >
                    {termCoverage(peer.title, serp.keyword).includes(t) && (
                      <Check size={11} />
                    )}
                    {t}
                  </span>
                ))}
              </div>
              <a href={peer.url} target="_blank" rel="noreferrer">
                Inspect the source page <ArrowUpRight size={13} />
              </a>
              <small>
                Returned title, description, and position only. This competitor
                page has not been crawled, so do not infer its on-page setup.
              </small>
            </>
          ) : (
            <p>No competitor evidence returned.</p>
          )}
        </section>
        <section className="studio-questions">
          <span className="eyebrow">
            <Search size={13} /> THE NEXT QUESTION
          </span>
          <h2>There’s a person behind that search.</h2>
          {serp.questions?.length ? (
            <>
              <p>Questions returned with this Google snapshot:</p>
              <div>
                {serp.questions.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                      selectMove("answer");
                      setDraft(true);
                    }}
                  >
                    {q}
                    <ChevronDown size={14} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>No related questions were included in the provider response.</p>
          )}
        </section>
      </div>
    </>
  );
}
