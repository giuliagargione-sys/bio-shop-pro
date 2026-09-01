import { LifeBuoy, RefreshCcw } from "lucide-react";
import type { StoreConfig } from "@/types/config";

export function HelpLinksBar({ config }: { config: StoreConfig }) {
  const { helpLinks } = config;
  const hasSupport = Boolean(helpLinks.supportUrl);
  const hasReturns = Boolean(helpLinks.returnsUrl);

  if (!hasSupport && !hasReturns) return null;

  return (
    <div className="container flex flex-wrap justify-center gap-3 py-6">
      {hasSupport && (
        <a
          href={helpLinks.supportUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          <LifeBuoy size={16} />
          {helpLinks.supportLabel}
        </a>
      )}
      {hasReturns && (
        <a
          href={helpLinks.returnsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          <RefreshCcw size={16} />
          {helpLinks.returnsLabel}
        </a>
      )}
    </div>
  );
}
