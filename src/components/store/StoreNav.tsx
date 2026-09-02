import { Instagram, Music2, MessageCircle } from "lucide-react";
import { resolveWhatsAppHref } from "@/lib/utils";
import type { StoreConfig } from "@/types/config";

export function StoreNav({ config }: { config: StoreConfig }) {
  const contactLabel = (config.contact.buttonLabel || "Falar no WhatsApp").trim();
  const contactHref = resolveWhatsAppHref(
    config.contact,
    config.contact.whatsappDefaultMessage,
  );
  const showContact = Boolean(
    contactLabel && (config.contact.whatsappLink || config.contact.whatsappNumber),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="container max-w-md mx-auto flex items-center justify-between py-2.5 sm:py-3 px-4 sm:px-0">
        <div className="flex items-center gap-2">
          {config.brand.logoUrl ? (
            <img
              src={config.brand.logoUrl}
              alt={config.brand.storeName}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-brand font-semibold text-sm sm:text-base">
              {config.brand.storeName.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          <span className="font-brand font-semibold text-base sm:text-lg">{config.brand.storeName}</span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 text-foreground/70">
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
          {showContact && (
            <a
              href={contactHref}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--brand-primary)",
                color: "var(--brand-primary-foreground)",
              }}
            >
              <MessageCircle size={16} />
              {contactLabel}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
