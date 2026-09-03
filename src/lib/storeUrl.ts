// Link curto da loja: bioquevende.app/nome-da-loja
export const RESERVED_SLUGS = new Set([
  "loja",
  "login",
  "admin",
  "personalizar",
  "recuperar-senha",
  "reset-password",
  "trocar-senha",
  "api",
  "assets",
  "planos",
  "sobre",
  "app",
]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/** Caminho curto da loja (sem /loja/). */
export function storePath(slug: string) {
  return `/${slug}`;
}

/** URL completa para copiar/colar na bio. */
export function storeUrl(slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${storePath(slug)}`;
}

/** Host limpo, sem https:// nem www. */
export function storeHost() {
  if (typeof window === "undefined") return "";
  return window.location.host.replace(/^www\./, "");
}
