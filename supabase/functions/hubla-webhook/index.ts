// Edge Function: recebe os avisos (webhooks) da Hubla.
//
// URL na Hubla (Integracoes -> Webhooks) — a MESMA de antes:
//   https://<projeto>.supabase.co/functions/v1/hubla-webhook?secret=HUBLA_WEBHOOK_SECRET
// A Hubla tambem manda o segredo no header X-Hubla-Token — aceitamos os dois.
//
// O que esta funcao faz (nesta ordem):
//   1. valida o segredo;
//   2. registra o aviso em webhook_events (idempotencia: aviso repetido nao
//      e processado de novo);
//   3. identifica o plano pelo id da OFERTA (plan_mapping);
//   4. encontra a cliente (profiles) e a loja existente (store_config) —
//      NUNCA cria loja aqui: a loja continua sendo criada no primeiro
//      acesso ao painel (createMyStore);
//   5. cria/atualiza a assinatura em subscriptions (historico preservado);
//   6. mantem subscribers e compradores_ativos como antes (a pagina
//      /bem-vindo depende de compradores_ativos);
//   7. liga/desliga a loja apenas quando o direito de acesso realmente
//      termina — cancelar renovacao NAO bloqueia.
//
// Nenhum dado de loja e apagado em nenhuma situacao.

import { createClient } from "npm:@supabase/supabase-js@2";
import { actionForEvent, eventIdFor, parseHubla } from "../_shared/hubla.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const RETENTION_DAYS = 30;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function log(step: string, detail?: unknown) {
  if (detail === undefined) console.log(`hubla-webhook:${step}`);
  else console.log(`hubla-webhook:${step}`, typeof detail === "string" ? detail : JSON.stringify(detail));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WEBHOOK_SECRET = Deno.env.get("HUBLA_WEBHOOK_SECRET");

  const url = new URL(req.url);
  const rawBody = await req.text();
  log("recebido", { len: rawBody.length });

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
    console.error("hubla-webhook:nao-autorizado — token recebido nao bate com HUBLA_WEBHOOK_SECRET");
    return json({ error: "Não autorizado." }, 401);
  }

  let body: unknown = {};
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      try {
        body = Object.fromEntries(new URLSearchParams(rawBody).entries());
      } catch {
        log("corpo-invalido");
        return json({ ok: true, note: "corpo nao-JSON" });
      }
    }
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const parsed = parseHubla(body);
  const action = actionForEvent(parsed.eventType);
  const eventId = await eventIdFor(body, rawBody, parsed);
  const email = parsed.email ? parsed.email.trim().toLowerCase() : null;

  log("lido", {
    eventType: parsed.eventType,
    action,
    email,
    offerId: parsed.offerId,
    subscriptionId: parsed.subscriptionId,
    periodEnd: parsed.periodEnd,
    periodEndSource: parsed.periodEndSource,
    autoRenew: parsed.autoRenew,
  });

  // ---- 2) Idempotencia ----
  const { data: registered, error: registerError } = await admin
    .from("webhook_events")
    .insert({
      hubla_event_id: eventId,
      event_type: parsed.eventType || null,
      event_at: parsed.eventAt,
      email,
      hubla_subscription_id: parsed.subscriptionId,
      payload: body as Record<string, unknown>,
    })
    .select("id")
    .maybeSingle();

  if (registerError) {
    if (registerError.code === "23505") {
      log("duplicado", eventId);
      return json({ ok: true, duplicate: true, event: parsed.eventType });
    }
    console.error("hubla-webhook:erro-registro", registerError.message);
  }
  const eventRowId = registered?.id as string | undefined;

  const finish = async (note: string, extra: Record<string, unknown> = {}) => {
    if (eventRowId) {
      await admin
        .from("webhook_events")
        .update({ processed: true, processed_at: new Date().toISOString(), note })
        .eq("id", eventRowId);
    }
    log("concluido", { note, ...extra });
    return json({ ok: true, event: parsed.eventType, action, note, ...extra });
  };

  if (!email) {
    console.error("hubla-webhook:sem-email");
    return await finish("e-mail nao encontrado no aviso");
  }

  // ---- Espelho historico (comportamento antigo preservado) ----
  const legacyStatus =
    action === "activate"
      ? "ativo"
      : action === "deactivate"
        ? "cancelado"
        : action === "payment_issue"
          ? "inadimplente"
          : action === "cancel_renewal" || action === "resume_renewal"
            ? "ativo"
            : "desconhecido";

  await admin.from("subscribers").upsert(
    {
      email,
      status: legacyStatus,
      plan: parsed.offerName,
      hubla_event: parsed.eventType || null,
      hubla_event_at: new Date().toISOString(),
      raw: body as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (action === "unknown") {
    console.warn("hubla-webhook:evento-nao-tratado", parsed.eventType);
    return await finish(`evento nao tratado: ${parsed.eventType || "(sem tipo)"}`);
  }
  if (action === "payment_issue") {
    // Tentativa/falha de cobranca NAO bloqueia: a Hubla ainda pode
    // recobrar dentro do periodo. O acesso cai sozinho no vencimento.
    return await finish("falha de cobranca registrada — acesso mantido ate o vencimento");
  }

  // ---- 3) Plano pela OFERTA ----
  let plan: "essential" | "pro" | null = null;
  if (parsed.offerId) {
    const { data: mapping } = await admin
      .from("plan_mapping")
      .select("plan")
      .eq("hubla_offer_id", parsed.offerId)
      .eq("active", true)
      .maybeSingle();
    plan = (mapping?.plan as "essential" | "pro" | undefined) ?? null;
    if (!plan) console.warn("hubla-webhook:oferta-sem-mapeamento", parsed.offerId);
  }

  // ---- 4) Cliente e loja existentes ----
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  const userId = (profile?.id as string | undefined) ?? null;

  const { data: store } = userId
    ? await admin
        .from("store_config")
        .select("id, status")
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };
  const storeId = (store as { id?: string } | null)?.id ?? null;
  log(userId ? (storeId ? "loja-existente" : "cliente-sem-loja") : "cliente-ainda-sem-conta", email);

  // ---- 5) Assinatura ----
  const nowIso = new Date().toISOString();
  let existing: Record<string, unknown> | null = null;
  if (parsed.subscriptionId) {
    const { data } = await admin
      .from("subscriptions")
      .select("*")
      .eq("hubla_subscription_id", parsed.subscriptionId)
      .maybeSingle();
    existing = (data as Record<string, unknown> | null) ?? null;
  }
  if (!existing) {
    const { data } = await admin
      .from("subscriptions")
      .select("*")
      .eq("email", email)
      .is("hubla_subscription_id", null)
      .eq("is_current", true)
      .maybeSingle();
    existing = (data as Record<string, unknown> | null) ?? null;
  }

  // ---- Aviso fora de ordem: nunca deixar evento antigo sobrescrever ----
  if (existing) {
    const prevAt = existing.last_event_at ? new Date(String(existing.last_event_at)).getTime() : null;
    const nextAt = parsed.eventAt ? new Date(parsed.eventAt).getTime() : null;
    const prevVersion = typeof existing.last_event_version === "number" ? existing.last_event_version : null;
    const nextVersion = parsed.version;

    const olderByVersion =
      prevVersion !== null && nextVersion !== null && nextVersion < prevVersion;
    const olderByTime = prevAt !== null && nextAt !== null && nextAt < prevAt;
    const newerByVersion = prevVersion !== null && nextVersion !== null && nextVersion > prevVersion;

    if (olderByVersion || (olderByTime && !newerByVersion)) {
      console.warn("hubla-webhook:evento-fora-de-ordem-descartado", parsed.eventType);
      return await finish("aviso mais antigo que o estado atual — registrado e ignorado");
    }
  }

  const periodEnd = parsed.periodEnd ?? (existing?.current_period_end as string | null) ?? null;
  const periodEndMs = periodEnd ? new Date(periodEnd).getTime() : null;
  const stillPaid = periodEndMs === null ? true : periodEndMs > Date.now();

  let status: "active" | "cancelled" | "expired" = "active";
  let autoRenew = parsed.autoRenew ?? (existing?.auto_renew as boolean | undefined) ?? true;
  let cancelledAt = (existing?.cancelled_at as string | null) ?? null;
  let deactivatedAt = (existing?.deactivated_at as string | null) ?? null;

  if (action === "activate") {
    status = "active";
    autoRenew = parsed.autoRenew ?? true;
    cancelledAt = null;
    deactivatedAt = null;
  } else if (action === "cancel_renewal") {
    // Cancelou a renovacao: perde apenas a renovacao automatica.
    status = "active";
    autoRenew = false;
    cancelledAt = parsed.cancelledAt ?? parsed.eventAt ?? nowIso;
  } else if (action === "deactivate") {
    autoRenew = false;
    deactivatedAt = parsed.deactivatedAt ?? parsed.eventAt ?? nowIso;
    // So expira se o periodo pago realmente acabou.
    status = stillPaid ? "cancelled" : "expired";
    if (!cancelledAt) cancelledAt = parsed.cancelledAt ?? parsed.eventAt ?? nowIso;
  }

  const payload = {
    user_id: userId,
    email,
    store_id: storeId ?? (existing?.store_id as string | null) ?? null,
    hubla_subscription_id: parsed.subscriptionId,
    hubla_product_id: parsed.productId,
    hubla_offer_id: parsed.offerId ?? (existing?.hubla_offer_id as string | null) ?? null,
    plan: plan ?? (existing?.plan as "essential" | "pro" | null) ?? null,
    status,
    is_current: true,
    started_at: parsed.startedAt ?? (existing?.started_at as string | null) ?? nowIso,
    current_period_end: periodEnd,
    period_end_source: parsed.periodEndSource,
    auto_renew: autoRenew,
    cancelled_at: cancelledAt,
    deactivated_at: deactivatedAt,
    last_event_type: parsed.eventType || null,
    last_event_at: parsed.eventAt ?? nowIso,
    last_event_version: parsed.version,
    updated_at: nowIso,
  };

  let subscriptionId: string | null = null;
  if (existing) {
    const { data, error } = await admin
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id as string)
      .select("id")
      .maybeSingle();
    if (error) console.error("hubla-webhook:erro-assinatura", error.message);
    subscriptionId = (data?.id as string | undefined) ?? (existing.id as string);
    log("assinatura-atualizada", { subscriptionId, status, plan: payload.plan });
  } else {
    const { data, error } = await admin
      .from("subscriptions")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error) console.error("hubla-webhook:erro-assinatura", error.message);
    subscriptionId = (data?.id as string | undefined) ?? null;
    log("assinatura-criada", { subscriptionId, status, plan: payload.plan });
  }

  // Historico: qualquer outra assinatura da mesma cliente deixa de ser a atual.
  if (subscriptionId) {
    await admin
      .from("subscriptions")
      .update({ is_current: false })
      .eq("email", email)
      .neq("id", subscriptionId);
  }

  // ---- 6/7) Situacao da loja ----
  const hasAccess = status === "active" || (status === "cancelled" && stillPaid);
  let storeUpdated = false;

  if (userId) {
    if (hasAccess) {
      const { error } = await admin
        .from("store_config")
        .update({ status: "active", backup_until: null, active: true })
        .eq("user_id", userId);
      storeUpdated = !error;
      if (storeUpdated) log("loja-restaurada-ou-mantida-ativa", email);
    } else {
      const base = periodEnd ? new Date(periodEnd) : new Date();
      const backupUntil = new Date(base.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const { error } = await admin
        .from("store_config")
        .update({ status: "suspended", backup_until: backupUntil.toISOString(), active: false })
        .eq("user_id", userId);
      storeUpdated = !error;
      if (storeUpdated) log("loja-suspensa", { email, backupUntil: backupUntil.toISOString() });
    }
  }

  await admin.from("compradores_ativos").upsert(
    {
      email,
      status: hasAccess ? "ativo" : "inativo",
      plano: plan ?? parsed.offerName,
      hubla_event: parsed.eventType || null,
      updated_at: nowIso,
    },
    { onConflict: "email" }
  );

  return await finish("processado", {
    email,
    plan: payload.plan,
    status,
    autoRenew,
    currentPeriodEnd: periodEnd,
    periodEndSource: parsed.periodEndSource,
    hasAccess,
    storeUpdated,
    storeFound: Boolean(storeId),
  });
});
