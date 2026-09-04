// Edge Function: recebe os webhooks da Hubla e espelha o status de
// pagamento (adimplente/inadimplente) na tabela `subscribers`, que
// alimenta o painel central (/admin).
//
// ⚠️ IMPORTANTE — isso ainda não foi validado com um evento REAL da Hubla.
// A documentação pública deles não deixou 100% claro o formato exato do
// payload, então essa função tenta várias formas comuns de vir o e-mail e
// o tipo de evento (defensivo, não quebra se algum campo não existir), mas
// o ideal é: você disparar um evento de teste na Hubla (Integrações →
// Webhooks → tem um botão de testar/disparar) apontando pra essa URL, me
// mandar o conteúdo que chegou (dá pra ver em Supabase → Edge Functions →
// hubla-webhook → Logs), e eu ajusto os nomes de campo certinho.
//
// Deploy:
//   supabase functions deploy hubla-webhook --no-verify-jwt
//   (--no-verify-jwt é OBRIGATÓRIO: quem chama isso é a Hubla, não uma
//   usuária logada — ela não manda um token de login do Supabase)
//
// Configuração na Hubla (Integrações → Webhooks):
//   URL:    https://SEU-PROJETO.supabase.co/functions/v1/hubla-webhook?secret=SEU_SEGREDO
//   Eventos: ative os de assinatura/fatura (ex: pagamento aprovado, atrasado,
//            cancelado, recusado — os nomes exatos variam, ative os que
//            existirem nessas categorias: Subscription / Invoice)
//
// Segredo necessário (Supabase → Edge Functions → Secrets):
//   HUBLA_WEBHOOK_SECRET → invente uma senha longa e aleatória, cole ela
//   tanto aqui quanto na URL configurada na Hubla (?secret=...). Isso evita
//   que qualquer pessoa na internet chame essa URL e mude status de pagamento.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Eventos "bons" (libera acesso) vs "ruins" (marca inadimplente/cancelado).
// Ajuste essas listas quando confirmar os nomes reais que a Hubla manda.
const ACTIVE_HINTS = [
  "newsale",
  "new_sale",
  "new.sale",
  "nova venda",
  "novavenda",
  "sale",
  "venda",
  "purchase",
  "paid",
  "approved",
  "aprovad",
  "renew",
  "active",
  "confirmed",
  "payment_succeeded",
];
const PAST_DUE_HINTS = ["late", "atras", "overdue", "past_due", "failed", "recusad", "chargeback"];
const CANCELED_HINTS = ["cancel", "refund", "estorn", "expired", "expirad"];

function classify(eventType: string): "ativo" | "inadimplente" | "cancelado" | "desconhecido" {
  const t = eventType.toLowerCase();
  if (CANCELED_HINTS.some((h) => t.includes(h))) return "cancelado";
  if (PAST_DUE_HINTS.some((h) => t.includes(h))) return "inadimplente";
  if (ACTIVE_HINTS.some((h) => t.includes(h))) return "ativo";
  return "desconhecido";
}

function dig(obj: unknown, paths: string[][]): string | null {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const key of path) {
      if (cur && typeof cur === "object" && key in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[key];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" && cur.trim()) return cur;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WEBHOOK_SECRET = Deno.env.get("HUBLA_WEBHOOK_SECRET");

  // A Hubla pode mandar o segredo no header (x-hubla-token / authorization)
  // ou a gente coloca ele na própria URL (?secret=...). Aceitamos os dois.
  const url = new URL(req.url);
  const headerSecret =
    req.headers.get("x-hubla-token") ??
    req.headers.get("x-hubla-signature") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  const secret = url.searchParams.get("secret") ?? headerSecret;
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return json({ error: "Não autorizado." }, 401);
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: true, note: "corpo vazio ou não-JSON, ignorado" });
  }

  const email = dig(body, [
    ["email"],
    ["user", "email"],
    ["customer", "email"],
    ["buyer", "email"],
    ["data", "email"],
    ["data", "user", "email"],
    ["data", "customer", "email"],
    ["event", "email"],
    ["payload", "email"],
  ]);

  const eventType =
    dig(body, [
      ["event"],
      ["type"],
      ["eventType"],
      ["event_type"],
      ["event", "type"],
      ["data", "event"],
      ["data", "type"],
      ["data", "event", "type"],
      ["topic"],
    ]) ?? "";

  const plan = dig(body, [
    ["plan"],
    ["offer"],
    ["product"],
    ["data", "plan"],
    ["data", "product", "name"],
    ["data", "offer", "name"],
  ]);

  // Sempre responde 200 pra Hubla não ficar tentando de novo — mesmo quando
  // não conseguimos identificar o e-mail, registramos o evento bruto pra
  // você conseguir olhar nos Logs da função e me passar o formato certo.
  if (!email) {
    return json({
      ok: true,
      warning: "Não encontrei um e-mail nesse payload — confira os Logs pra ver o formato real.",
    });
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const status = classify(eventType);

  const { error } = await adminClient.from("subscribers").upsert(
    {
      email,
      status,
      plan,
      hubla_event: eventType || null,
      hubla_event_at: new Date().toISOString(),
      raw: body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (error) return json({ ok: false, error: error.message }, 500);

  // Espelha em compradores_ativos: venda aprovada → 'ativo';
  // cancelamento/reembolso/inadimplência → 'inativo'.
  if (status === "ativo" || status === "cancelado" || status === "inadimplente") {
    await adminClient.from("compradores_ativos").upsert(
      {
        email: email.trim().toLowerCase(),
        status: status === "ativo" ? "ativo" : "inativo",
        plano: plan,
        hubla_event: eventType || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  }



  // Nova venda / pagamento aprovado → libera o link da loja da aluna.
  // Cancelamento ou inadimplência → tira do ar automaticamente.
  let storeUpdated = false;
  if (status === "ativo" || status === "cancelado" || status === "inadimplente") {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (profile?.id) {
      const { error: storeError } = await adminClient
        .from("store_config")
        .update({ active: status === "ativo" })
        .eq("user_id", profile.id);
      storeUpdated = !storeError;
    }
  }

  return json({ ok: true, email, status, event: eventType || null, storeUpdated });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
