import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  side?: "right" | "left" | "bottom";
  width?: string;
  children: ReactNode;
  className?: string;
};

/** Slide-over panel with overlay, Escape to close, scroll lock. */
export function Sheet({ open, onClose, title, side = "right", width = "max-w-md", children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const from = side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "100%" };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={from}
            animate={{ x: 0, y: 0 }}
            exit={from}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className={cn(
              "absolute flex flex-col bg-ink-900 shadow-stage ring-hairline",
              side === "right" && cn("inset-y-0 right-0 w-full", width),
              side === "left" && cn("inset-y-0 left-0 w-full", width),
              side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl",
              className,
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
              <div className="font-display text-[16px] font-semibold tracking-tight">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-ink-800 hover:text-fg"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
