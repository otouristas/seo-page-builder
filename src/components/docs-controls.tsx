"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { CopyActions, CopyButton } from "./copy-actions";
import { FIX_RECIPES } from "@/lib/fixes/recipes";
import { fixPrompt } from "@/lib/fixes/prompts";
import { guidePrompt } from "@/lib/learning/doc-prompts";
import type { Collection, LearningArticle } from "@/lib/learning/content";
export type DocEntry = {
  href: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
};
export function DocsSidebar({
  entries,
  current,
}: {
  entries: DocEntry[];
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const categories = [...new Set(entries.map((e) => e.category))];
  return (
    <aside className={`docs-sidebar ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="docs-browse"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <BookOpen size={16} />
        Browse the docs
        <ChevronDown size={15} />
      </button>
      <nav
        id={id}
        aria-label="Documentation topics"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <Link
          href="/help"
          className="docs-start-link"
          aria-current={current === "/help" ? "page" : undefined}
        >
          Start here <ArrowRight size={13} />
        </Link>
        {categories.map((category) => (
          <div className="docs-nav-group" key={category}>
            <h2>{category}</h2>
            {entries
              .filter((e) => e.category === category)
              .map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  aria-current={e.href === current ? "page" : undefined}
                >
                  {e.title}
                </Link>
              ))}
          </div>
        ))}
        <div className="docs-rail-note">
          <strong>A little stuck?</strong>
          <p>Tell us what you tried and what happened.</p>
          <a href="mailto:anotherseoguru@gmail.com">
            Contact support <ArrowUpRight size={12} />
          </a>
        </div>
      </nav>
    </aside>
  );
}
export function DocsSearch({ entries }: { entries: DocEntry[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <button
        className="docs-search-trigger"
        aria-label="Search documentation"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Search size={15} />
        <span>Find an answer…</span>
        <kbd>⌘ K</kbd>
      </button>
      {open && (
        <SearchDialog entries={entries} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
function SearchDialog({
  entries,
  onClose,
}: {
  entries: DocEntry[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null),
    id = useId();
  const [query, setQuery] = useState("");
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    input.current?.focus();
    return () => dialog?.close();
  }, []);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const found = entries.filter((e) =>
    terms.every((t) =>
      [e.title, e.category, e.description, ...e.tags]
        .join(" ")
        .toLowerCase()
        .includes(t),
    ),
  );
  return (
    <dialog
      ref={ref}
      className="docs-search-dialog"
      aria-labelledby={id}
      onCancel={onClose}
    >
      <h2 id={id} className="sr-only">
        Search documentation
      </h2>
      <div className="docs-search-input">
        <Search size={18} />
        <input
          ref={input}
          aria-label="Search documentation"
          type="search"
          placeholder="Try title, Google, failed job…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          aria-label="Close documentation search"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <p className="docs-search-count" role="status">
        {found.length} {found.length === 1 ? "answer" : "answers"} to explore
      </p>
      <div className="docs-search-results">
        {found.map((e) => (
          <Link href={e.href} key={e.href} onClick={onClose}>
            <span>{e.category}</span>
            <strong>{e.title}</strong>
            <p>{e.description}</p>
            <ArrowUpRight size={15} />
          </Link>
        ))}
        {!found.length && (
          <div className="docs-search-empty">
            <h3>No answer for that phrase yet.</h3>
            <p>Try a shorter phrase or contact support.</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => setQuery("")}
            >
              Show all answers
            </button>
          </div>
        )}
      </div>
      <footer>Use Tab to browse results. Escape closes search.</footer>
    </dialog>
  );
}
export function DocsPlaybook({
  article,
  collection,
}: {
  article: LearningArticle;
  collection: Collection;
}) {
  const [tab, setTab] = useState(
      article.slug === "fix-prompts" ? "prompt" : "steps",
    ),
    [checked, setChecked] = useState<number[]>([]),
    [url, setUrl] = useState(""),
    [issue, setIssue] = useState("title");
  const special = article.slug === "fix-prompts";
  const prompt = special
    ? fixPrompt({
        key: issue,
        title: FIX_RECIPES[issue].label,
        url,
        detail:
          "No audit evidence supplied. Inspect the page before deciding whether a change is needed.",
        status: "unknown",
      })
    : guidePrompt(article, collection, url);
  const id = useId();
  return (
    <div className="docs-playbook">
      <div className="docs-playbook-label">
        <span>
          <Check size={14} />
          YOUR NEXT MOVE
        </span>
        <span>{article.checklist.length} steps</span>
      </div>
      <h2>Read it. Use it.</h2>
      <p>Take the instructions straight into your work.</p>
      <div
        className="docs-playbook-tabs"
        role="group"
        aria-label="Guide companion"
      >
        <button
          type="button"
          aria-pressed={tab === "steps"}
          onClick={() => setTab("steps")}
        >
          Checklist
        </button>
        <button
          type="button"
          aria-pressed={tab === "prompt"}
          onClick={() => setTab("prompt")}
        >
          AI prompt
        </button>
      </div>
      {tab === "steps" ? (
        <div className="docs-checklist">
          <div className="docs-checklist-progress">
            <span>
              {checked.length} of {article.checklist.length} checked
            </span>
            <button
              type="button"
              onClick={() => setChecked([])}
              disabled={!checked.length}
            >
              Reset
            </button>
          </div>
          <progress
            aria-label="Your guide checklist"
            value={checked.length}
            max={article.checklist.length}
          />
          {article.checklist.map((step, i) => (
            <label key={step}>
              <input
                type="checkbox"
                checked={checked.includes(i)}
                onChange={() =>
                  setChecked((v) =>
                    v.includes(i) ? v.filter((n) => n !== i) : [...v, i],
                  )
                }
              />
              <span>{step}</span>
            </label>
          ))}
          <p className="docs-progress-note" role="status">
            {checked.length === article.checklist.length
              ? "All steps checked. Your next action is below."
              : "Your checklist for this visit. These ticks do not verify a live website change."}
          </p>
          <Link className="docs-next-button" href={article.action.href}>
            {article.action.label}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="docs-prompt-panel">
          <label htmlFor={`${id}-url`}>
            Make it about your page <span>Optional</span>
          </label>
          <input
            id={`${id}-url`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com/page"
          />
          {special && (
            <>
              <label htmlFor={`${id}-issue`}>What needs a look?</label>
              <select
                id={`${id}-issue`}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              >
                {Object.entries(FIX_RECIPES).map(([key, r]) => (
                  <option key={key} value={key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="docs-code-header">
            <span>PROMPT · READY TO PASTE</span>
            <span>
              <CopyButton text={prompt} label="Copy prompt" />
            </span>
          </div>
          <textarea
            aria-label="Guide prompt preview"
            value={prompt}
            readOnly
            rows={10}
          />
          <CopyActions
            text={prompt}
            label="Copy prompt"
            filename={`ranksushi-${article.slug}-prompt.md`}
          />
          <p className="docs-prompt-note">
            Works as a prompt in ChatGPT, Claude, Codex or Cursor. Paste it
            yourself; your page is not fetched or changed here.
          </p>
        </div>
      )}
    </div>
  );
}
