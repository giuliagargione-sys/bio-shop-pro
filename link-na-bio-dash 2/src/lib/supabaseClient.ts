import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// O Lovable preenche essas variáveis sozinho quando você conecta o
// Supabase ao projeto (aba "Supabase" no Lovable). Se os nomes vierem
// diferentes por lá, ajuste aqui — veja o README para o passo a passo.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Quando o Supabase ainda não foi conectado, `supabase` fica null e cada
// tela trata isso com uma mensagem amigável em vez de quebrar o app —
// assim dá pra abrir e mexer no visual mesmo antes de conectar o backend.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
