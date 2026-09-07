import { KeyRound, LayoutDashboard, MessageCircle, Search, ShieldCheck, Upload } from "lucide-react";

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
  index: string;
  label: string;
  hint: string;
  /** Landing-page section id that marks this pillar active while in view. */
  section: string;
  to: "/" | "/pricing";
  hash?: string;
};

/** The header pillars. Product opens the tab menu; the rest scroll to landing sections or route to pricing. */
export const PILLARS: Pillar[] = [
  { id: "product", index: "01", label: "Product", hint: "Six tabs, one stage", section: "product", to: "/", hash: "product" },
  { id: "proof", index: "02", label: "Proof", hint: "Indicators and counters", section: "proof", to: "/", hash: "proof" },
  { id: "case-studies", index: "03", label: "Case studies", hint: "Three pages, three intents", section: "case-studies", to: "/", hash: "case-studies" },
  { id: "pricing", index: "04", label: "Pricing", hint: "Free to run, pay to keep", section: "pricing", to: "/pricing" },
];
