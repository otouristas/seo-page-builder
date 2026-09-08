import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/api/", "/auth/", "/login", "/demo", "/share/"],
    },
    sitemap: "https://ranksushi.com/sitemap.xml",
    host: "https://ranksushi.com",
  };
}
