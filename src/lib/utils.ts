export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function buildWhatsAppLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

// A aluna pode colar um link pronto do WhatsApp OU so o numero. Essa funcao
// resolve os dois casos e, quando da, ja anexa a mensagem automatica.
export function resolveWhatsAppHref(
  contact: { whatsappNumber?: string; whatsappLink?: string },
  message?: string,
) {
  const link = (contact.whatsappLink || "").trim();
  if (link) {
    if (!message) return link;
    try {
      const url = new URL(link);
      if (/wa\.me|api\.whatsapp\.com|web\.whatsapp\.com/.test(url.hostname) && !url.searchParams.get("text")) {
        url.searchParams.set("text", message);
      }
      return url.toString();
    } catch {
      return link;
    }
  }
  return buildWhatsAppLink(contact.whatsappNumber || "", message || "");
}

// Decide se o texto sobre uma cor de fundo deve ser branco ou preto,
// pra aluna nao precisar escolher isso manualmente.
export function getContrastText(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}
