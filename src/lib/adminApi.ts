import { supabase } from "./supabaseClient";
export { setStoreActive, deleteStore } from "./remoteConfig";

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
  active: boolean;
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

// ---- Suporte humano (painel central) ----

export interface AdminSupportMessage {
  id: string;
  sender: "aluna" | "admin";
  body: string;
  createdAt: string;
}

export interface AdminSupportTicket {
  id: string;
  userId: string;
  email: string;
  storeName: string | null;
  plan: string | null;
  isPro: boolean;
  status: string;
  awaitingAdmin: boolean;
  lastMessageAt: string;
  createdAt: string;
  messages: AdminSupportMessage[];
}

export async function fetchSupportTickets(): Promise<{
  tickets: AdminSupportTicket[];
  error: string | null;
}> {
  if (!supabase) return { tickets: [], error: "Backend não conectado." };
  const { data, error } = await supabase.functions.invoke("admin-support", {
    body: { action: "list" },
  });
  if (error) return { tickets: [], error: error.message };
  if (data?.error) return { tickets: [], error: data.error as string };
  return { tickets: (data?.tickets as AdminSupportTicket[]) ?? [], error: null };
}

export async function replySupportTicket(
  ticketId: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend não conectado." };
  const { data, error } = await supabase.functions.invoke("admin-support", {
    body: { action: "reply", ticketId, body },
  });
  if (error) return { ok: false, error: error.message };
  if (data?.error) return { ok: false, error: data.error as string };
  return { ok: true };
}

export async function closeSupportTicket(
  ticketId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend não conectado." };
  const { data, error } = await supabase.functions.invoke("admin-support", {
    body: { action: "close", ticketId },
  });
  if (error) return { ok: false, error: error.message };
  if (data?.error) return { ok: false, error: data.error as string };
  return { ok: true };
}
