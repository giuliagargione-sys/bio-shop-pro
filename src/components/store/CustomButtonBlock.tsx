import type { LayoutBlock } from "@/types/config";

// Botão extra criado pela aluna na aba Estrutura (ex: catálogo, tabela de medidas).
export function CustomButtonBlock({ block }: { block: LayoutBlock }) {
  const label = block.label?.trim();
  const href = block.href?.trim();
  if (!label || !href) return null;

  return (
    <div className="container py-3">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius)] px-6 text-center text-sm font-medium sm:mx-auto sm:max-w-sm"
        style={{
          background: "var(--brand-primary)",
          color: "var(--brand-primary-foreground)",
        }}
      >
        {label}
      </a>
    </div>
  );
}
