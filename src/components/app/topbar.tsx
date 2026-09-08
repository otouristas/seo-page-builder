import { Link } from "@tanstack/react-router";
import { MessageCircle, Monitor, Share2, Smartphone } from "lucide-react";
import type { Device, Market } from "@/lib/seo/types";
import type { Status } from "@/store/lab";
import { cn } from "@/lib/utils";
import { UrlField } from "@/components/ui/url-field";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/marketing/logo";
import { MarketSwitch } from "@/components/marketing/market-switch";
import { Kbd } from "@/components/ui/misc";
import { RecentsButton } from "./recents-menu";
import type { RecentEntry } from "@/lib/seo/recents";

type Props = {
  url: string;
  status: Status;
  market: Market;
  device: Device;
  showDevice: boolean;
  onRun: (url: string) => void;
  onMarket: (m: Market) => void;
  onDevice: (d: Device) => void;
  onShare: () => void;
  onCoach: () => void;
  onRecent: (e: RecentEntry) => void;
  urlKey: string;
};

const DOT: Record<Status, string> = { idle: "bg-fg-subtle", loading: "bg-warn animate-pulse", ready: "bg-success", error: "bg-danger" };

export function Topbar({ url, status, market, device, showDevice, onRun, onMarket, onDevice, onShare, onCoach, onRecent, urlKey }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-3 sm:px-4">
      <Link to="/" className="lg:hidden" aria-label="Rankframe home">
        <LogoMark size={28} />
      </Link>
      <div className="relative min-w-0 flex-1">
        <span className={cn("absolute -right-1 -top-1 z-10 size-2.5 rounded-full ring-2 ring-ink-900", DOT[status])} aria-hidden title={status} />
        <UrlField
          key={urlKey}
          initial={url}
          size="md"
          onSubmit={onRun}
          loading={status === "loading"}
          buttonLabel={status === "ready" ? "Re-run" : "Run"}
          placeholder="Paste a public URL and press Enter"
          className="url-field"
          hint={
            <span className="pointer-events-none hidden shrink-0 items-center gap-1 pr-1 md:flex" aria-hidden>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          }
        />
      </div>
      <MarketSwitch market={market} onChange={onMarket} compact />
      {showDevice && (
        <Segmented
          size="sm"
          layoutId="device"
          ariaLabel="Device"
          value={device}
          onChange={onDevice}
          options={[
            { value: "desktop", label: <Monitor className="size-3.5" />, title: "Desktop stage" },
            { value: "mobile", label: <Smartphone className="size-3.5" />, title: "Mobile stage" },
          ]}
          className="hidden md:inline-flex"
        />
      )}
      <RecentsButton onPick={onRecent} />
      <Button variant="ghost" size="sm" onClick={onShare} leading={<Share2 className="size-4" />} className="hidden sm:inline-flex" title="Copy a link to this scene">
        <span className="hidden lg:inline">Share</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={onCoach} leading={<MessageCircle className="size-4" />} title="Ask the coach">
        <span className="hidden sm:inline">Coach</span>
      </Button>
    </header>
  );
}
