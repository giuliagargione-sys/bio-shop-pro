// O backend (Lovable Cloud) já vem conectado neste projeto: o cliente
// oficial é gerado automaticamente em src/integrations/supabase/client.ts.
// Aqui a gente só reexporta para manter os imports antigos funcionando.
import { supabase as generatedClient } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const supabase: SupabaseClient | null = generatedClient as unknown as SupabaseClient;
export const isSupabaseConfigured = true;
