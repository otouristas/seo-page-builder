import { AppError } from "../server/errors";
export async function providerJson<T>(
  url: string,
  init: RequestInit = {},
  timeout = 30_000,
): Promise<T> {
  const r = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(timeout),
  });
  if (!r.ok) {
    if (r.status === 400 && url === "https://oauth2.googleapis.com/token") {
      const error = await r.json().catch(() => ({}));
      if (error.error === "invalid_grant")
        throw new AppError(
          "Google authorization was revoked. Reconnect Search Console.",
          503,
          "provider_auth",
        );
    }

    if (r.status === 429)
      throw new AppError(
        "The provider is temporarily rate limited. This job can be retried.",
        429,
        "provider_rate_limit",
      );
    if (r.status === 401 || r.status === 403)
      throw new AppError(
        "The provider connection needs attention. Reconnect it in Settings.",
        503,
        "provider_auth",
      );
    throw new AppError(
      `The provider returned HTTP ${r.status}.`,
      502,
      "provider_error",
    );
  }
  return r.json() as Promise<T>;
}
