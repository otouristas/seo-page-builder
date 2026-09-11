import type { PlanId, PlanEntitlements } from "./types";
export const STARTER_TRIAL = {
  price: 1,
  days: 3,
  offer: "starter-trial-v1",
  limits: { projects: 1, pages: 20, drafts: 3, answers: 3, serps: 3 },
} as const;
export const PLANS: Record<
  PlanId,
  { name: string; price: number; description: string; limits: PlanEntitlements }
> = {
  free: {
    name: "A little taste",
    price: 0,
    description: "See what your website is serving.",
    limits: { projects: 1, pages: 1, drafts: 0, answers: 0, serps: 0 },
  },
  maki: {
    name: "Maki",
    price: 29,
    description: "One website. A clearer way forward.",
    limits: { projects: 1, pages: 200, drafts: 20, answers: 40, serps: 20 },
  },
  nigiri: {
    name: "Nigiri",
    price: 79,
    description: "For growing businesses with an appetite.",
    limits: { projects: 3, pages: 750, drafts: 75, answers: 120, serps: 75 },
  },
  omakase: {
    name: "Omakase",
    price: 149,
    description: "More websites. Everything on the menu.",
    limits: {
      projects: 10,
      pages: 2000,
      drafts: 200,
      answers: 300,
      serps: 200,
    },
  },
};
export const PAID_PLANS = ["maki", "nigiri", "omakase"] as const;
/** The plan name people recognise from pricing, including the paid trial. */
export function planLabel(plan: string, phase?: string) {
  if (phase === "trial") return "$1 trial";
  return plan === "free" || !isPlan(plan) ? "Free" : PLANS[plan].name;
}
/** One explanation of a reached project allowance, shared by API and UI. */
export function projectLimitMessage(
  plan: string,
  limit: number,
  phase?: string,
) {
  return `Your ${planLabel(plan, phase)} plan includes ${limit} project${limit === 1 ? "" : "s"}, and this workspace already uses ${limit === 1 ? "it" : "them"}. Open the project you already have, or upgrade your plan to add another website.`;
}
export function isPlan(value: unknown): value is PlanId {
  return typeof value === "string" && Object.hasOwn(PLANS, value);
}
export const NAV = [
  { id: "serp-studio", label: "SERP Studio", icon: "focus" },
  { id: "overview", label: "Overview", icon: "home" },
  { id: "opportunities", label: "Opportunities", icon: "sparkles" },
  { id: "audits", label: "Audits", icon: "scan" },
  { id: "search-console", label: "Search Console", icon: "chart" },
  { id: "content-studio", label: "Content Studio", icon: "pen" },
  { id: "ai-visibility", label: "AI Visibility", icon: "orbit" },
  { id: "reports", label: "Reports", icon: "file" },
  { id: "settings", label: "Settings", icon: "settings" },
] as const;
export type AppSection = (typeof NAV)[number]["id"];
