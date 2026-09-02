import { LifeBuoy, RefreshCcw } from "lucide-react";
import type { StoreConfig } from "@/types/config";
import { resolveWhatsAppHref } from "@/lib/utils";

export function HelpLinksBar({ config }: { config: StoreConfig }) {
  const { helpLinks, contact } = config;

  // Se a aluna ainda não colou um link específico, os botões caem no
  // WhatsApp dela — assim eles nunca somem da loja sem querer.
  const whatsappSupport = resolveWhatsAppHref(contact, "Oi! Tenho uma dúvida 💛");
  const whatsappReturns = resolveWhatsAppHref(contact, "Oi! Preciso de ajuda com troca/devolução");

  const supportHref = helpLinks.supportUrl?.trim() || whatsappSupport;
  const returnsHref = helpLinks.returnsUrl?.trim() || whatsappReturns;

  if (!supportHref && !returnsHref) return null;

  const itemClass =
    "flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted active:bg-muted transition-colors";

  return (
    <div className="container flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 py-6">
      {supportHref && (
        <a href={supportHref} target="_blank" rel="noreferrer" className={itemClass}>
          <LifeBuoy size={16} />
          {helpLinks.supportLabel}
        </a>
      )}
      {returnsHref && (
        <a href={returnsHref} target="_blank" rel="noreferrer" className={itemClass}>
          <RefreshCcw size={16} />
          {helpLinks.returnsLabel}
        </a>
      )}
    </div>
  );
}
