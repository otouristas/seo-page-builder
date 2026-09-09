"use client";

/* The icon URL is user/provider supplied and intentionally stays a plain image
 * so a missing or unusual favicon can fail softly without blocking the page. */
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { siteIconUrl } from "@/lib/site-icons";

function hostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function SiteIcon({
  url,
  iconUrl,
  size = "small",
  className = "",
}: {
  url: string;
  iconUrl?: string | null;
  size?: "small" | "medium";
  className?: string;
}) {
  const candidates = useMemo(
    () => [...new Set([iconUrl, siteIconUrl(url)].filter(Boolean))] as string[],
    [iconUrl, url],
  );
  const candidateKey = `${url}|${iconUrl ?? ""}`;
  const [iconState, setIconState] = useState({ key: candidateKey, index: 0 });
  const host = hostname(url);
  const iconIndex = iconState.key === candidateKey ? iconState.index : 0;
  const src = candidates[iconIndex];

  return (
    <span
      className={`site-icon site-icon-${size} ${className}`.trim()}
      aria-hidden="true"
      title={host}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() =>
            setIconState({ key: candidateKey, index: iconIndex + 1 })
          }
        />
      ) : (
        <span className="site-icon-fallback">
          {host.charAt(0).toUpperCase() || "•"}
        </span>
      )}
    </span>
  );
}
