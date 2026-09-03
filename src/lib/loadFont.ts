// Carrega sob demanda a fonte escolhida pela aluna para a loja dela.
// Antes o index.html baixava 7 famílias de fonte em toda visita — isso
// atrasava a primeira renderização (FCP/LCP) no celular. Agora só as
// fontes da plataforma vêm no HTML e a fonte da loja é buscada aqui.
const PRELOADED = new Set(["Urbanist", "Epilogue"]);
const loaded = new Set<string>();

export function loadStoreFont(family: string | undefined) {
  const name = (family || "").trim();
  if (!name || PRELOADED.has(name) || loaded.has(name)) return;
  loaded.add(name);

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    name,
  ).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
