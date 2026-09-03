import { LifeBuoy, RefreshCcw, Link2 } from "lucide-react";
import type { StoreConfig } from "@/types/config";
import { resolveWhatsAppHref } from "@/lib/utils";

export function HelpLinksBar({ config }: { config: StoreConfig }) {
  const { helpLinks, contact, theme } = config;

  // Se a aluna ainda não colou um link específico, os botões caem no
  // WhatsApp dela — assim eles nunca somem da loja sem querer.
  const whatsappSupport = resolveWhatsAppHref(contact, "Oi! Tenho uma dúvida 💛");
  const whatsappReturns = resolveWhatsAppHref(contact, "Oi! Preciso de ajuda com troca/devolução");

  const supportHref = helpLinks.supportUrl?.trim() || whatsappSupport;
  const returnsHref = helpLinks.returnsUrl?.trim() || whatsappReturns;
  const extra = (helpLinks.extra ?? []).filter((b) => b.label?.trim() && b.url?.trim());

  if (!supportHref && !returnsHref && extra.length === 0) return null;

  const buttonStyle = {
    background: theme.primary,
    color: theme.primaryForeground,
  } as React.CSSProperties;

  const itemClass =
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 active:opacity-95 transition-opacity";

  return (
    <div className="container max-w-md mx-auto px-4 sm:px-0 flex flex-col items-stretch gap-3 py-6">
      {supportHref && (
        <a href={supportHref} target="_blank" rel="noreferrer" className={itemClass} style={buttonStyle}>
          <LifeBuoy size={18} />
          {helpLinks.supportLabel}
        </a>
      )}
      {returnsHref && (
        <a href={returnsHref} target="_blank" rel="noreferrer" className={itemClass} style={buttonStyle}>
          <RefreshCcw size={18} />
          {helpLinks.returnsLabel}
        </a>
      )}
      {extra.map((b) => (
        <a key={b.id} href={b.url} target="_blank" rel="noreferrer" className={itemClass} style={buttonStyle}>
          <Link2 size={18} />
          {b.label}
        </a>
      ))}
    </div>
  );
}

