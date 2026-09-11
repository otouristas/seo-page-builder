"use client";
import { COUNTRIES, LANGUAGES } from "@/lib/locales";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  ArrowRight,
  Globe2,
  Check,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo, Maki } from "./maki";
import { Button, Badge, SectionLabel } from "./ui";
import { createClient } from "@/lib/supabase/client";
import { request, type RequestError } from "./workspace/shared";
import { SiteMark } from "./site-mark";
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
            Google sign-in identifies your account. After sign-in, you’ll create
            a RankSushi project first, then connect Google Search Console inside
            that project and choose its property. The read-only permission is
            requested separately by Google.
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
type SiteProfile = {
  url: string;
  name: string;
  description: string;
  logo: string | null;
  language: string;
  country: string;
  title: string;
  found: string[];
};
const hostOf = (value: string) => {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
      .hostname;
  } catch {
    return value.replace(/^https?:\/\//i, "").split("/")[0];
  }
};
/** A typed address is worth reading once it can plausibly resolve. */
const looksComplete = (value: string) =>
  /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/.*)?$/i.test(value.trim());
export function Onboarding({
  website = "",
  plan = "",
  gsc = "",
}: {
  website?: string;
  plan?: string;
  gsc?: string;
}) {
  const [url, setUrl] = useState(website),
    [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [country, setCountry] = useState("US"),
    [language, setLanguage] = useState("en"),
    [logo, setLogo] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(
      gsc === "error"
        ? "Google Search Console connection did not finish. Try again to choose a property."
        : "",
    ),
    [limitReached, setLimitReached] = useState(false),
    [properties, setProperties] = useState<
      { siteUrl: string; permissionLevel: string }[]
    >([]),
    [property, setProperty] = useState(""),
    [lookup, setLookup] = useState<"idle" | "loading" | "done" | "failed">(
      "idle",
    ),
    [lookupNote, setLookupNote] = useState("");
  const router = useRouter();
  const loaded = useRef(false);
  /* Fields a person has touched are never overwritten by a later fetch. */
  const edited = useRef({
    name: false,
    description: false,
    country: false,
    language: false,
  });
  const lastLookup = useRef("");
  const lookupId = useRef(0);
  const chooseProperty = gsc === "choose";
  const projectFirst = gsc === "start";
  const propertyWebsite = (value: string) =>
    value.startsWith("sc-domain:")
      ? `https://${value.slice(10).toLowerCase()}/`
      : value;
  const readWebsite = useCallback(async (value: string, force = false) => {
    const target = value.trim();
    if (!looksComplete(target)) return;
    const key = hostOf(target).toLowerCase();
    if (!force && lastLookup.current === key) return;
    lastLookup.current = key;
    const id = ++lookupId.current;
    setLookup("loading");
    setLookupNote("");
    try {
      const result = await request<{
        profile: SiteProfile | null;
        reason?: string;
        fallback?: { url: string; name: string };
      }>("/api/site-profile", { url: target });
      if (id !== lookupId.current) return;
      const profile = result.profile;
      if (!profile) {
        if (result.fallback?.name && !edited.current.name)
          setName((current) => current || result.fallback!.name);
        setLookup("failed");
        setLookupNote(
          result.reason ||
            "We could not read that website automatically. Fill in the details below.",
        );
        return;
      }
      if (profile.name && !edited.current.name) setName(profile.name);
      if (profile.description && !edited.current.description)
        setDescription(profile.description);
      if (profile.country && !edited.current.country)
        setCountry(profile.country);
      if (profile.language && !edited.current.language)
        setLanguage(profile.language);
      setLogo(profile.logo);
      setLookup("done");
      setLookupNote(
        profile.found.length
          ? `Filled in from ${hostOf(profile.url)}. Edit anything below.`
          : `We reached ${hostOf(profile.url)} but it declares very little. Add the details below.`,
      );
    } catch (e) {
      if (id !== lookupId.current) return;
      setLookup("failed");
      setLookupNote((e as Error).message);
    }
  }, []);
  /* Reading starts on its own shortly after the address stops changing. */
  useEffect(() => {
    if (!url.trim() || !looksComplete(url)) return;
    const timer = setTimeout(() => readWebsite(url), 900);
    return () => clearTimeout(timer);
  }, [url, readWebsite]);
  useEffect(() => {
    if (gsc !== "choose" || loaded.current) return;
    loaded.current = true;
    setBusy(true);
    request<{
      properties: { siteUrl: string; permissionLevel: string }[];
    }>("/api/gsc/onboarding/properties")
      .then((result) => {
        setProperties(result.properties);
        if (result.properties.length === 1) {
          const only = propertyWebsite(result.properties[0].siteUrl);
          setProperty(result.properties[0].siteUrl);
          setUrl(only);
          setName(new URL(only).hostname);
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }, [gsc]);
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
          <SectionLabel>
            {chooseProperty
              ? "Pick your first plate"
              : projectFirst
                ? "Set the table first"
                : "Make yourself at home"}
          </SectionLabel>
          <h1>
            {chooseProperty
              ? "Choose your website."
              : projectFirst
                ? "Create your project."
                : "Bring your website."}
            <br />
            {chooseProperty
              ? "We’ll bring the evidence."
              : projectFirst
                ? "Then connect its search evidence."
                : "We’ll fill in the rest."}
          </h1>
          <p>
            {chooseProperty
              ? "Select one verified Search Console property. Each property becomes its own RankSushi project."
              : projectFirst
                ? "Start with a clear home for this website. Once it exists, connect Google Search Console from that project’s Connections panel."
                : "Paste your address and we’ll read your website’s own name, description and logo. Everything stays editable."}
          </p>
          <div className="onboarding-mascot">
            <Maki
              pose={busy || lookup === "loading" ? "thinking" : "wave"}
              motion={busy || lookup === "loading" ? "roll" : "idle"}
            />
            <span className="onboarding-mascot-note" aria-live="polite">
              {lookup === "loading"
                ? `Maki is reading ${hostOf(url)}…`
                : busy
                  ? chooseProperty
                    ? "Maki is checking Google’s property tray…"
                    : projectFirst
                      ? "Maki is rolling your project together…"
                      : "Maki is rolling your first project together…"
                  : chooseProperty
                    ? "Maki says: one property, one project, zero spreadsheet archaeology."
                    : projectFirst
                      ? "Maki says: project first, property second. Nice and tidy."
                      : "Maki says: bring the URL. We’ll bring the snacks."}
            </span>
          </div>
          <ul className="onboarding-checks">
            <li>
              <Check size={16} />
              {chooseProperty
                ? "Choose a verified Search Console property"
                : projectFirst
                  ? "Create a dedicated project for this website"
                  : "Your website’s details, filled in for you"}
            </li>
            <li>
              <Check size={16} />
              {chooseProperty
                ? "Create one project for that website"
                : projectFirst
                  ? "Connect Search Console inside that project"
                  : "Connect Search Console when you’re ready"}
            </li>
            <li>
              <Check size={16} />
              {chooseProperty
                ? "Import search evidence after setup"
                : projectFirst
                  ? "Choose its verified property and import evidence"
                  : "Review every change before you publish"}
            </li>
          </ul>
        </div>
        <form
          className="onboarding-form panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setLimitReached(false);
            try {
              if (chooseProperty) {
                const result = await request<{ project: { id: string } }>(
                  "/api/gsc/onboarding/properties",
                  { property, name, description, country, language },
                );
                router.push(`/app/${result.project.id}`);
                return;
              }
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
                {
                  name,
                  url,
                  description,
                  country,
                  language,
                  auditToken,
                  logo: logo || undefined,
                },
              );
              if (auditToken) sessionStorage.removeItem("ranksushi-free-audit");
              router.push(
                projectFirst
                  ? `/app/${result.project.id}/settings?gsc=onboarding${plan ? `&plan=${encodeURIComponent(plan)}` : ""}`
                  : `/app/${result.project.id}${plan ? `/settings?plan=${encodeURIComponent(plan)}` : ""}`,
              );
            } catch (e) {
              setError((e as Error).message);
              setLimitReached(
                (e as RequestError).code === "project_limit" ||
                  (e as RequestError).code === "read_only",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>
            {chooseProperty
              ? "Your first RankSushi project"
              : projectFirst
                ? "Create your first project"
                : "Your first ingredients"}
          </h2>
          <p>
            {chooseProperty
              ? "Google found these verified properties. Choose the website you want to work on first."
              : projectFirst
                ? "This project will be the home for one website. We’ll connect its Google Search Console property next."
                : "Tell us about one website you own or manage."}
          </p>
          {chooseProperty && (
            <div className="field">
              <label htmlFor="gsc-property">
                Google Search Console property
              </label>
              <select
                id="gsc-property"
                value={property}
                onChange={(e) => {
                  const nextProperty = e.target.value;
                  setProperty(nextProperty);
                  if (!nextProperty) return;
                  const nextUrl = propertyWebsite(nextProperty);
                  setUrl(nextUrl);
                  setName((current) => current || new URL(nextUrl).hostname);
                  readWebsite(nextUrl);
                }}
                required
                disabled={busy || !properties.length}
              >
                <option value="">
                  {busy ? "Loading verified properties…" : "Choose a website"}
                </option>
                {properties.map((item) => (
                  <option key={item.siteUrl} value={item.siteUrl}>
                    {item.siteUrl} · {item.permissionLevel.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {!busy && !properties.length && !error && (
                <p>No verified properties were returned by Google.</p>
              )}
            </div>
          )}
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
                onBlur={(e) => readWebsite(e.target.value)}
                maxLength={2048}
                required
                readOnly={chooseProperty}
                aria-describedby="website-lookup"
              />
            </div>
            <p id="website-lookup" className="field-hint">
              We read this page once to fill in the details below.
            </p>
          </div>
          {lookup !== "idle" && (
            <div className={`site-lookup ${lookup}`} aria-live="polite">
              {lookup === "loading" ? (
                <>
                  <LoaderCircle size={16} className="spin" />
                  <span>
                    <strong>Reading {hostOf(url)}…</strong>
                    <small>
                      Name, description and logo, straight from you.
                    </small>
                  </span>
                </>
              ) : (
                <>
                  <SiteMark
                    name={name || hostOf(url)}
                    logo={lookup === "done" ? logo : null}
                    size={34}
                    className="site-lookup-mark"
                  />
                  <span>
                    <strong>{name || hostOf(url)}</strong>
                    <small>{lookupNote}</small>
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => readWebsite(url, true)}
                    title="Read this website again"
                    aria-label="Read this website again"
                  >
                    <RefreshCw size={14} />
                  </button>
                </>
              )}
            </div>
          )}
          <div className="field">
            <label htmlFor="business-name">Business / project name</label>
            <input
              id="business-name"
              value={name}
              onChange={(e) => {
                edited.current.name = true;
                setName(e.target.value);
              }}
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
              onChange={(e) => {
                edited.current.description = true;
                setDescription(e.target.value);
              }}
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
                onChange={(e) => {
                  edited.current.country = true;
                  setCountry(e.target.value);
                }}
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
                onChange={(e) => {
                  edited.current.language = true;
                  setLanguage(e.target.value);
                }}
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
          {limitReached && (
            <div className="toolbar" style={{ marginBottom: 14 }}>
              <Link className="button primary" href="/app">
                Open my workspace <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
          <Button className="full" busy={busy}>
            {chooseProperty
              ? "Create project & import Search Console"
              : projectFirst
                ? "Create project & connect Search Console"
                : "Create my project"}{" "}
            <ArrowUpRight size={16} />
          </Button>
          <p className="small-note" style={{ marginTop: 15 }}>
            {chooseProperty
              ? "Your property stays read-only. We save the connection on this project and never publish website changes."
              : projectFirst
                ? "Next, we’ll open this project’s Connections panel so you can authorize Google and choose its verified property."
                : "We read only your website’s public homepage to fill this in, and save what you confirm. A recent free audit from this browser is saved with your project when available."}
          </p>
        </form>
      </main>
    </div>
  );
}
