/** Owner-configurable outbound links. Empty string hides the link. */
export const LINKS = {
  x: "https://x.com/rankframe",
  github: "https://github.com/otouristas/seo-page-builder",
  newsletter: "",
  email: "hello@rankframe.app",
  status: "",
};

export const PRODUCT_NAV: { label: string; tab: "serp" | "audit" | "keywords" | "gsc" | "coach" | "overview"; description: string }[] = [
  { label: "SERP Lab", tab: "serp", description: "A Google-like results page where plays move your result." },
  { label: "Audit", tab: "audit", description: "12 weighted on-page checks with fix copy and a snippet editor." },
  { label: "Keywords", tab: "keywords", description: "Stage any query as a new scene in one click." },
  { label: "Search Console", tab: "gsc", description: "Drop a GSC export, spot striking-distance queries." },
  { label: "Coach", tab: "coach", description: "Ask why you're not ranking and what to do first." },
  { label: "Overview", tab: "overview", description: "Scores, snapshot facts and your quick wins." },
];
