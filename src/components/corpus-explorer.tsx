"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Search, Sparkles } from "lucide-react";
import { CopyActions } from "./copy-actions";
import {
  CORPUS_RULES,
  CORPUS_SOURCES,
  CORPUS_VERSION,
  EVIDENCE_LABELS,
  rulePrompt,
  type EvidenceClass,
} from "@/lib/knowledge/corpus";
export function CorpusExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EvidenceClass | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const followHash = () => {
      const id = window.location.hash.slice(1);
      if (CORPUS_RULES.some((r) => r.id === id)) {
        setQuery("");
        setCategory("all");
        setExpanded(id);
      }
    };
    followHash();
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);
  useEffect(() => {
    if (expanded && window.location.hash === `#${expanded}`)
      document.getElementById(expanded)?.scrollIntoView({ block: "start" });
  }, [expanded]);
  const needle = query.trim().toLowerCase();
  const rules = CORPUS_RULES.filter(
    (r) =>
      (category === "all" || r.category === category) &&
      [r.title, r.when, r.action, ...r.topics, ...r.triggers]
        .join(" ")
        .toLowerCase()
        .includes(needle),
  );
  return (
    <div className="corpus-library" id="methods">
      <div className="corpus-intro">
        <span className="eyebrow">
          <BookOpen size={14} /> GOOD INGREDIENTS. BETTER DECISIONS.
        </span>
        <h2>Find your next useful bite.</h2>
        <p>Pick the problem. Check the proof. Take a fix brief with you.</p>
        <div className="corpus-stats">
          <span>
            <strong>{CORPUS_RULES.length}</strong> practical methods
          </span>
          <span>
            <strong>11</strong> research reviews
          </span>
          <span>
            <strong>3</strong> evidence labels
          </span>
        </div>
      </div>
      <label className="corpus-search">
        <Search size={18} />
        <span className="sr-only">Search evidence methods</span>
        <input
          type="search"
          placeholder="Try canonical, schema, original content…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div
        className="corpus-filters"
        role="group"
        aria-label="Evidence classification"
      >
        {(["all", "google", "research", "workflow"] as const).map((c) => (
          <button
            type="button"
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c === "all" ? "All methods" : EVIDENCE_LABELS[c]}
          </button>
        ))}
      </div>
      <p className="corpus-count" role="status">
        {rules.length} {rules.length === 1 ? "method" : "methods"} · Edition{" "}
        {CORPUS_VERSION}
      </p>
      {!rules.length && (
        <div className="corpus-empty">
          <Sparkles size={24} />
          <h3>No matching method yet.</h3>
          <p>Try a broader topic, or inspect the affected page first.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Show all methods
          </button>
        </div>
      )}
      {rules.map((r) => (
        <details
          key={r.id}
          id={r.id}
          className="corpus-method"
          open={expanded === r.id}
          onToggle={(e) => {
            if (e.currentTarget.open) setExpanded(r.id);
            else setExpanded((current) => (current === r.id ? null : current));
          }}
        >
          <summary>
            <span className={`corpus-badge ${r.category}`}>
              {EVIDENCE_LABELS[r.category]}
            </span>
            <h3>{r.title}</h3>
            <span className="corpus-when">{r.when}</span>
            <span className="corpus-open">
              Open the method <span aria-hidden="true">↗</span>
            </span>
          </summary>
          <div className="corpus-method-body">
            <p>{r.action}</p>
            <div className="corpus-context">
              <strong>Keep in mind</strong>
              <p>{r.guardrail}</p>
            </div>
            <div className="corpus-verify">
              <strong>
                <span aria-hidden="true">✓</span> You’re done when
              </strong>
              <p>{r.verify}</p>
            </div>
            <p className="corpus-reviewed">
              Reviewed {r.reviewed} · Source reviews: {r.originDates.join(", ")}
            </p>
            <div className="corpus-source-links">
              {r.sourceIds.map((id) => (
                <a
                  href={CORPUS_SOURCES[id].url}
                  key={id}
                  target="_blank"
                  rel="noreferrer"
                >
                  {CORPUS_SOURCES[id].title}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
            <CopyActions
              text={rulePrompt(r)}
              label="Copy fix brief"
              filename={`ranksushi-${r.id}.md`}
            />
          </div>
        </details>
      ))}
    </div>
  );
}
