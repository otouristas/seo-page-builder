import type { ErrorEvent } from "@sentry/nextjs";
// Keep stacks and technical categories; never send prompts, tokens, bodies or identity.
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  delete event.extra;
  delete event.breadcrumbs;
  if (event.request) {
    event.request = {
      method: event.request.method,
      url: event.request.url
        ?.split("?")[0]
        .replace(/\/share\/[^/]+/, "/share/[token]"),
    };
  }
  if (event.contexts) {
    event.contexts = {
      runtime: event.contexts.runtime,
      browser: event.contexts.browser,
      os: event.contexts.os,
    };
  }
  if (event.message) event.message = "RankSushi operational event";
  for (const e of event.exception?.values || [])
    e.value =
      e.type === "AppError"
        ? "A validated application operation failed."
        : "An application or provider operation failed.";
  return event;
}
