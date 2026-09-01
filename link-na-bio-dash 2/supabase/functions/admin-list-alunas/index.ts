// Edge Function: lista todas as alunas (lojas criadas) pro painel central
// (/admin) — só quem é admin (profiles.is_admin = true) consegue chamar.
//
// Precisa ler dados de TODAS as usuárias (e-mail, loja, status de
// pagamento), então usa a service role key — que nunca pode ir pro
// código do front. Por isso isso vive numa Edge Function, não numa
// consulta direta do app.
//
// Deploy:
//   supabase functions deploy admin-list-alunas
//
// Segredos necessários (Supabase → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   (os três primeiros já existem por padrão em todo projeto Supabase)

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
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // 1) Quem está chamando? (usa o token da própria aluna/admin logada)
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData } = await callerClient.auth.getUser();
    const caller = callerData.user;
    if (!caller) {
      return json({ error: "Não autenticado." }, 401);
    }

    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("is_admin")
      .eq("id", caller.id)
      .maybeSingle();

    if (!callerProfile?.is_admin) {
      return json({ error: "Só o acesso central pode ver essa lista." }, 403);
    }

    // 2) A partir daqui, usa a service role pra ver todo mundo.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: usersList, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });
    if (usersError) throw usersError;

    const { data: stores } = await adminClient
      .from("store_config")
      .select("user_id, slug, data, updated_at");

    const { data: subs } = await adminClient.from("subscribers").select("*");

    const storeByUser = new Map((stores ?? []).map((s) => [s.user_id, s]));
    const subByEmail = new Map(
      (subs ?? []).map((s) => [String(s.email).toLowerCase(), s])
    );

    const alunas = usersList.users
      .filter((u) => u.email) // ignora contas sem e-mail (ex: um admin criado sem e-mail, raro)
      .map((u) => {
        const store = storeByUser.get(u.id);
        const sub = u.email ? subByEmail.get(u.email.toLowerCase()) : undefined;
        const storeData = store?.data as { brand?: { storeName?: string } } | undefined;
        return {
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
          slug: store?.slug ?? null,
          storeName: storeData?.brand?.storeName ?? null,
          storeUpdatedAt: store?.updated_at ?? null,
          paymentStatus: sub?.status ?? "desconhecido",
          plan: sub?.plan ?? null,
          lastPaymentEventAt: sub?.hubla_event_at ?? null,
        };
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return json({ alunas });
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
