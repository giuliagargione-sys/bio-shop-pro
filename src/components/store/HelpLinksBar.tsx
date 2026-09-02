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
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm hover:bg-muted active:bg-muted transition-colors";

  return (
    <div className="container max-w-md mx-auto px-4 sm:px-0 flex flex-col items-stretch gap-2 py-6">
      {supportHref && (
        <a href={supportHref} target="_blank" rel="noreferrer" className={itemClass}>
          <LifeBuoy size={18} />
          {helpLinks.supportLabel}
        </a>
      )}
      {returnsHref && (
        <a href={returnsHref} target="_blank" rel="noreferrer" className={itemClass}>
          <RefreshCcw size={18} />
          {helpLinks.returnsLabel}
        </a>
      )}
    </div>
  );
}
