import { supabase } from "./supabaseClient";
import { cachedQuery, invalidateCache } from "./queryCache";

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

const LEADS_KEY = "leads";
const LEADS_TTL = 3 * 60 * 1000;
// Trazemos só o que a tela mostra e limitamos o volume — a lista é
// agrupada por data, então os mais recentes são o que importa.
const LEADS_LIMIT = 500;

export async function fetchLeads(force = false): Promise<Lead[]> {
  if (!supabase) return [];
  return cachedQuery(
    LEADS_KEY,
    async () => {
      const { data, error } = await supabase!
        .from("leads")
        .select("id, created_at, name, whatsapp, answers, contacted")
        .order("created_at", { ascending: false })
        .limit(LEADS_LIMIT);
      if (error || !data) return [];
      return data as Lead[];
    },
    { ttl: LEADS_TTL, force }
  );
}

export async function setLeadContacted(id: string, contacted: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("leads").update({ contacted }).eq("id", id);
  // O que está em cache ficou desatualizado depois da mudança.
  if (!error) invalidateCache(LEADS_KEY);
  return !error;
}
