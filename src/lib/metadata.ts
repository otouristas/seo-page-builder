import type { Metadata } from "next";
import { CANONICAL_URL } from "./utils";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | RankSushi`,
      description,
      url: `${CANONICAL_URL}${path}`,
      siteName: "RankSushi",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "RankSushi — useful insights, served fresh",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
