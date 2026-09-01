import { supabase } from "./supabaseClient";

export interface NewLead {
  storeUserId: string; // dono da loja onde o quiz foi respondido
  name: string;
  whatsapp: string;
  answers: Record<string, string>;
}

export async function saveLead(lead: NewLead): Promise<{ error: string | null }> {
  // Sem Supabase conectado ainda, não trava o fluxo da cliente — ela
  // segue direto pro resultado, só não fica um registro na dashboard.
  if (!supabase) return { error: null };
  const { error } = await supabase.from("leads").insert({
    store_user_id: lead.storeUserId,
    name: lead.name,
    whatsapp: lead.whatsapp,
    answers: lead.answers,
  });
  return { error: error?.message ?? null };
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  whatsapp: string;
  answers: Record<string, string>;
  contacted: boolean;
}

export async function fetchLeads(): Promise<Lead[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Lead[];
}

export async function setLeadContacted(id: string, contacted: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("leads").update({ contacted }).eq("id", id);
  return !error;
}
