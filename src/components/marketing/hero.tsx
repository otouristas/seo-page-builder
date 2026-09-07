import { useNavigate } from "@tanstack/react-router";
import { ArrowDown, Sparkles } from "lucide-react";
import { UrlField } from "@/components/ui/url-field";
import { ButtonLink } from "@/components/ui/button";
import { Aurora, DotGrid, Noise, Container } from "@/components/patterns";
import { SerpClimb } from "@/components/serp/serp-climb";

const CHIPS = ["stripe.com/payments", "ahrefs.com/blog", "skroutz.gr"];

export function Hero() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden">
      <DotGrid className="mask-radial opacity-70" />
      <Aurora />
      <Noise />
      <Container className="relative grid items-center gap-12 pb-24 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-32 lg:pt-20">
        <div className="min-w-0 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-[12px] font-medium text-signal">
            <Sparkles className="size-3.5" /> New · live page one via DataForSEO, 8 lookups a day
          </span>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[72px]">
            See where your page lands on Google. <span className="text-gradient-signal">Then move it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted sm:text-lg">
            Paste any URL. Rankframe reads the page, stages a Google-like results page for its best keywords, and hands you the exact plays that lift it. A lab you can play with, not a promise.
          </p>
          <UrlField className="mt-8 max-w-xl" onSubmit={(url) => navigate({ to: "/app", search: { url } })} chips={CHIPS} autoFocus={false} />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-fg-muted">
            <ButtonLink to="/login" variant="ghost" size="sm" className="-ml-3">
              Sign in with Google
            </ButtonLink>
            <a href="#demo" className="inline-flex items-center gap-1 hover:text-fg">
              Watch the demo <ArrowDown className="size-3.5" />
            </a>
            <span className="hidden sm:inline">No card · 12 checks · modeled positions, labeled as such</span>
          </div>
        </div>
        <div className="relative mx-auto w-full min-w-0 max-w-md pb-6 lg:max-w-none">
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(199,255,59,0.18),transparent_70%)] blur-2xl" aria-hidden />
          <SerpClimb className="relative" />
        </div>
      </Container>
    </div>
  );
}
