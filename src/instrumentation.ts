export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    const { scrubEvent } = await import("./lib/monitoring");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: scrubEvent,
    });
  }
}
export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(...args);
  }
}
