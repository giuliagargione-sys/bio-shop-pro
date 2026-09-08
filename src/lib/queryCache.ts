// Cache em memória (com deduplicação de chamadas simultâneas) usado por
// todas as telas internas. Objetivo: quando duas partes do app pedem a
// mesma informação — ou a pessoa troca de aba e volta — o app reaproveita
// o que já foi carregado em vez de perguntar de novo ao servidor.
//
// Não muda nada do que a pessoa vê: os mesmos dados aparecem, só sem o
// pedido repetido. Todo lugar que usa cache mantém um jeito de forçar a
// atualização (botão "Atualizar"), que chama invalidateCache().

interface Entry<T> {
  value?: T;
  at: number;
  promise?: Promise<T>;
}

const store = new Map<string, Entry<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export interface CachedQueryOptions {
  /** validade do dado em ms */
  ttl?: number;
  /** ignora o cache e busca de novo (usado pelos botões de atualizar) */
  force?: boolean;
}

/** Retorna o valor já em cache, se ainda estiver válido. */
export function peekCache<T>(key: string, ttl = DEFAULT_TTL): T | undefined {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry || entry.value === undefined) return undefined;
  if (Date.now() - entry.at > ttl) return undefined;
  return entry.value;
}

export async function cachedQuery<T>(
  key: string,
  loader: () => Promise<T>,
  options: CachedQueryOptions = {}
): Promise<T> {
  const ttl = options.ttl ?? DEFAULT_TTL;
  const entry = store.get(key) as Entry<T> | undefined;

  if (!options.force && entry) {
    // Já tem alguém buscando agora: espera a mesma resposta em vez de
    // abrir uma segunda chamada idêntica.
    if (entry.promise) return entry.promise;
    if (entry.value !== undefined && Date.now() - entry.at <= ttl) return entry.value;
  }

  const promise = loader()
    .then((value) => {
      store.set(key, { value, at: Date.now() });
      return value;
    })
    .catch((err) => {
      store.delete(key);
      throw err;
    });

  store.set(key, { at: Date.now(), promise, value: entry?.value });
  return promise;
}

/** Guarda um valor calculado fora do cachedQuery (ex: resultado de IA). */
export function setCache<T>(key: string, value: T) {
  store.set(key, { value, at: Date.now() });
}

/** Apaga uma chave exata ou todas que começam com o prefixo. */
export function invalidateCache(keyOrPrefix: string) {
  if (store.has(keyOrPrefix)) store.delete(keyOrPrefix);
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(keyOrPrefix)) store.delete(key);
  }
}

export function clearCache() {
  store.clear();
}
