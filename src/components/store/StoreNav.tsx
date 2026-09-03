import { Instagram, Music2, BadgeCheck } from "lucide-react";
import type { StoreConfig } from "@/types/config";

export function StoreNav({ config }: { config: StoreConfig }) {
  const hasSocial = config.contact.instagramUrl || config.contact.tiktokUrl;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="container max-w-md mx-auto flex flex-col items-center py-2.5 sm:py-3 px-4 sm:px-0 gap-1.5">
        <div className="flex items-center gap-2">
          {config.brand.logoUrl ? (
            <img
              src={config.brand.logoUrl}
              alt={config.brand.storeName}
              width={40}
              height={40}
              decoding="async"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-brand font-semibold text-sm sm:text-base">
              {config.brand.storeName.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          <span className="font-brand font-semibold text-base sm:text-lg">{config.brand.storeName}</span>
          <BadgeCheck size={18} className="text-primary sm:w-5 sm:h-5" aria-label="Verificado" />
        </div>
        {hasSocial && (
          <div className="flex items-center gap-3 text-foreground/70">
            {config.contact.instagramUrl && (
              <a href={config.contact.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
            )}
            {config.contact.tiktokUrl && (
              <a href={config.contact.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">
                <Music2 size={18} className="sm:w-5 sm:h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
