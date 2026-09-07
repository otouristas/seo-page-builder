/// <reference types="vite/client" />
import { HeadContent, Link, Outlet, Scripts, createRootRoute, type ErrorComponentProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "@/styles/app.css?url";

const SITE = "Rankframe";
const DESCRIPTION =
  "Paste any URL. See where it lands on a Google-like results page, then run the plays that move it. An SEO lab, not a ranking guarantee.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE} — See where your page lands on Google. Then move it.` },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#0a0f1e" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE },
      { property: "og:title", content: `${SITE} — the SEO lab` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og.svg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="ink">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-dot-grid mask-radial opacity-60" aria-hidden />
      <div className="relative text-center">
        <p className="font-mono text-[12px] tracking-[0.2em] text-signal uppercase">404</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">This page is off the SERP.</h1>
        <p className="mt-3 text-fg-muted">Nothing lives at this address. Try the lab or head home.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/"
            className="h-11 rounded-full bg-signal px-5 font-medium text-ink-900 leading-[44px] hover:bg-signal-600"
          >
            Back home
          </Link>
          <Link
            to="/app"
            className="h-11 rounded-full border border-ink-600 px-5 font-medium leading-[44px] hover:border-fg-muted"
          >
            Open the lab
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorPage({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[12px] tracking-[0.2em] text-danger uppercase">Something broke</p>
        <h1 className="mt-4 font-display text-3xl tracking-tight">The lab hit an error.</h1>
        <pre className="mt-4 overflow-auto rounded-xl bg-ink-800 p-4 text-left font-mono text-[12px] text-fg-muted">
          {message}
        </pre>
        <a href="/" className="mt-6 inline-block text-peri underline-offset-4 hover:underline">
          Reload home
        </a>
      </div>
    </main>
  );
}
