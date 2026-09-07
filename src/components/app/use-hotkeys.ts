import { useEffect } from "react";

function typing(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/** ⌘K / Ctrl+K focuses the URL bar; digits 1–6 switch tabs; Escape blurs. */
export function useHotkeys(handlers: { focusUrl: () => void; tab: (index: number) => void; escape?: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handlers.focusUrl();
        return;
      }
      if (typing(e.target)) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        handlers.tab(Number(e.key) - 1);
      }
      if (e.key === "Escape") handlers.escape?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
