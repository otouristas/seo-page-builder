import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { authConfigured, getAuth } = await import("@/lib/auth/server");
  if (!authConfigured()) {
    return Response.json({ error: "Sign-in is not configured on this deployment." }, { status: 503 });
  }
  const auth = await getAuth();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
