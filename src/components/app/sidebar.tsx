import { Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, LayoutDashboard, LogOut, MessageCircle, Radio, Search, ShieldCheck, Upload } from "lucide-react";
import type { AppTab } from "@/lib/seo/types";
import type { SessionInfo } from "@/server/session";
import { TABS } from "@/store/lab";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/marketing/logo";
import { Kbd } from "@/components/ui/misc";
import { Tooltip } from "@/components/ui/tooltip";
import { signOut } from "@/lib/auth/client";

export const TAB_ICONS: Record<AppTab, typeof Search> = {
  overview: LayoutDashboard,
  serp: Search,
  audit: ShieldCheck,
  keywords: KeyRound,
  gsc: Upload,
  coach: MessageCircle,
};

type Props = {
  tab: AppTab;
  onTab: (t: AppTab) => void;
  session: SessionInfo | null;
  quota: { used: number; limit: number } | null;
  onSignedOut: () => void;
  ready: boolean;
};

export function Sidebar({ tab, onTab, session, quota, onSignedOut, ready }: Props) {
  const user = session?.user ?? null;
  return (
    <aside className="hidden w-[76px] shrink-0 flex-col border-r border-white/8 bg-ink-950/70 lg:flex xl:w-[236px]">
      <div className="flex h-16 items-center gap-2.5 px-4 xl:px-5">
        <Link to="/" aria-label="Rankframe home" className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="hidden font-display text-[16px] font-semibold tracking-tight xl:inline">Rankframe</span>
        </Link>
        <span className="ml-auto hidden rounded-full bg-signal/10 px-2 py-0.5 font-mono text-[10px] text-signal xl:inline">lab</span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Lab sections">
        {TABS.map((t, i) => {
          const Icon = TAB_ICONS[t.id];
          const active = t.id === tab;
          const disabled = !ready && t.id !== "overview";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              disabled={disabled}
              title={t.hint}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-xl px-3 text-left transition-colors",
                active ? "bg-ink-800 text-fg ring-hairline" : "text-fg-muted hover:bg-white/5 hover:text-fg",
                disabled && "opacity-40",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active && "text-signal")} />
              <span className="hidden min-w-0 flex-1 truncate text-[14px] font-medium xl:inline">{t.label}</span>
              <Kbd className="hidden xl:inline-flex">{i + 1}</Kbd>
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/8 p-3">
        {quota && (
          <Tooltip content="Live page-one lookups through DataForSEO, per signed-in user per day." side="top">
            <div className="flex w-full items-center gap-2 rounded-xl bg-ink-900/70 px-3 py-2 ring-hairline">
              <Radio className="size-4 shrink-0 text-success" />
              <span className="hidden text-[12px] text-fg-muted xl:inline">Live SERP</span>
              <span className="ml-auto font-mono text-[11px] text-fg tabular">
                {quota.used}/{quota.limit}
              </span>
            </div>
          </Tooltip>
        )}
        {user ? (
          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
            {user.image ? (
              <img src={user.image} alt="" className="size-8 rounded-full ring-hairline" referrerPolicy="no-referrer" />
            ) : (
              <span className="grid size-8 place-items-center rounded-full bg-signal font-semibold text-ink-900">{(user.name || user.email)[0]?.toUpperCase()}</span>
            )}
            <div className="hidden min-w-0 flex-1 xl:block">
              <div className="truncate text-[13px] font-medium">{user.name || user.email}</div>
              <div className="truncate text-[11px] text-fg-muted">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut().then(onSignedOut)}
              className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-white/5 hover:text-fg"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-3 rounded-xl px-3 py-2 text-fg-muted transition-colors hover:bg-white/5 hover:text-fg">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-800 ring-hairline">
              <span className="size-3 rounded-full bg-fg-subtle" />
            </span>
            <span className="hidden min-w-0 xl:block">
              <span className="block text-[13px] font-medium text-fg">Guest</span>
              <span className="block text-[11px]">{session?.authEnabled ? "Sign in to keep data" : "Sign-in not configured"}</span>
            </span>
          </Link>
        )}
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-fg-muted transition-colors hover:bg-white/5 hover:text-fg">
          <ArrowLeft className="size-4 shrink-0" />
          <span className="hidden xl:inline">Back to site</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileTabs({ tab, onTab, ready }: { tab: AppTab; onTab: (t: AppTab) => void; ready: boolean }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 glass pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Lab sections">
      <div className="grid grid-cols-6">
        {TABS.map((t) => {
          const Icon = TAB_ICONS[t.id];
          const active = t.id === tab;
          return (
            <button key={t.id} type="button" onClick={() => onTab(t.id)} disabled={!ready && t.id !== "overview"} className={cn("flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium", active ? "text-signal" : "text-fg-muted", !ready && t.id !== "overview" && "opacity-40")}>
              <Icon className="size-5" />
              {t.label.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
