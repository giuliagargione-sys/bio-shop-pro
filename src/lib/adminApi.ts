import { supabase } from "./supabaseClient";

// Tudo aqui passa pelas Edge Functions admin-list-alunas / admin-create-aluna
// (nunca consulta as tabelas direto) — são elas que conferem se quem está
// chamando é realmente admin e que enxergam os dados de todas as alunas.

export interface AlunaSummary {
  id: string;
  email: string;
  createdAt: string;
  slug: string | null;
  storeName: string | null;
  storeUpdatedAt: string | null;
  paymentStatus: "ativo" | "inadimplente" | "cancelado" | "desconhecido";
  plan: string | null;
  lastPaymentEventAt: string | null;
}

export async function fetchAlunas(): Promise<{ alunas: AlunaSummary[]; error: string | null }> {
  if (!supabase) return { alunas: [], error: "Supabase não conectado." };
  const { data, error } = await supabase.functions.invoke("admin-list-alunas");
  if (error) return { alunas: [], error: error.message };
  if (data?.error) return { alunas: [], error: data.error as string };
  return { alunas: (data?.alunas as AlunaSummary[]) ?? [], error: null };
}

export async function createAluna(
  email: string
): Promise<{ email: string; tempPassword: string } | { error: string }> {
  if (!supabase) return { error: "Supabase não conectado." };
  const { data, error } = await supabase.functions.invoke("admin-create-aluna", {
    body: { email },
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error as string };
  return { email: data.email as string, tempPassword: data.tempPassword as string };
}
