import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-[12px] font-semibold tracking-[0.16em] uppercase">
          Rankframe
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Σύνδεση</h1>
        <p className="mt-2 text-[14px] leading-6 text-fg-muted">
          Google λογαριασμός για το workspace σου. Οι ιδιότητες Search Console δεν έρχονται αυτόματα
          από αυτό το OAuth — φορτώνεις GSC export μετά τη σύνδεση.
        </p>
        {authEnabled ? (
          <div className="mt-6 space-y-2">
            {GROK_PROVIDERS.filter((p) => p.idp === "google" || p.idp === "twitter").map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
                className="h-12 w-full rounded-xl border border-border bg-bg-elevated text-[14px] font-medium"
              >
                Συνέχεια με {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-fg-muted">Το sign-in είναι απενεργοποιημένο.</p>
        )}
      </div>
    </main>
  );
}
