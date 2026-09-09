/**
 * Resolve a favicon without sending the URL through a third-party tracking
 * service. The browser will fall back to the monogram when the origin does
 * not expose a favicon or blocks the request.
 */
export function siteIconUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return `${url.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export function safeIconUrl(value: string | null | undefined, base: string) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}
