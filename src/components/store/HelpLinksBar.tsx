import { LifeBuoy, RefreshCcw } from "lucide-react";
import type { StoreConfig } from "@/types/config";

export function HelpLinksBar({ config }: { config: StoreConfig }) {
  const { helpLinks } = config;
  const hasSupport = Boolean(helpLinks.supportUrl);
  const hasReturns = Boolean(helpLinks.returnsUrl);

  if (!hasSupport && !hasReturns) return null;

  const itemClass =
    "flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted active:bg-muted transition-colors";

  return (
    <div className="container flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 py-6">
      {hasSupport && (
        <a href={helpLinks.supportUrl} target="_blank" rel="noreferrer" className={itemClass}>
          <LifeBuoy size={16} />
          {helpLinks.supportLabel}
        </a>
      )}
      {hasReturns && (
        <a href={helpLinks.returnsUrl} target="_blank" rel="noreferrer" className={itemClass}>
          <RefreshCcw size={16} />
          {helpLinks.returnsLabel}
        </a>
      )}
    </div>
  );
}
