// Edge Function: recebe os webhooks da Hubla, registra o comprador em
// `compradores_ativos` (usado pela pagina /bem-vindo) e espelha o status em
// `subscribers` (painel /admin).
//
// URL na Hubla (Integracoes -> Webhooks):
//   https://<projeto>.supabase.co/functions/v1/hubla-webhook?secret=HUBLA_WEBHOOK_SECRET
// A Hubla tambem manda o segredo no header X-Hubla-Token — aceitamos os dois.
//
// Tudo que chega e logado (headers relevantes + payload) pra facilitar debug.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const PAST_DUE_HINTS = ["late", "atras", "overdue", "past_due", "failed", "recusad", "chargeback", "declin"];
const CANCELED_HINTS = ["cancel", "refund", "estorn", "expired", "expirad", "member_removed", "membro_removido"];
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
  "payment_succeeded",
  "succeeded",
  "approved",
  "aprovad",
  "renew",
  "active",
  "confirmed",
  "member_added",
  "membro_adicionado",
  "subscription.created",
];

type Status = "ativo" | "inadimplente" | "cancelado" | "desconhecido";

function classify(eventType: string): Status {
  const t = eventType.toLowerCase();
  if (CANCELED_HINTS.some((h) => t.includes(h))) return "cancelado";
  if (PAST_DUE_HINTS.some((h) => t.includes(h))) return "inadimplente";
  if (ACTIVE_HINTS.some((h) => t.includes(h))) return "ativo";
  return "desconhecido";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Busca recursiva: encontra o primeiro valor que "parece" e-mail em qualquer
// nivel do JSON (prioriza chaves com 'email' no nome).
function findEmail(obj: unknown, depth = 0): string | null {
  if (depth > 8 || obj == null) return null;
  if (typeof obj === "string") return EMAIL_RE.test(obj.trim()) ? obj.trim() : null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findEmail(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof obj !== "object") return null;
  const entries = Object.entries(obj as Record<string, unknown>);
  // 1a passada: chaves que mencionam email
  for (const [k, v] of entries) {
    if (k.toLowerCase().includes("email") && typeof v === "string" && EMAIL_RE.test(v.trim())) {
      return v.trim();
    }
  }
  // 2a passada: qualquer coisa aninhada
  for (const [, v] of entries) {
    const found = findEmail(v, depth + 1);
    if (found) return found;
  }
  return null;
}

function findString(obj: unknown, keys: string[], depth = 0): string | null {
  if (depth > 8 || obj == null || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findString(item, keys, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [k, v] of entries) {
    if (keys.includes(k.toLowerCase()) && typeof v === "string" && v.trim()) return v.trim();
  }
  for (const [, v] of entries) {
    const found = findString(v, keys, depth + 1);
    if (found) return found;
  }
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WEBHOOK_SECRET = Deno.env.get("HUBLA_WEBHOOK_SECRET");

  const url = new URL(req.url);
  const rawBody = await req.text();

  // Log de diagnostico (sem imprimir o segredo).
  const headerNames = [...req.headers.keys()].join(",");
  console.log("hubla-webhook:in", req.method, "headers:", headerNames, "len:", rawBody.length);
  console.log("hubla-webhook:body", rawBody.slice(0, 4000));

  const candidates = [
    url.searchParams.get("secret"),
    req.headers.get("x-hubla-token"),
    req.headers.get("x-hubla-signature"),
    req.headers.get("x-hubla-webhook-token"),
    req.headers.get("x-webhook-token"),
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null,
    req.headers.get("apikey"),
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  const authorized = !!WEBHOOK_SECRET && candidates.some((c) => c.trim() === WEBHOOK_SECRET.trim());
  if (!authorized) {
    console.error("hubla-webhook:unauthorized — nenhum dos tokens recebidos bate com HUBLA_WEBHOOK_SECRET");
    return json({ error: "Não autorizado." }, 401);
  }

  let body: unknown = {};
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Alguns provedores mandam form-urlencoded
      try {
        const params = new URLSearchParams(rawBody);
        body = Object.fromEntries(params.entries());
      } catch {
        console.warn("hubla-webhook: corpo nao-JSON ignorado");
        return json({ ok: true, note: "corpo nao-JSON" });
      }
    }
  }

  const email = findEmail(body);
  const eventType =
    findString(body, ["type", "event", "eventtype", "event_type", "topic", "kind"]) ?? "";
  const plan = findString(body, ["plan", "planname", "offer", "productname", "product_name"]);

  console.log("hubla-webhook:parsed", JSON.stringify({ email, eventType, plan }));

  if (!email) {
    console.error("hubla-webhook: nenhum e-mail encontrado no payload");
    return json({ ok: true, warning: "e-mail nao encontrado no payload" });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const status = classify(eventType);
  const normalized = email.trim().toLowerCase();

  const { error: subError } = await admin.from("subscribers").upsert(
    {
      email: normalized,
      status,
      plan,
      hubla_event: eventType || null,
      hubla_event_at: new Date().toISOString(),
      raw: body as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
  if (subError) console.error("hubla-webhook:subscribers", subError.message);

  // Regra principal: qualquer evento que nao seja cancelamento/inadimplencia
  // libera o cadastro. Eventos desconhecidos de uma venda real nao devem
  // travar a aluna — se for cancelamento, o proximo evento marca inativo.
  const ativo = status === "ativo" || status === "desconhecido";

  const { error: compError } = await admin.from("compradores_ativos").upsert(
    {
      email: normalized,
      status: ativo ? "ativo" : "inativo",
      plano: plan,
      hubla_event: eventType || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
  if (compError) console.error("hubla-webhook:compradores_ativos", compError.message);

  // Liga/desliga o link da loja da aluna conforme o pagamento.
  let storeUpdated = false;
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();
  if (profile?.id) {
    const { error: storeError } = await admin
      .from("store_config")
      .update({ active: ativo })
      .eq("user_id", profile.id);
    storeUpdated = !storeError;
  }

  console.log("hubla-webhook:done", normalized, status, "ativo:", ativo);

  return json({
    ok: true,
    email: normalized,
    status,
    ativo,
    event: eventType || null,
    storeUpdated,
    saved: !compError,
  });
});
