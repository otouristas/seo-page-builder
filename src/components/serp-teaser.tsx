"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Focus,
  Search,
  Sparkles,
} from "lucide-react";
import { RECORDED_SCENE } from "@/lib/studio/recorded";
import { hostName } from "@/lib/studio/scene";
export function SerpTeaser() {
  const [changed, setChanged] = useState(false);
  const { page, serps } = RECORDED_SCENE;
  const serp = serps[0];
  return (
    <section
      className="serp-teaser"
      aria-label="Interactive SERP Studio preview"
    >
      <div className="teaser-toolbar">
        <span>
          <Focus size={17} /> THE SERP STUDIO
        </span>
        <span className="teaser-status">
          <span /> Recorded Google evidence
        </span>
        <Link href="/demo">
          Open the studio <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="teaser-body">
        <div className="teaser-director">
          <span className="eyebrow">YOUR PAGE HAS A PART TO PLAY.</span>
          <h2>
            See who’s there.
            <br />
            See your <em>next move.</em>
          </h2>
          <p>
            A real search scene. Your page on the workbench. Changes you can
            see, edit, and take into the world.
          </p>
          <button
            className={`teaser-move ${changed ? "tried" : ""}`}
            onClick={() => setChanged(!changed)}
            aria-pressed={changed}
          >
            {changed ? <Check size={20} /> : <Sparkles size={20} />}
            <span>
              <strong>
                {changed
                  ? "A clearer title. Take a look →"
                  : "Try a clearer page title"}
              </strong>
              <small>
                {changed
                  ? "Click again to see the original"
                  : "Click to watch the preview change"}
              </small>
            </span>
            <ArrowRight size={18} />
          </button>
          <Link href="/demo" className="text-link">
            Take the interactive walkthrough <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="teaser-search-scene">
          <div className="teaser-query">
            <Search size={16} />
            <strong>{serp.keyword}</strong>
            <span>US · desktop</span>
          </div>
          <ol>
            {serp.results?.slice(0, 3).map((r) => (
              <li key={r.url}>
                <span>{r.rank_group ?? "—"}</span>
                <div>
                  <small>{hostName(r.url)}</small>
                  <strong>{r.title}</strong>
                </div>
              </li>
            ))}
          </ol>
          <div className="teaser-connector">
            <ArrowDown size={15} />
            <span>Your page · outside this returned set</span>
          </div>
          <div className={`teaser-your-page ${changed ? "changed" : ""}`}>
            <div>
              <span>ranksushi.vercel.app</span>
              <b>{changed ? "DRAFT PREVIEW" : "FETCHED PAGE"}</b>
            </div>
            <h3>{changed ? "SEO software | RankSushi" : page.title}</h3>
            <p>{page.description}</p>
          </div>
        </div>
      </div>
      <div className="teaser-footer">
        <span>Real results. Visible reasoning. Editable next steps.</span>
        <small>
          Google snapshot:{" "}
          {new Date(serp.observedAt)
            .toISOString()
            .slice(0, 16)
            .replace("T", " ")}{" "}
          UTC. A draft does not change a measured rank.
        </small>
      </div>
    </section>
  );
}
