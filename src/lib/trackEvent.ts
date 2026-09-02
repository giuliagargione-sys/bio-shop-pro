import { supabase, isSupabaseConfigured } from "./supabaseClient";

export type StoreEventKind = "visita" | "produto" | "whatsapp" | "botao" | "quiz";

// Registra um evento da loja pública (visita/clique). É "dispara e esquece":
// se falhar, a loja da aluna nunca quebra por causa disso.
export function trackStoreEvent(
  ownerId: string | null | undefined,
  kind: StoreEventKind,
  label?: string
) {
  if (!ownerId || !isSupabaseConfigured) return;
  void supabase
    .from("store_events")
    .insert({ store_user_id: ownerId, kind, label: label?.slice(0, 120) ?? null })
    .then(({ error }) => {
      if (error) console.warn("Não foi possível registrar o evento:", error.message);
    });
}
