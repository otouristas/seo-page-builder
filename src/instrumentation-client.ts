// Load monitoring only when configured. No session replay or automatic identity capture.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void Promise.all([import("@sentry/nextjs"), import("./lib/monitoring")]).then(
    ([Sentry, { scrubEvent }]) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: scrubEvent,
      });
    },
  );
}
