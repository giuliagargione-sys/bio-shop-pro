import type { StoreConfig } from "@/types/config";
import { defaultConfig } from "./defaultConfig";

// Chave do localStorage — usada como cache local pra loja abrir na hora
// (sem esperar a resposta do Supabase) e como fallback offline. A fonte
// da verdade, quando o Supabase está conectado, é a tabela store_config
// (veja src/lib/remoteConfig.ts).
const STORAGE_KEY = "link-na-bio-dash:config";

// merge raso com o default garante que campos novos (adicionados depois em
// atualizacoes do template) nao quebrem configs salvas antes deles existirem
export function mergeWithDefaults(parsed: Partial<StoreConfig> | null | undefined): StoreConfig {
  const safe = parsed ?? {};
  return {
    ...defaultConfig,
    ...safe,
    meta: { ...defaultConfig.meta, ...safe.meta },
    brand: { ...defaultConfig.brand, ...safe.brand },
    theme: { ...defaultConfig.theme, ...safe.theme },
    hero: { ...defaultConfig.hero, ...safe.hero },
    quiz: { ...defaultConfig.quiz, ...safe.quiz },
    contact: { ...defaultConfig.contact, ...safe.contact },
    helpLinks: { ...defaultConfig.helpLinks, ...safe.helpLinks },
    footer: { ...defaultConfig.footer, ...safe.footer },
    products: Array.isArray(safe.products) ? safe.products : defaultConfig.products,
  };
}

export function loadConfig(): StoreConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: StoreConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage pode falhar em modo privado/anonimo — falha silenciosa,
    // a personalizacao continua funcionando na sessao atual
  }
}

// Remove acentos sem depender de faixas unicode "cruas" no arquivo fonte
function slugify(input: string) {
  const DIACRITICS = new RegExp("[̀-ͯ]", "g");
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function exportConfigFile(config: StoreConfig) {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = slugify(config.brand.storeName || "minha-loja");
  a.href = url;
  a.download = `${slug || "loja"}-config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importConfigFile(file: File): Promise<StoreConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(parsed as StoreConfig);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
