// Edge Function: lista todas as alunas (lojas criadas) pro painel central
// (/admin) — só quem é admin (tem o papel de admin) consegue chamar.
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
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // 1) Quem está chamando? (usa o token da própria aluna/admin logada)
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: callerData } = await serviceClient.auth.getUser(jwt);
    const caller = callerData.user;
    if (!caller) {
      return json({ error: "Não autenticado." }, 401);
    }

    const { data: callerRole } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerRole) {
      return json({ error: "Só o acesso central pode ver essa lista." }, 403);
    }

    // 2) A partir daqui, usa a service role pra ver todo mundo.
    const adminClient = serviceClient;

    const { data: usersList, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });
    if (usersError) throw usersError;

    const { data: stores } = await adminClient
      .from("store_config")
      .select("user_id, slug, data, updated_at, active, status, backup_until");

    const { data: subs } = await adminClient.from("subscribers").select("*");

    // Assinaturas (fonte oficial do plano e do vencimento).
    const { data: subscriptions } = await adminClient
      .from("subscriptions")
      .select(
        "user_id, email, plan, status, started_at, current_period_end, auto_renew, cancelled_at, hubla_subscription_id, hubla_offer_id, is_current, updated_at"
      )
      .order("is_current", { ascending: false })
      .order("updated_at", { ascending: false });
    const subscriptionByUser = new Map<string, Record<string, unknown>>();
    const subscriptionByEmail = new Map<string, Record<string, unknown>>();
    for (const s of subscriptions ?? []) {
      const row = s as Record<string, unknown>;
      const uid = row.user_id as string | null;
      const mail = String(row.email ?? "").toLowerCase();
      if (uid && !subscriptionByUser.has(uid)) subscriptionByUser.set(uid, row);
      if (mail && !subscriptionByEmail.has(mail)) subscriptionByEmail.set(mail, row);
    }

    // Fonte alternativa (e mais confiavel hoje): compradores_ativos, alimentada
    // pelo webhook da Hubla.
    const { data: compradores } = await adminClient
      .from("compradores_ativos")
      .select("email, status, plano, hubla_event, updated_at");
    const compByEmail = new Map(
      (compradores ?? []).map((c) => [String(c.email).toLowerCase(), c])
    );

    const { data: overrides } = await adminClient
      .from("plan_overrides")
      .select("user_id, plan");
    const overrideByUser = new Map(
      (overrides ?? []).map((o) => [o.user_id as string, String(o.plan)])
    );

    const storeByUser = new Map((stores ?? []).map((s) => [s.user_id, s]));
    const subByEmail = new Map(
      (subs ?? []).map((s) => [String(s.email).toLowerCase(), s])
    );

    const alunas = usersList.users
      .filter((u) => u.email) // ignora contas sem e-mail (ex: um admin criado sem e-mail, raro)
      .map((u) => {
        const store = storeByUser.get(u.id);
        const key = u.email ? u.email.toLowerCase() : "";
        const sub = key ? subByEmail.get(key) : undefined;
        const comp = key ? compByEmail.get(key) : undefined;
        const subscription =
          subscriptionByUser.get(u.id) ?? (key ? subscriptionByEmail.get(key) : undefined) ?? null;
        const compStatus = comp
          ? String(comp.status) === "ativo"
            ? "ativo"
            : "cancelado"
          : null;
        const storeData = store?.data as { brand?: { storeName?: string } } | undefined;
        const override = overrideByUser.get(u.id) ?? null;
        const subscriptionPlan = (subscription?.plan as string | null) ?? null;
        return {
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
          slug: store?.slug ?? null,
          storeName: storeData?.brand?.storeName ?? null,
          storeUpdatedAt: store?.updated_at ?? null,
          active: store ? (store as { active?: boolean }).active !== false : true,
          storeStatus: store ? String((store as { status?: string }).status ?? "active") : null,
          backupUntil: (store as { backup_until?: string | null } | undefined)?.backup_until ?? null,
          paymentStatus: sub?.status ?? compStatus ?? "desconhecido",
          plan: override ?? subscriptionPlan ?? sub?.plan ?? comp?.plano ?? null,
          lastPaymentEventAt: sub?.hubla_event_at ?? comp?.updated_at ?? null,
          lastPaymentEvent: sub?.hubla_event ?? comp?.hubla_event ?? null,
          planOverride: override,
          subscriptionPlan,
          subscriptionStatus: (subscription?.status as string | null) ?? null,
          subscriptionStartedAt: (subscription?.started_at as string | null) ?? null,
          currentPeriodEnd: (subscription?.current_period_end as string | null) ?? null,
          autoRenew:
            typeof subscription?.auto_renew === "boolean" ? (subscription.auto_renew as boolean) : null,
          cancelledAt: (subscription?.cancelled_at as string | null) ?? null,
          hublaSubscriptionId: (subscription?.hubla_subscription_id as string | null) ?? null,
          hublaOfferId: (subscription?.hubla_offer_id as string | null) ?? null,
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
