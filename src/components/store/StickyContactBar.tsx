import { MessageCircle } from "lucide-react";
import { resolveWhatsAppHref } from "@/lib/utils";
import type { StoreConfig } from "@/types/config";

// Barra fixa no rodapé do celular: é o jeito mais rápido da cliente
// falar no WhatsApp sem precisar rolar a página de volta.
export function StickyContactBar({ config }: { config: StoreConfig }) {
  const label = (config.contact.buttonLabel || "").trim();
  const hasTarget = Boolean(config.contact.whatsappLink || config.contact.whatsappNumber);
  if (!label || !hasTarget) return null;

  const href = resolveWhatsAppHref(config.contact, config.contact.whatsappDefaultMessage);

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 pt-3 pb-safe">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius)] text-base font-semibold active:opacity-90"
        style={{ background: "var(--brand-primary)", color: "var(--brand-primary-foreground)" }}
      >
        <MessageCircle size={18} />
        {label}
      </a>
    </div>
  );
}
