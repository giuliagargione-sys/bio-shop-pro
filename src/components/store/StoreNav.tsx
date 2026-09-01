import { Instagram, Music2 } from "lucide-react";
import type { StoreConfig } from "@/types/config";

export function StoreNav({ config }: { config: StoreConfig }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          {config.brand.logoUrl ? (
            <img
              src={config.brand.logoUrl}
              alt={config.brand.storeName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-brand font-semibold">
              {config.brand.storeName.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          <span className="font-brand font-semibold text-lg">{config.brand.storeName}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground/70">
          {config.contact.instagramUrl && (
            <a href={config.contact.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          )}
          {config.contact.tiktokUrl && (
            <a href={config.contact.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">
              <Music2 size={20} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
