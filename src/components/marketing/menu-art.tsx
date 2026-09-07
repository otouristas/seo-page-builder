import type { Pillar } from "@/lib/marketing/nav";

/** Small illustrated thumbnails for menu rows. Pure SVG, no assets. */
export function MenuArt({ kind }: { kind: Pillar["art"] }) {
  if (kind === "serp") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <rect width="120" height="120" fill="#f6f7fb" />
        <rect x="12" y="14" width="96" height="14" rx="7" fill="#fff" stroke="#dadce0" />
        <rect x="12" y="40" width="64" height="6" rx="3" fill="#1a0dab" />
        <rect x="12" y="50" width="88" height="4" rx="2" fill="#c9cdd3" />
        <rect x="8" y="62" width="104" height="30" rx="8" fill="#f6ffdf" stroke="#a8e01f" strokeWidth="2.5" />
        <rect x="16" y="70" width="56" height="6" rx="3" fill="#1a0dab" />
        <rect x="16" y="80" width="80" height="4" rx="2" fill="#c9cdd3" />
        <rect x="12" y="102" width="48" height="6" rx="3" fill="#1a0dab" />
      </svg>
    );
  }
  if (kind === "gauge") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <rect width="120" height="120" fill="#121a33" />
        <circle cx="60" cy="64" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" strokeDasharray="160 214" strokeLinecap="round" transform="rotate(135 60 64)" />
        <circle cx="60" cy="64" r="34" fill="none" stroke="#c7ff3b" strokeWidth="9" strokeDasharray="128 214" strokeLinecap="round" transform="rotate(135 60 64)" />
        <text x="60" y="70" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="22" fill="#f4f6fb">
          80
        </text>
      </svg>
    );
  }
  if (kind === "compare") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <rect width="120" height="120" fill="#0a0f1e" />
        <rect x="8" y="18" width="46" height="84" rx="8" fill="#fff" />
        <rect x="66" y="18" width="46" height="84" rx="8" fill="#fff" />
        <rect x="14" y="28" width="30" height="4" rx="2" fill="#1a0dab" />
        <rect x="14" y="40" width="30" height="4" rx="2" fill="#1a0dab" />
        <rect x="14" y="52" width="30" height="4" rx="2" fill="#1a0dab" />
        <rect x="11" y="78" width="40" height="16" rx="5" fill="#f6ffdf" stroke="#a8e01f" strokeWidth="2" />
        <rect x="69" y="26" width="40" height="16" rx="5" fill="#f6ffdf" stroke="#a8e01f" strokeWidth="2" />
        <rect x="72" y="52" width="30" height="4" rx="2" fill="#1a0dab" />
        <rect x="72" y="64" width="30" height="4" rx="2" fill="#1a0dab" />
        <rect x="72" y="76" width="30" height="4" rx="2" fill="#1a0dab" />
        <path d="M55 60 h10 m-4 -4 l4 4 l-4 4" stroke="#c7ff3b" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#f6f7fb" />
      <rect x="10" y="30" width="28" height="70" rx="6" fill="#fff" stroke="#e2e5ee" />
      <rect x="46" y="18" width="28" height="82" rx="6" fill="#0a0f1e" />
      <rect x="82" y="30" width="28" height="70" rx="6" fill="#fff" stroke="#e2e5ee" />
      <rect x="52" y="28" width="16" height="5" rx="2.5" fill="#c7ff3b" />
      <rect x="52" y="40" width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
      <rect x="52" y="48" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
      <rect x="52" y="86" width="16" height="6" rx="3" fill="#c7ff3b" />
      <rect x="16" y="40" width="16" height="4" rx="2" fill="#0a0f1e" />
      <rect x="88" y="40" width="16" height="4" rx="2" fill="#0a0f1e" />
      <rect x="16" y="86" width="16" height="6" rx="3" fill="#e2e5ee" />
      <rect x="88" y="86" width="16" height="6" rx="3" fill="#e2e5ee" />
    </svg>
  );
}
