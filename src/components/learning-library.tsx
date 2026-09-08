"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
export type LibraryEntry = {
  href: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  tags: string[];
};
export function LearningLibrary({
  entries,
  label,
}: {
  entries: LibraryEntry[];
  label: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(entries.map((a) => a.category))];
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = entries.filter(
    (a) =>
      (category === "All" || a.category === category) &&
      terms.every((term) =>
        [a.title, a.description, a.category, ...a.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(term),
      ),
  );
  return (
    <div className="learning-library">
      <div className="library-search">
        <Search aria-hidden="true" size={20} />
        <label className="sr-only" htmlFor="library-search">
          {label}
        </label>
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={label}
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery("")}>
            <X size={18} />
          </button>
        )}
        <span>Search the menu</span>
      </div>
      <div
        className="library-filters"
        role="group"
        aria-label="Filter by topic"
      >
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="library-result-count" role="status">
        {filtered.length} {filtered.length === 1 ? "read" : "reads"}
        {category !== "All" ? ` in ${category}` : ""}
        {query ? ` matching “${query}”` : ". All here to help."}
      </p>
      <div className="learning-grid">
        {filtered.map((a, i) => (
          <article key={a.href} className={`learning-card ingredient-${i % 3}`}>
            <div className="learning-card-meta">
              <span>{a.category}</span>
              <span>{a.minutes} min read</span>
            </div>
            <h2>
              <Link href={a.href}>{a.title}</Link>
            </h2>
            <p>{a.description}</p>
            <Link
              href={a.href}
              className="learning-card-link"
              aria-label={`Take a bite: ${a.title}`}
            >
              Take a bite <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="library-empty">
          <h2>Nothing on this plate yet.</h2>
          <p>Try a broader phrase, such as “title,” “Google,” or “report.”</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Show every read
          </button>
        </div>
      )}
    </div>
  );
}
