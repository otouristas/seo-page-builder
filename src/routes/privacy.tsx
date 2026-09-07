import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Rankframe" }] }),
  component: () => (
    <LegalPage title="Privacy" updated="September 2026">
      <h2>What we collect</h2>
      <p>When you analyze a URL, Rankframe fetches that public page from our server and keeps an anonymous event (a hash of the domain and a timestamp) to power the counters on the landing page. The page content is not stored.</p>
      <p>When you sign in with Google or X we store the profile fields the provider returns (name, email, avatar) and a session. When you import a Search Console export while signed in, the rows you upload are stored so you can reopen them. You can clear them from the Search Console tab.</p>
      <h2>Live results</h2>
      <p>Live page-one lookups are sent to DataForSEO as a keyword plus market. We count lookups per user per day to enforce the limit. No page content or personal data is sent.</p>
      <h2>Cookies</h2>
      <p>One session cookie for sign-in. No advertising or cross-site tracking cookies.</p>
      <h2>Your rights</h2>
      <p>Email us to export or delete everything tied to your account. We answer within 30 days.</p>
    </LegalPage>
  ),
});
