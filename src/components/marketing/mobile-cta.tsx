import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 glass p-3 pb-[max(env(safe-area-inset-bottom),12px)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <ButtonLink to="/login" variant="outline" size="md" className="flex-1">
          Sign in
        </ButtonLink>
        <ButtonLink to="/app" variant="primary" size="md" className="flex-[1.4]" trailing={<ArrowRight className="size-4" />}>
          Try it free
        </ButtonLink>
      </div>
    </div>
  );
}
