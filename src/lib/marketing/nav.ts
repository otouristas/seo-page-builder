import { KeyRound, LayoutDashboard, MessageCircle, Search, ShieldCheck, Upload, BarChart3, BookOpen, Tag } from "lucide-react";

export const PRODUCT_ICONS = {
  serp: Search,
  audit: ShieldCheck,
  keywords: KeyRound,
  gsc: Upload,
  coach: MessageCircle,
  overview: LayoutDashboard,
} as const;

export type Pillar = {
  id: "product" | "proof" | "case-studies" | "pricing";
  label: string;
  /** One-line description shown in menus. */
  hint: string;
  /** Marketing indicator shown as "N options"-style count. */
  count: string;
  /** Landing-page section id that marks this item active while in view. */
  section: string;
  to: "/" | "/pricing";
  hash?: string;
  icon: typeof Search;
  art: "serp" | "gauge" | "compare" | "pricing";
};

/** Primary navigation. Product opens the tab menu; the rest scroll to landing sections or route to pricing. */
export const PILLARS: Pillar[] = [
  { id: "product", label: "Product", hint: "Audit, scenes, plays & coach", count: "6 tabs", section: "product", to: "/", hash: "product", icon: Search, art: "serp" },
  { id: "proof", label: "Proof", hint: "Indicators & live counters", count: "5 indicators", section: "proof", to: "/", hash: "proof", icon: BarChart3, art: "gauge" },
  { id: "case-studies", label: "Case studies", hint: "Three pages, three intents", count: "3 studies", section: "case-studies", to: "/", hash: "case-studies", icon: BookOpen, art: "compare" },
  { id: "pricing", label: "Pricing", hint: "Free to run, pay to keep", count: "3 plans", section: "pricing", to: "/pricing", icon: Tag, art: "pricing" },
];

/** Quick chips in the mobile menu: each doubles as a marketing indicator. */
export const MENU_CHIPS: { label: string; hint: string; tab: "serp" | "audit" | "gsc"; accent?: boolean }[] = [
  { label: "SERP Lab", hint: "10 slots, plays move you", tab: "serp", accent: true },
  { label: "Audit", hint: "12 weighted checks", tab: "audit" },
  { label: "Live SERP", hint: "8 lookups a day", tab: "gsc" },
];
