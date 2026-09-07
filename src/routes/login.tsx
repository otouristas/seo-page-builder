import { createFileRoute, Link } from "@tanstack/react-router";
import { PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-[12px] font-semibold tracking-[0.16em] uppercase">
          Rankframe
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Sign in</h1>
        {authEnabled ? (
          <div className="mt-6 space-y-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
                className="h-12 w-full rounded-xl border border-ink-600 bg-ink-800 text-[14px] font-medium"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-fg-muted">Sign-in is not configured on this deployment.</p>
        )}
      </div>
    </main>
  );
}
