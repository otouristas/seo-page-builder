import { Maki } from "@/components/maki";
import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main" className="standalone">
      <Maki pose="thinking" />
      <span className="eyebrow">404 · OFF THE MENU</span>
      <h1>This roll got away.</h1>
      <p>We couldn’t find that page. Let’s get you back to something useful.</p>
      <ButtonLink href="/">Back to RankSushi</ButtonLink>
    </main>
  );
}
