import { ARTICLES, FEATURES, TOOL_PAGES } from "./content";
import { COLLECTIONS } from "./learning/content";
export function publicPages(): {
  path: string;
  title: string;
  group: string;
  updated?: string;
}[] {
  return [
    { path: "/", title: "RankSushi", group: "Product" },
    { path: "/features", title: "Features", group: "Product" },
    { path: "/pricing", title: "Pricing", group: "Product" },
    { path: "/tools", title: "Free tools", group: "Tools" },
    { path: "/sitemap", title: "Sitemap", group: "Resources" },
    ...Object.entries(ARTICLES)
      .filter(([key]) => key !== "help")
      .map(([key, a]) => ({
        path: `/${key}`,
        title: a.title,
        group: "About & policies",
      })),
    ...Object.entries(FEATURES).map(([key, a]) => ({
      path: `/features/${key}`,
      title: a.title,
      group: "Product",
    })),
    ...Object.entries(TOOL_PAGES).map(([key, a]) => ({
      path: `/tools/${key}`,
      title: a.title,
      group: "Tools",
    })),
    ...Object.entries(COLLECTIONS).flatMap(([key, articles]) => [
      {
        path: `/${key}`,
        title: (
          {
            learn: "The SEO kitchen",
            blog: "Fresh reads",
            help: "Help center",
          } as Record<string, string>
        )[key],
        group: "Resources",
      },
      ...articles.map((a) => ({
        path: `/${key}/${a.slug}`,
        title: a.title,
        group:
          key === "learn"
            ? "The SEO kitchen"
            : key === "blog"
              ? "Blog"
              : "Help center",
        updated: a.updated,
      })),
    ]),
  ];
}
