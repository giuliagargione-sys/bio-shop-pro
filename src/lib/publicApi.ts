import type { StoreConfig } from "@/types/config";
import { mergeWithDefaults } from "./storage";
import type { StoreEventKind } from "./trackEvent";

// Acesso leve ao backend para a LOJA PÚBLICA: em vez de carregar o
// cliente completo (~60 kB gzip) só pra ler uma linha e gravar eventos,
// a loja fala direto com a API REST via fetch. Isso tira esse peso do
// bundle de quem abre o link da bio (PageSpeed apontou JS não usado).
// A chave usada é a pública (anon), as mesmas permissões de antes.

const BASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

export async function fetchPublicStoreBySlug(
  slug: string,
): Promise<{ ownerId: string; config: StoreConfig; active: boolean } | null> {
  try {
    const params = new URLSearchParams({
      select: "user_id,data,active",
      slug: `eq.${slug}`,
      limit: "1",
    });
    const res = await fetch(`${BASE_URL}/rest/v1/store_config?${params}`, { headers });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      user_id: string;
      data: unknown;
      active?: boolean;
    }>;
    const row = rows[0];
    if (!row) return null;
    return {
      ownerId: row.user_id,
      config: mergeWithDefaults(row.data),
      active: row.active !== false,
    };
  } catch {
    return null;
  }
}

// "Dispara e esquece": se falhar, a loja nunca quebra por causa disso.
export function trackPublicEvent(
  ownerId: string,
  kind: StoreEventKind,
  label: string | null,
  sessionId: string | null,
) {
  try {
    void fetch(`${BASE_URL}/rest/v1/store_events`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        store_user_id: ownerId,
        kind,
        label: label?.slice(0, 120) ?? null,
        session_id: sessionId,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}
