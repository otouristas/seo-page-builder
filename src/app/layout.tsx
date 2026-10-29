import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/inter";
import "./globals.css";
import "./studio.css";
import "./docs.css";
import { CANONICAL_URL } from "@/lib/utils";
export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: {
    default: "RankSushi — SEO audits, clear fixes & content tools",
    template: "%s | RankSushi",
  },
  description:
    "Turn website audits and Search Console data into your next useful action. SEO, answer readiness, editable content, and progress — served fresh.",
  openGraph: {
    type: "website",
    siteName: "RankSushi",
    locale: "en_US",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#F7F7EF" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      
<footer aria-label="Development and copyright">
      <p data-asg-copyright="notice" style={{ maxWidth: "80rem", margin: "1rem auto 0", padding: "0 1rem 1rem", fontSize: "0.75rem", lineHeight: 1.6 }}>
        <a href="/intellectual-property.html" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>Code &amp; development: AnotherSEOGuru, a company of Touristas Technologies. Copyright &amp; permitted use.</a>
      </p>
    </footer>
</body>
    </html>
  );
}
