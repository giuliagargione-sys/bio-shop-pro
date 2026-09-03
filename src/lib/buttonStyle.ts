import {
  Gift,
  Heart,
  Instagram,
  LifeBuoy,
  Link2,
  MapPin,
  MessageCircle,
  Percent,
  Ruler,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

// Ícones sugeridos pra a aluna escolher em cada botão.
export const BUTTON_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "link", label: "Link", Icon: Link2 },
  { key: "suporte", label: "Suporte", Icon: LifeBuoy },
  { key: "whatsapp", label: "Conversa", Icon: MessageCircle },
  { key: "sacola", label: "Sacola", Icon: ShoppingBag },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "medidas", label: "Medidas", Icon: Ruler },
  { key: "entrega", label: "Entrega", Icon: Truck },
  { key: "oferta", label: "Oferta", Icon: Percent },
  { key: "etiqueta", label: "Etiqueta", Icon: Tag },
  { key: "brilho", label: "Novidade", Icon: Sparkles },
  { key: "estrela", label: "Destaque", Icon: Star },
  { key: "coracao", label: "Favoritos", Icon: Heart },
  { key: "presente", label: "Presente", Icon: Gift },
  { key: "grupo", label: "Grupo", Icon: Users },
  { key: "local", label: "Localização", Icon: MapPin },
];

export function getButtonIcon(key?: string): LucideIcon | null {
  if (!key || key === "nenhum") return null;
  return BUTTON_ICONS.find((i) => i.key === key)?.Icon ?? null;
}

// Cores sugeridas (a aluna também pode escolher qualquer outra).
export const BUTTON_COLORS = [
  "#0B0B0B",
  "#6B1B2B",
  "#B3465C",
  "#C99C4A",
  "#2F6F5E",
  "#2B4C7E",
  "#7A5AA8",
  "#E3DED6",
];

// Preto ou branco conforme o contraste da cor escolhida.
export function readableTextColor(hex?: string): string | null {
  if (!hex) return null;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0B0B0B" : "#FFFDF9";
}
