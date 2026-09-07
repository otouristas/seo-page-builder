import { Container, Marquee } from "@/components/patterns";

const MARKS = ["Stripe", "Ahrefs", "Skroutz", "Notion", "Shopify", "Booking.com", "Linear", "Vercel", "HubSpot", "Zapier"];

export function LogoStrip() {
  return (
    <div className="py-12">
      <Container>
        <p className="text-center font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Public pages we've modeled in case studies · subjects, not customers</p>
      </Container>
      <Marquee className="mt-6">
        {MARKS.map((m) => (
          <span key={m} className="font-display text-2xl font-semibold tracking-tight text-fg-subtle/70 transition-colors hover:text-fg">
            {m}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
