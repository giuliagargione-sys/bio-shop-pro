import type { LayoutBlock } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";
import { getButtonIcon, readableTextColor } from "@/lib/buttonStyle";

// Botão extra criado pela aluna na aba Estrutura (ex: catálogo, tabela de medidas).
export function CustomButtonBlock({
  block,
  ownerId,
}: {
  block: LayoutBlock;
  ownerId?: string | null;
}) {
  const label = block.label?.trim();
  const href = block.href?.trim();
  if (!label || !href) return null;

  const Icon = getButtonIcon(block.icon);

  return (
    <div className="container max-w-md mx-auto px-4 sm:px-0 py-3">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackStoreEvent(ownerId, "botao", label)}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius)] px-6 text-center text-sm font-medium"
        style={{
          background: block.color || "var(--brand-primary)",
          color: (block.color && readableTextColor(block.color)) || "var(--brand-primary-foreground)",
        }}
      >
        {Icon && <Icon size={18} />}
        {label}
      </a>
    </div>
  );
}
