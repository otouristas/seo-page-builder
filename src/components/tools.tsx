"use client";
import { CopyActions } from "./copy-actions";
import { findingBundle } from "@/lib/fixes/prompts";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Globe2, ScanLine, Download, Code2 } from "lucide-react";
import { Maki } from "./maki";
import { Button, ButtonLink, Badge } from "./ui";
import { Finding, Notice, request, download } from "./workspace/shared";
import {
  validateStructuredData,
  type SchemaValidation,
} from "@/lib/seo/schema";
import type { PageSnapshot } from "@/lib/types";
import { toCsv } from "@/lib/utils";
export function FreeAuditTool({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl),
    [honey, setHoney] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [snapshot, setSnapshot] = useState<PageSnapshot | null>(null),
    [filter, setFilter] = useState("attention");
  const autoAuditUrl = useRef("");
  const runAudit = useCallback(
    async (targetUrl: string) => {
      setBusy(true);
      setError("");
      setSnapshot(null);
      try {
        const data = await request<{
          snapshot: PageSnapshot;
          token: string;
        }>("/api/audit", { url: targetUrl, honey });
        setSnapshot(data.snapshot);
        sessionStorage.setItem(
          "ranksushi-free-audit",
          JSON.stringify({ url: data.snapshot.url, token: data.token }),
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [honey],
  );
  useEffect(() => {
    if (!initialUrl || autoAuditUrl.current === initialUrl) return;
    autoAuditUrl.current = initialUrl;
    void runAudit(initialUrl);
  }, [initialUrl, runAudit]);
  return (
    <>
      <form
        className="audit-tool-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await runAudit(url);
        }}
      >
        <label htmlFor="audit-url">Your website URL</label>
        <div className="audit-url-row">
          <Globe2 size={18} />
          <input
            id="audit-url"
            inputMode="url"
            type="text"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            maxLength={2048}
            required
          />
          <Button busy={busy}>
            <ScanLine size={15} />
            Audit one page
          </Button>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="company-fax">Leave this field empty</label>
          <input
            id="company-fax"
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
          />
        </div>
        <p className="small-note">
          Free. No account or card. Public HTML inspection of one page, with
          robots.txt respected.
        </p>
      </form>
      {busy && (
        <div className="tool-state" role="status">
          <Maki pose="thinking" motion="cook" />
          <h2>Taking a closer look…</h2>
          <p>Fetching the public page and inspecting the available evidence.</p>
        </div>
      )}
      {error && (
        <div className="tool-error" role="alert">
          <h2>We couldn’t finish this audit.</h2>
          <p>{error}</p>
          <p>
            Check the URL and try again. You can still explore the example
            workspace and use the metadata and JSON-LD tools.
          </p>
          <ButtonLink href="/demo" variant="secondary">
            Explore the example <ArrowUpRight size={13} />
          </ButtonLink>
        </div>
      )}
      {snapshot && (
        <div className="free-audit-result">
          <div className="audit-result-heading">
            <div>
              <Badge tone="green">REAL PAGE EVIDENCE</Badge>
              <h2>{snapshot.title || "Your page audit"}</h2>
              <p>{snapshot.finalUrl}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  "ranksushi-page-audit.csv",
                  toCsv(
                    snapshot.findings.map((f) => ({
                      check: f.title,
                      status: f.status,
                      severity: f.severity,
                      evidence: f.detail,
                      recommendation: f.recommendation,
                      source: f.evidence.source,
                      observed: f.evidence.observedAt,
                    })),
                  ),
                  "text/csv",
                )
              }
            >
              <Download size={14} />
              Export CSV
            </Button>
          </div>
          <div className="audit-fix-plan">
            <div>
              <strong>Turn this audit into a fix plan.</strong>
              <p>
                Copy the evidence, instructions and checks for every finding
                that needs review.
              </p>
            </div>
            <CopyActions
              label="Copy page fix plan"
              filename="ranksushi-page-fix-plan.md"
              text={findingBundle(
                snapshot.findings.map((f) => ({
                  key: f.id,
                  title: f.title,
                  url: snapshot.finalUrl,
                  detail: f.detail,
                  recommendation: f.recommendation,
                  status: f.status,
                  evidence: f.evidence,
                })),
                snapshot.finalUrl,
              )}
            />
          </div>
          <Notice>
            This inspection uses fetched HTML, not a rendered browser.
            JavaScript-only content may be absent. HTTP status:{" "}
            {snapshot.status}. Observed{" "}
            {new Date(snapshot.fetchedAt).toLocaleString("en-US")}.
          </Notice>
          <div className="toolbar tab-pills">
            {[
              ["attention", "Needs a look"],
              ["all", "Every check"],
              ["unknown", "Needs context"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={filter === id ? "active" : ""}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="finding-list">
            {snapshot.findings
              .filter(
                (f) =>
                  filter === "all" ||
                  (filter === "attention" &&
                    ["warning", "fail"].includes(f.status)) ||
                  f.status === filter,
              )
              .map((f) => (
                <Finding finding={f} key={f.id} />
              ))}
          </div>
          <div className="save-audit-card">
            <div>
              <h2>Keep the evidence. Take the next bite.</h2>
              <p>
                Save this audit to a project within one hour, then prepare and
                verify your next changes.
              </p>
            </div>
            <ButtonLink
              href={`/login?website=${encodeURIComponent(snapshot.url)}`}
            >
              Save my project <ArrowUpRight size={14} />
            </ButtonLink>
          </div>
        </div>
      )}
      {!snapshot && !busy && !error && (
        <div className="tool-state">
          <Maki pose="wave" />
          <h2>A little taste of clarity.</h2>
          <p>
            Inspect titles, descriptions, indexing preferences, headings, links,
            image alternatives, and JSON-LD. Every finding comes with its
            evidence and a useful next step.
          </p>
        </div>
      )}
    </>
  );
}
export function MetadataTool() {
  const [title, setTitle] = useState(
      "Your best page deserves a clearer invitation",
    ),
    [description, setDescription] = useState(
      "Write a specific, honest description of what visitors will find. A useful snippet helps the right people decide to visit your website.",
    ),
    [url, setUrl] = useState("https://yourwebsite.com/your-page"),
    [mobile, setMobile] = useState(false);
  let display = "yourwebsite.com";
  try {
    display = new URL(url).hostname;
  } catch {}
  return (
    <>
      <div className="two-col tool-workspace">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="meta-title">Page title</label>
            <input
              id="meta-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={250}
            />
            <p>
              {title.length} characters. Display width and query context matter
              more than a fixed character count.
            </p>
          </div>
          <div className="field">
            <label htmlFor="meta-description">Meta description</label>
            <textarea
              id="meta-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <p>
              {description.length} characters. Google may generate a different
              snippet from page content.
            </p>
          </div>
          <div className="field">
            <label htmlFor="meta-url">Page URL</label>
            <input
              id="meta-url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={2048}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              download(
                "ranksushi-metadata.json",
                JSON.stringify({ url, title, description }, null, 2),
                "application/json",
              )
            }
          >
            <Download size={14} />
            Export metadata
          </Button>
        </form>
        <div>
          <div className="toolbar tab-pills">
            <button
              className={!mobile ? "active" : ""}
              aria-pressed={!mobile}
              onClick={() => setMobile(false)}
            >
              Desktop
            </button>
            <button
              className={mobile ? "active" : ""}
              aria-pressed={mobile}
              onClick={() => setMobile(true)}
            >
              Mobile
            </button>
          </div>
          <div className={`search-preview ${mobile ? "mobile" : ""}`}>
            <Badge>APPROXIMATE PREVIEW</Badge>
            <div className="search-result">
              <div className="domain">
                <span className="search-site-icon">
                  <Globe2 size={16} />
                </span>
                <span>
                  {display}
                  <small>{url}</small>
                </span>
              </div>
              <div className="title">{title || "Your page title"}</div>
              <div className="description">
                {description || "Your page description"}
              </div>
            </div>
          </div>
          <Notice>
            This is a visual approximation. Search engines can rewrite titles
            and snippets, and layouts vary by device, query, and feature.
          </Notice>
        </div>
      </div>
    </>
  );
}
const example = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Your business",
    url: "https://yourwebsite.com",
  },
  null,
  2,
);
export function SchemaTool() {
  const [code, setCode] = useState(example),
    [visible, setVisible] = useState(""),
    [result, setResult] = useState<SchemaValidation | null>(null);
  return (
    <>
      <div className="tool-workspace">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setResult(validateStructuredData(code, visible));
          }}
        >
          <div className="two-col">
            <div className="field">
              <label htmlFor="schema-input">Your JSON-LD</label>
              <textarea
                className="schema-input"
                id="schema-input"
                rows={13}
                maxLength={200000}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div>
              <div className="field">
                <label htmlFor="schema-visible">
                  Visible page content (optional)
                </label>
                <textarea
                  id="schema-visible"
                  rows={8}
                  maxLength={100000}
                  value={visible}
                  onChange={(e) => setVisible(e.target.value)}
                  placeholder="Paste the page text to check whether selected markup values appear in the visible content."
                />
              </div>
              <Notice>
                Use markup that describes what readers can actually see. There
                is no special markup that guarantees an AI citation.
              </Notice>
            </div>
          </div>
          <div className="toolbar">
            <Button>
              <Code2 size={15} />
              Check structured data
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                download("structured-data.json", code, "application/ld+json")
              }
            >
              <Download size={14} />
              Download JSON
            </Button>
          </div>
        </form>
        {result && (
          <section className="schema-results" aria-live="polite">
            <h2>
              {result.validJson
                ? "JSON syntax checks out."
                : "Let’s fix the JSON first."}
            </h2>
            <p>
              {result.types.length
                ? `Types detected: ${result.types.join(", ")}`
                : "No schema types detected."}
            </p>
            {result.issues.map((i, n) => (
              <div className="schema-issue" key={n}>
                <Badge
                  tone={
                    i.level === "error"
                      ? "red"
                      : i.level === "review"
                        ? "orange"
                        : "neutral"
                  }
                >
                  {i.level}
                </Badge>
                <div>
                  <strong>{i.path}</strong>
                  <p>{i.message}</p>
                </div>
              </div>
            ))}
            <Notice>{result.note}</Notice>
            <p className="small-note">
              For a full review, also use the{" "}
              <a
                className="inline-link"
                href="https://validator.schema.org/"
                target="_blank"
                rel="noreferrer"
              >
                Schema.org validator
              </a>{" "}
              and{" "}
              <a
                className="inline-link"
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
              >
                Google’s Rich Results Test
              </a>
              .
            </p>
          </section>
        )}
      </div>
    </>
  );
}
