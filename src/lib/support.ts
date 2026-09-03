import { supabase } from "./supabaseClient";

// Suporte humano: quando a IA não consegue resolver, a aluna abre (ou
// reaproveita) um ticket e manda a mensagem. A administração central
// responde pelo painel /admin e a resposta aparece aqui no chat.

export interface SupportMessage {
  id: string;
  sender: "aluna" | "admin";
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  status: string;
  subject: string | null;
  lastMessageAt: string;
}

export async function sendSupportRequest(
  body: string,
  subject?: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend não conectado." };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: "Faça login novamente pra falar com o suporte." };

  // Reaproveita um ticket aberto, se existir.
  const { data: existing } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("user_id", user.id)
    .neq("status", "fechado")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let ticketId = existing?.id as string | undefined;

  if (!ticketId) {
    const { data: created, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: subject ?? null })
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: "Não consegui abrir o suporte agora." };
    ticketId = created.id as string;
  }

  const { error: msgError } = await supabase
    .from("support_messages")
    .insert({ ticket_id: ticketId, sender: "aluna", body });
  if (msgError) return { ok: false, error: "Não consegui enviar sua mensagem agora." };

  await supabase
    .from("support_tickets")
    .update({ status: "aberto", awaiting_admin: true, last_message_at: new Date().toISOString() })
    .eq("id", ticketId);

  return { ok: true };
}

export async function fetchMySupportMessages(): Promise<SupportMessage[]> {
  if (!supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return [];

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("user_id", user.id);
  const ids = (tickets ?? []).map((t) => t.id as string);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("support_messages")
    .select("id, sender, body, created_at")
    .in("ticket_id", ids)
    .order("created_at", { ascending: true });

  return (data ?? []).map((m) => ({
    id: m.id as string,
    sender: m.sender as "aluna" | "admin",
    body: m.body as string,
    createdAt: m.created_at as string,
  }));
}
