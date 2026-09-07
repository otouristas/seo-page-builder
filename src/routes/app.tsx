import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import type { AppTab } from "@/lib/seo/types";

const TABS: AppTab[] = ["overview", "serp", "audit", "keywords", "gsc", "coach"];

export type AppSearch = { url?: string; tab?: AppTab; kw?: string; demo?: boolean };

export const Route = createFileRoute("/app")({
  validateSearch: (s: Record<string, unknown>): AppSearch => ({
    url: typeof s.url === "string" && s.url ? s.url : undefined,
    tab: TABS.includes(s.tab as AppTab) ? (s.tab as AppTab) : undefined,
    kw: typeof s.kw === "string" && s.kw ? s.kw : undefined,
    demo: s.demo === true || s.demo === 1 || s.demo === "true" || s.demo === "1" ? true : undefined,
  }),
  head: () => ({ meta: [{ title: "Rankframe Lab — audit, SERP scene, plays" }, { name: "robots", content: "noindex" }] }),
  component: AppPage,
});

function AppPage() {
  return <AppShell />;
}
