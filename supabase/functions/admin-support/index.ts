// Edge Function: lista e responde as solicitações de suporte humano no
// painel central (/admin). Precisa cruzar os tickets com o e-mail e o
// plano (Essencial/PRO) de cada aluna, dados que só a service role vê —
// por isso vive aqui e não numa consulta direta do front.
//
// Deploy:
//   supabase functions deploy admin-support

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: callerData } = await admin.auth.getUser(jwt);
    const caller = callerData.user;
    if (!caller) return json({ error: "Não autenticado." }, 401);

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!callerRole) return json({ error: "Só o acesso central pode ver o suporte." }, 403);

    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = (payload.action as string) ?? "list";

    if (action === "reply") {
      const ticketId = payload.ticketId as string;
      const body = String(payload.body ?? "").trim();
      if (!ticketId || !body) return json({ error: "Faltou a mensagem." }, 400);

      const { error } = await admin
        .from("support_messages")
        .insert({ ticket_id: ticketId, sender: "admin", body });
      if (error) throw error;

      await admin
        .from("support_tickets")
        .update({
          status: "respondido",
          awaiting_admin: false,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      return json({ ok: true });
    }

    if (action === "close") {
      const ticketId = payload.ticketId as string;
      if (!ticketId) return json({ error: "Faltou o ticket." }, 400);
      await admin
        .from("support_tickets")
        .update({ status: "fechado", awaiting_admin: false })
        .eq("id", ticketId);
      return json({ ok: true });
    }

    // action === "list"
    const { data: tickets, error: ticketsError } = await admin
      .from("support_tickets")
      .select("id, user_id, subject, status, awaiting_admin, last_message_at, created_at")
      .order("last_message_at", { ascending: false })
      .limit(200);
    if (ticketsError) throw ticketsError;

    const ids = (tickets ?? []).map((t) => t.id);
    const { data: messages } = ids.length
      ? await admin
          .from("support_messages")
          .select("id, ticket_id, sender, body, created_at")
          .in("ticket_id", ids)
          .order("created_at", { ascending: true })
      : { data: [] as unknown[] };

    const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map((usersList?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    const { data: subs } = await admin.from("subscribers").select("email, plan, status");
    const subByEmail = new Map(
      (subs ?? []).map((s) => [String(s.email).toLowerCase(), s as { plan?: string | null }])
    );

    const { data: stores } = await admin.from("store_config").select("user_id, data");
    const storeNameById = new Map(
      (stores ?? []).map((s) => [
        s.user_id,
        ((s.data as { brand?: { storeName?: string } })?.brand?.storeName ?? null) as string | null,
      ])
    );

    const result = (tickets ?? []).map((t) => {
      const email = emailById.get(t.user_id) ?? "";
      const plan = subByEmail.get(email.toLowerCase())?.plan ?? null;
      const isPro = typeof plan === "string" && plan.toLowerCase().includes("pro");
      return {
        id: t.id,
        userId: t.user_id,
        email,
        storeName: storeNameById.get(t.user_id) ?? null,
        plan,
        isPro,
        status: t.status,
        awaitingAdmin: t.awaiting_admin,
        lastMessageAt: t.last_message_at,
        createdAt: t.created_at,
        messages: ((messages ?? []) as Array<Record<string, unknown>>)
          .filter((m) => m.ticket_id === t.id)
          .map((m) => ({
            id: m.id as string,
            sender: m.sender as "aluna" | "admin",
            body: m.body as string,
            createdAt: m.created_at as string,
          })),
      };
    });

    return json({ tickets: result });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Erro inesperado." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
