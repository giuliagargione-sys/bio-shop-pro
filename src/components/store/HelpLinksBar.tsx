import type { StoreConfig } from "@/types/config";
import { resolveWhatsAppHref } from "@/lib/utils";
import { getButtonIcon, readableTextColor } from "@/lib/buttonStyle";

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

  const styleFor = (color?: string): React.CSSProperties => ({
    background: color || theme.primary,
    color: (color && readableTextColor(color)) || theme.primaryForeground,
  });

  const itemClass =
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 active:opacity-95 transition-opacity";

  const SupportIcon = getButtonIcon(helpLinks.supportIcon ?? "suporte");
  const ReturnsIcon = getButtonIcon(helpLinks.returnsIcon ?? "entrega");

  return (
    <div className="container max-w-md mx-auto px-4 sm:px-0 flex flex-col items-stretch gap-3 py-6">
      {supportHref && (
        <a
          href={supportHref}
          target="_blank"
          rel="noreferrer"
          className={itemClass}
          style={styleFor(helpLinks.supportColor)}
        >
          {SupportIcon && <SupportIcon size={18} />}
          {helpLinks.supportLabel}
        </a>
      )}
      {returnsHref && (
        <a
          href={returnsHref}
          target="_blank"
          rel="noreferrer"
          className={itemClass}
          style={styleFor(helpLinks.returnsColor)}
        >
          {ReturnsIcon && <ReturnsIcon size={18} />}
          {helpLinks.returnsLabel}
        </a>
      )}
      {extra.map((b) => {
        const Icon = getButtonIcon(b.icon ?? "link");
        return (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="noreferrer"
            className={itemClass}
            style={styleFor(b.color)}
          >
            {Icon && <Icon size={18} />}
            {b.label}
          </a>
        );
      })}
    </div>
  );
}
