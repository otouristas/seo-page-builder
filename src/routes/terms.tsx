import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Rankframe" }] }),
  component: () => (
    <LegalPage title="Terms of service" updated="September 2026">
      <h2>What Rankframe is</h2>
      <p>Rankframe is an analysis and simulation tool. Modeled positions, difficulty scores and click estimates are estimates produced by a documented model. They are not Google rankings and not a guarantee of any outcome.</p>
      <h2>Acceptable use</h2>
      <p>Analyze pages you are allowed to fetch. Do not use the service to overload third-party sites, to scrape at volume, or to bypass access controls. Live lookups are limited per user per day.</p>
      <h2>Accounts</h2>
      <p>Accounts are optional. Sign in to save Search Console imports and to pull live page-one results (limited per user per day). There are no paid plans.</p>
      <h2>Liability</h2>
      <p>The service is provided as is. To the extent permitted by law, Rankframe is not liable for decisions made on the basis of modeled data.</p>
      <h2>Trademarks</h2>
      <p>Google is a trademark of Google LLC. Rankframe is not affiliated with or endorsed by Google, DataForSEO, or any site shown in a scene.</p>
    </LegalPage>
  ),
});
