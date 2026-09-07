import { hostOf } from "@/lib/utils";
import { Favicon } from "@/components/serp/favicon";

/** Google-style result preview for a title + description + URL. */
export function SnippetPreview({ url, title, description, className }: { url: string; title: string; description: string; className?: string }) {
  const domain = hostOf(url);
  let path = "";
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    path = parts.length ? ` › ${parts.slice(0, 2).join(" › ")}` : "";
  } catch {
    /* ignore */
  }
  const name = domain.split(".")[0] ?? domain;
  return (
    <div className={className}>
      <div className="rounded-2xl bg-white p-5 font-serp shadow-stage">
        <div className="flex items-center gap-2.5">
          <Favicon domain={domain} size={26} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[14px] text-[#202124]">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
            <div className="truncate text-[12px] text-[#4d5156]">
              {domain}
              {path}
            </div>
          </div>
        </div>
        <div className="mt-1 line-clamp-1 text-[20px] leading-[1.3] text-google-title">{title || "Untitled page"}</div>
        <p className="mt-1 line-clamp-2 text-[14px] leading-[1.58] text-google-snippet">{description || "No description. Google will pick a passage from the page."}</p>
      </div>
    </div>
  );
}
