import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { PROVIDERS, signIn, type ProviderId } from "@/lib/auth/client";
import { getSessionInfo } from "@/server/session";
import { Aurora, DotGrid, Noise } from "@/components/patterns";
import { Logo } from "@/components/marketing/logo";
import { ButtonLink } from "@/components/ui/button";
import { SerpClimb } from "@/components/serp/serp-climb";

export const Route = createFileRoute("/login")({
  loader: () => getSessionInfo(),
  head: () => ({ meta: [{ title: "Sign in — Rankframe" }] }),
  component: Login,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3c-.5-1.5-.5-3.1 0-4.6V6.6H1.3c-1.7 3.4-1.7 7.4 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5Z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.2 8.2L23.3 22h-6.6l-5.2-6.8L5.6 22H2.5l7.7-8.8L1.5 2h6.7l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
    </svg>
  );
}

function Login() {
  const info = Route.useLoaderData();
  const [busy, setBusy] = useState<ProviderId | null>(null);
  const providers = PROVIDERS.filter((p) => info.providers.includes(p.providerId));

  async function go(id: ProviderId) {
    setBusy(id);
    try {
      await signIn(id, { callbackURL: "/app" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="ink relative grid min-h-dvh overflow-hidden lg:grid-cols-2">
      <DotGrid className="mask-radial opacity-60" />
      <Aurora />
      <Noise />
      <section className="relative hidden flex-col justify-between p-10 lg:flex">
        <Logo />
        <div className="mx-auto w-full max-w-md">
          <SerpClimb />
        </div>
        <p className="max-w-md text-[14px] text-fg-muted">Sign in to keep Search Console imports and to pull today's real page one. Everything else works as a guest.</p>
      </section>
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight lg:mt-0">Sign in</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
            {info.user ? `You're signed in as ${info.user.email}.` : "Keep your data between sessions and unlock live results. Search Console properties don't come from this login; you import an export after signing in."}
          </p>

          {info.user ? (
            <div className="mt-8 grid gap-2">
              <ButtonLink to="/app" variant="primary" size="lg" trailing={<ArrowRight className="size-4" />}>
                Open the lab
              </ButtonLink>
            </div>
          ) : info.authEnabled && providers.length ? (
            <div className="mt-8 space-y-2">
              {providers.map((p) => (
                <button key={p.providerId} type="button" onClick={() => go(p.providerId)} disabled={busy !== null} className="flex h-13 w-full items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 px-4 text-[15px] font-medium transition-colors hover:border-white/25 hover:bg-ink-700 disabled:opacity-60">
                  <span className="grid size-8 place-items-center rounded-full bg-white text-ink-900">{p.providerId === "google" ? <GoogleMark /> : <XMark />}</span>
                  Continue with {p.label}
                  {busy === p.providerId ? <LoaderCircle className="ml-auto size-4 animate-spin" /> : <ArrowRight className="ml-auto size-4 text-fg-muted" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-[14px] text-fg">
              Sign-in isn't configured on this deployment yet. Set <code className="font-mono text-[12px] text-warn">BETTER_AUTH_SECRET</code> and a Google client in the environment to enable it.
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-[13px] text-fg-muted">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <ButtonLink to="/app" variant="outline" size="lg" className="mt-6 w-full">
            Continue as a guest
          </ButtonLink>
          <p className="mt-6 text-[12px] leading-relaxed text-fg-subtle">
            By continuing you agree to the{" "}
            <Link to="/terms" className="text-fg-muted underline-offset-4 hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-fg-muted underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
