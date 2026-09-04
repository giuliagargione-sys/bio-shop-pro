// Domínio curto dos links das lojas: www.lojabio.app/nome-da-loja
export const STORE_DOMAIN = "www.lojabio.app";

/** Hosts que servem APENAS links de loja (raiz e páginas internas redirecionam para a landing). */
export const STORE_ONLY_HOSTS = new Set(["lojabio.app", "www.lojabio.app"]);

/** Domínio principal da plataforma (landing, login, dashboard). */
export const MAIN_DOMAIN = "www.bioquevende.app";

export const RESERVED_SLUGS = new Set([
  "loja",
  "login",
  "admin",
  "personalizar",
  "recuperar-senha",
  "reset-password",
  "trocar-senha",
  "bem-vindo",
  "api",
  "assets",
  "planos",
  "vip",
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

/** URL completa para copiar/colar na bio (sempre no domínio curto). */
export function storeUrl(slug: string) {
  return `https://${STORE_DOMAIN}${storePath(slug)}`;
}

/** Host limpo exibido no painel, sem https://. */
export function storeHost() {
  return STORE_DOMAIN;
}
