import type { StoreConfig } from "@/types/config";
import { resolveWhatsAppHref } from "@/lib/utils";
import { getButtonIcon, readableTextColor } from "@/lib/buttonStyle";
import { resolveHelpLinkItems, type HelpLinkItem } from "@/lib/layout";

const itemClass =
  "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-sm hover:opacity-90 active:opacity-95 transition-opacity";

// Um botão extra da loja. Sem link específico, cai no WhatsApp da aluna.
export function HelpLinkButton({
  item,
  config,
}: {
  item: HelpLinkItem;
  config: StoreConfig;
}) {
  const { contact, theme } = config;
  const label = item.label?.trim();
  const fallback = resolveWhatsAppHref(contact, `Oi! ${label || "Tenho uma dúvida"} 💛`);
  const href = item.url?.trim() || (item.refId === "support" || item.refId === "returns" ? fallback : "");
  if (!label || !href) return null;

  const Icon = getButtonIcon(item.icon);

  return (
    <div className="container max-w-md mx-auto px-4 sm:px-0 py-1.5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={itemClass}
        style={{
          background: item.color || theme.primary,
          color: (item.color && readableTextColor(item.color)) || theme.primaryForeground,
        }}
      >
        {Icon && <Icon size={18} />}
        {label}
      </a>
    </div>
  );
}

// Compatibilidade: todos os botões extras em sequência.
export function HelpLinksBar({ config }: { config: StoreConfig }) {
  return (
    <div className="flex flex-col py-3">
      {resolveHelpLinkItems(config).map((item) => (
        <HelpLinkButton key={item.refId} item={item} config={config} />
      ))}
    </div>
  );
}
