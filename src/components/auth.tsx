"use client";
import { COUNTRIES, LANGUAGES } from "@/lib/locales";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, ArrowRight, Globe2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo, Maki } from "./maki";
import { Button, Badge, SectionLabel } from "./ui";
import { createClient } from "@/lib/supabase/client";
import { request } from "./workspace/shared";
export function LoginForm({
  next = "/app",
  expired = false,
}: {
  next?: string;
  expired?: boolean;
}) {
  const [email, setEmail] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(
      expired
        ? "This sign-in link expired or has already been used. Request a fresh link below."
        : "",
    ),
    [sent, setSent] = useState(false);
  return (
    <div className="auth-layout">
      <aside className="auth-art">
        <Link href="/" aria-label="RankSushi home">
          <Logo />
        </Link>
        <div>
          <SectionLabel>Your next good move starts here</SectionLabel>
          <h2>
            A little clarity.
            <br />A lot more possibility.
          </h2>
          <p>
            From “what should I fix?” to “I know what to do next.” Welcome to a
            calmer way to grow.
          </p>
          <Maki pose="wave" />
        </div>
        <p className="small-note">
          Useful insights, served fresh. No ranking guarantees.
        </p>
      </aside>
      <main id="main" className="auth-content">
        <div className="auth-form">
          <Link href="/" className="auth-mobile-logo">
            <Logo />
          </Link>
          <Badge tone="green">WELCOME TO THE TABLE</Badge>
          <h1 style={{ marginTop: 18 }}>Let’s get rolling.</h1>
          <p>
            Sign in or create your RankSushi account. Your next useful insight
            is waiting.
          </p>
          <Button
            className="full"
            variant="secondary"
            busy={busy === "google"}
            onClick={async () => {
              setBusy("google");
              setError("");
              try {
                const db = createClient();
                const result = await db.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                  },
                });
                if (result.error) throw result.error;
              } catch {
                setError(
                  "Google sign-in is unavailable right now. Try an email link or check back shortly.",
                );
                setBusy("");
              }
            }}
          >
            <span className="google-g">G</span>Continue with Google
          </Button>
          <div className="form-divider">or use your email</div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy("email");
              setError("");
              try {
                await request("/api/auth/email", { email, next });
                setSent(true);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy("");
              }
            }}
          >
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                maxLength={254}
                required
              />
            </div>
            <Button className="full" busy={busy === "email"}>
              <Mail size={15} />
              {sent ? "Send a new link" : "Email me a sign-in link"}
              <ArrowRight size={15} />
            </Button>
          </form>
          {sent && (
            <p role="status" className="form-success">
              Check your inbox for your sign-in link. No password to remember.
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <p className="small-note" style={{ marginTop: 22 }}>
            Google sign-in identifies your account. Search Console access is
            optional and requested separately inside your workspace.
          </p>
          <p className="small-note" style={{ marginTop: 15 }}>
            By continuing, you agree to the{" "}
            <Link href="/terms" className="inline-link">
              Terms
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="/privacy" className="inline-link">
              Privacy notice
            </Link>
            .
          </p>
          <div className="auth-demo-link">
            <Link href="/demo">
              Just looking? Explore the example workspace{" "}
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
export function Onboarding({
  website = "",
  plan = "",
}: {
  website?: string;
  plan?: string;
}) {
  const [url, setUrl] = useState(website),
    [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [country, setCountry] = useState("US"),
    [language, setLanguage] = useState("en"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <div className="onboarding-wrap">
      <header className="container site-header">
        <Link href="/">
          <Logo />
        </Link>
        <span className="small-note">One small step. A clearer picture.</span>
      </header>
      <main id="main" className="onboarding-grid container">
        <div className="onboarding-copy">
          <SectionLabel>Make yourself at home</SectionLabel>
          <h1>
            Bring your website.
            <br />
            We’ll bring a fresh perspective.
          </h1>
          <p>
            A little context helps us turn what we find into something useful
            for your business.
          </p>
          <div className="onboarding-mascot">
            <Maki
              pose={busy ? "thinking" : "wave"}
              motion={busy ? "roll" : "idle"}
            />
            <span className="onboarding-mascot-note" aria-live="polite">
              {busy
                ? "Maki is rolling your first project together…"
                : "Maki says: bring the URL. We’ll bring the snacks."}
            </span>
          </div>
          <ul className="onboarding-checks">
            <li>
              <Check size={16} /> Start with a website audit
            </li>
            <li>
              <Check size={16} /> Connect Search Console when you’re ready
            </li>
            <li>
              <Check size={16} /> Review every change before you publish
            </li>
          </ul>
        </div>
        <form
          className="onboarding-form panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              let auditToken: string | undefined;
              try {
                const saved = JSON.parse(
                  sessionStorage.getItem("ranksushi-free-audit") || "null",
                );
                const normalized = new URL(
                  /^https?:\/\//i.test(url) ? url : `https://${url}`,
                ).href;
                if (saved?.url === normalized) auditToken = saved.token;
              } catch {}
              const result = await request<{ project: { id: string } }>(
                "/api/projects",
                { name, url, description, country, language, auditToken },
              );
              if (auditToken) sessionStorage.removeItem("ranksushi-free-audit");
              router.push(
                `/app/${result.project.id}${plan ? `/settings?plan=${encodeURIComponent(plan)}` : ""}`,
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Your first ingredients</h2>
          <p>Tell us about one website you own or manage.</p>
          <div className="field">
            <label htmlFor="website">Website URL</label>
            <div className="input-with-icon">
              <Globe2 size={17} />
              <input
                id="website"
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                maxLength={2048}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="business-name">Business / project name</label>
            <input
              id="business-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call your project?"
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="business-description">
              What do you do, and who is it for?
            </label>
            <textarea
              id="business-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={2000}
              required
              placeholder="We help… with… in…"
            />
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="country">Target country</label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                {COUNTRIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="language">Content language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              >
                {LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p>Language code: en, el, de…</p>
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button className="full" busy={busy}>
            Create my project <ArrowUpRight size={16} />
          </Button>
          <p className="small-note" style={{ marginTop: 15 }}>
            No Search Console connection required. A recent free audit from this
            browser is saved with your project when available.
          </p>
        </form>
      </main>
    </div>
  );
}
