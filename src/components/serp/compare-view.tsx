import type { Market, Niche } from "@/lib/seo/types";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { SerpStage } from "./serp-stage";

/** Before/after split of the same scene. */
export function CompareView({ niche, score, appliedIds, market }: { niche: Niche; score: number; appliedIds: string[]; market: Market }) {
  const before = composeScene(niche, score, []);
  const after = composeScene(niche, score, appliedIds);
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[
        { label: `Before · ${rankLabel(before.rank)}`, scene: before },
        { label: `After ${appliedIds.length} plays · ${rankLabel(after.rank)}`, scene: after },
      ].map((s) => (
        <div key={s.label} className="min-w-0">
          <div className="mb-2 font-mono text-[11px] tracking-[0.16em] text-fg-muted uppercase">{s.label}</div>
          <SerpStage scene={s.scene} keyword={niche.keyword} market={market} intent={niche.intent} compact label={s.label.split(" · ")[0]} />
        </div>
      ))}
    </div>
  );
}
