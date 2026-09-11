"use client";
import { useState } from "react";
/**
 * A project's own logo when we have one, falling back to its monogram when the
 * image is missing or blocked. Kept client side so a broken logo never shows.
 */
export function SiteMark({
  name,
  logo,
  size = 30,
  className = "project-avatar",
}: {
  name: string;
  logo?: string | null;
  size?: number;
  className?: string;
}) {
  /* Remembering which address failed resets the fallback when the logo changes. */
  const [failed, setFailed] = useState("");
  const usable =
    !!logo &&
    failed !== logo &&
    /^https?:\/\//i.test(logo) &&
    logo.length < 2048;
  return usable ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${className} site-mark-image`}
      src={logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(logo)}
    />
  ) : (
    <span className={className} aria-hidden="true">
      {name.trim()[0]?.toUpperCase() || "·"}
    </span>
  );
}
