import { supabase } from "./supabaseClient";

// Quem está logada agora, lida da sessão que já está no navegador.
// Antes cada operação chamava auth.getUser(), que é um pedido ao servidor;
// getSession() usa a sessão já guardada e não gasta nenhuma chamada.
export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}
