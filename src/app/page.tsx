import type { Metadata } from "next";
import { Landing } from "@/components/marketing";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "RankSushi",
            url: "https://ranksushi.com",
            logo: "https://ranksushi.com/favicon.svg",
            description:
              "Website audits, Search Console insights, and evidence-grounded content tools.",
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Landing />
    </>
  );
}
