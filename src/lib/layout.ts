import type { LayoutBlock, StoreConfig } from "@/types/config";
import { uid } from "./utils";

// Blocos fixos que toda loja tem (podem ser reordenados e desligados).
export const FIXED_BLOCK_TYPES = ["produtos", "quiz", "videos"] as const;

export const BLOCK_LABELS: Record<LayoutBlock["type"], string> = {
  banners: "Banners",
  banner: "Banner",
  produtos: "Carrossel de produtos",
  quiz: "Quiz de estilo",
  ajuda: "Botões extras",
  helpLink: "Botão extra",
  botao: "Botão personalizado",
  videos: "Carrossel de vídeos",
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

export type HelpLinkItem = {
  refId: string;
  label: string;
  url: string;
  color?: string;
  icon?: string;
};

// Lista dos botões extras da loja (os dois sugeridos + os criados pela aluna).
export function resolveHelpLinkItems(config: StoreConfig): HelpLinkItem[] {
  const help = config.helpLinks;
  const items: HelpLinkItem[] = [
    {
      refId: "support",
      label: help.supportLabel,
      url: help.supportUrl,
      color: help.supportColor,
      icon: help.supportIcon ?? "suporte",
    },
    {
      refId: "returns",
      label: help.returnsLabel,
      url: help.returnsUrl,
      color: help.returnsColor,
      icon: help.returnsIcon ?? "entrega",
    },
  ];
  (help.extra ?? []).forEach((b) =>
    items.push({ refId: b.id, label: b.label, url: b.url, color: b.color, icon: b.icon ?? "link" })
  );
  return items;
}

function bannerBlock(refId: string, enabled = true): LayoutBlock {
  return { id: uid("bloco"), type: "banner", enabled, refId };
}

function helpLinkBlock(refId: string, enabled = true): LayoutBlock {
  return { id: uid("bloco"), type: "helpLink", enabled, refId };
}

// Nome que aparece no painel (Banner 1, Botão 2 — Trocas, etc).
export function blockLabel(block: LayoutBlock, config: StoreConfig, indexes: Record<string, number>) {
  const n = indexes[block.id] ?? 1;
  if (block.type === "banner") {
    const banner = (config.banners ?? []).find((b) => b.id === block.refId);
    const name = banner?.title?.trim() || banner?.overlayTitle?.trim();
    return name ? `Banner ${n} — ${name}` : `Banner ${n}`;
  }
  if (block.type === "helpLink") {
    const item = resolveHelpLinkItems(config).find((i) => i.refId === block.refId);
    const name = item?.label?.trim();
    return name ? `Botão ${n} — ${name}` : `Botão ${n}`;
  }
  if (block.type === "botao") {
    const name = block.label?.trim();
    return name ? `Botão ${n} — ${name}` : `Botão ${n}`;
  }
  return BLOCK_LABELS[block.type];
}

// Numeração: banners contam entre si; botões extras e personalizados contam juntos.
function counterKey(type: LayoutBlock["type"]) {
  if (type === "helpLink" || type === "botao") return "botao";
  return type;
}

export function blockIndexes(blocks: LayoutBlock[]): Record<string, number> {
  const counters: Record<string, number> = {};
  const out: Record<string, number> = {};
  blocks.forEach((b) => {
    const key = counterKey(b.type);
    counters[key] = (counters[key] ?? 0) + 1;
    out[b.id] = counters[key];
  });

  return out;
}

// Garante que lojas antigas continuem funcionando e que cada banner/botão extra
// tenha o seu próprio bloco reordenável.
export function resolveLayoutBlocks(config: StoreConfig): LayoutBlock[] {
  const saved = Array.isArray(config.layout?.blocks) ? config.layout.blocks : [];
  const bannerIds = (config.banners ?? []).map((b) => b.id);
  const helpIds = resolveHelpLinkItems(config).map((i) => i.refId);

  const blocks: LayoutBlock[] = [];
  for (const b of saved) {
    if (!b || !b.type || !BLOCK_LABELS[b.type]) continue;
    // Migração: os antigos blocos agrupados viram um bloco por item, no mesmo lugar.
    if (b.type === "banners") {
      bannerIds.forEach((id) => blocks.push(bannerBlock(id, b.enabled !== false)));
      continue;
    }
    if (b.type === "ajuda") {
      helpIds.forEach((id) => blocks.push(helpLinkBlock(id, b.enabled !== false)));
      continue;
    }
    if (b.type === "banner" && !bannerIds.includes(b.refId ?? "")) continue;
    if (b.type === "helpLink" && !helpIds.includes(b.refId ?? "")) continue;
    blocks.push(b);
  }

  // Itens novos (banner recém-criado, botão extra novo) entram no fim.
  bannerIds
    .filter((id) => !blocks.some((b) => b.type === "banner" && b.refId === id))
    .forEach((id) => blocks.push(bannerBlock(id)));
  helpIds
    .filter((id) => !blocks.some((b) => b.type === "helpLink" && b.refId === id))
    .forEach((id) => blocks.push(helpLinkBlock(id)));
  FIXED_BLOCK_TYPES.filter((type) => !blocks.some((b) => b.type === type)).forEach((type) =>
    blocks.push({ id: uid("bloco"), type, enabled: true })
  );

  return blocks;
}
