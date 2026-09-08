import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import type { AppTab, Device, Market } from "@/lib/seo/types";
import { isMarket } from "@/lib/seo/markets";
import { decodePlays, parseCompare, parseDevice, parseTab } from "@/lib/seo/share";

const TABS: AppTab[] = ["overview", "serp", "audit", "keywords", "gsc", "coach"];

export type AppSearch = {
  url?: string;
  tab?: AppTab;
  kw?: string;
  demo?: boolean;
  market?: Market;
  plays?: string;
  device?: Device;
  compare?: boolean;
};

export const Route = createFileRoute("/app")({
  validateSearch: (s: Record<string, unknown>): AppSearch => ({
    url: typeof s.url === "string" && s.url ? s.url : undefined,
    tab: parseTab(s.tab) ?? (TABS.includes(s.tab as AppTab) ? (s.tab as AppTab) : undefined),
    kw: typeof s.kw === "string" && s.kw ? s.kw : undefined,
    demo: s.demo === true || s.demo === 1 || s.demo === "true" || s.demo === "1" ? true : undefined,
    market: isMarket(s.market) ? s.market : undefined,
    plays: decodePlays(s.plays).length ? decodePlays(s.plays).join(",") : undefined,
    device: parseDevice(s.device),
    compare: parseCompare(s.compare),
  }),
  head: () => ({ meta: [{ title: "Rankframe Lab — audit, SERP scene, plays" }, { name: "robots", content: "noindex" }] }),
  component: AppPage,
});

function AppPage() {
  return <AppShell />;
}
