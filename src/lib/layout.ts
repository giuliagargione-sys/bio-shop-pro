import type { LayoutBlock, StoreConfig } from "@/types/config";
import { uid } from "./utils";

// Blocos fixos que toda loja tem (podem ser reordenados e desligados).
export const FIXED_BLOCK_TYPES = ["produtos", "quiz", "ajuda"] as const;

export const BLOCK_LABELS: Record<LayoutBlock["type"], string> = {
  produtos: "Carrossel de produtos",
  quiz: "Quiz de estilo",
  ajuda: "Dúvidas e trocas",
  botao: "Botão personalizado",
};

export function defaultLayoutBlocks(): LayoutBlock[] {
  return FIXED_BLOCK_TYPES.map((type) => ({ id: uid("bloco"), type, enabled: true }));
}

export function newButtonBlock(): LayoutBlock {
  return {
    id: uid("bloco"),
    type: "botao",
    enabled: true,
    label: "Ver catálogo completo",
    href: "",
  };
}

// Garante que lojas antigas (salvas antes da aba Estrutura) continuem funcionando:
// os blocos que faltarem entram no fim, na ordem padrão.
export function resolveLayoutBlocks(config: StoreConfig): LayoutBlock[] {
  const saved = Array.isArray(config.layout?.blocks) ? config.layout.blocks : [];
  const blocks = saved.filter((b) => b && b.type && BLOCK_LABELS[b.type]);
  const missing = FIXED_BLOCK_TYPES.filter((type) => !blocks.some((b) => b.type === type)).map(
    (type) => ({ id: uid("bloco"), type, enabled: true })
  );
  return [...blocks, ...missing];
}
