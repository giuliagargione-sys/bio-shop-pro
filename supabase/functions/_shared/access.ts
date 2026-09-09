// Fonte ÚNICA de verdade do acesso: usada pela função my-access e por
// toda função protegida do servidor (insights com IA, ajuda com IA...).
//
// Regra central: a cliente pode usar o sistema quando
//   assinatura vigente (ativa, ou cancelada mas dentro do período pago)
//   E a loja não está suspensa/arquivada.
// Liberação manual da administração central (plan_overrides) continua
// tendo prioridade, como antes.
//
// Nunca bloqueia por falta de informação: quem não tem assinatura
// registrada (contas antigas/manuais) segue com acesso.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type Plan = "essential" | "pro";

export interface AccessInfo {
  isAdmin: boolean;
  canUse: boolean;
  /** "active" | "suspended" | "archived" | "no_store" */
  storeStatus: string;
  plan: Plan | "admin" | null;
  /** Compatibilidade com o app atual. */
  isPro: boolean;
  features: Record<string, boolean>;
  subscription: {
    id: string | null;
    status: string | null;
    hublaSubscriptionId: string | null;
    hublaOfferId: string | null;
    startedAt: string | null;
    currentPeriodEnd: string | null;
    autoRenew: boolean | null;
    cancelledAt: string | null;
  } | null;
  backupUntil: string | null;
  /** "ok" | "expired" | "store_suspended" | "store_archived" */
  reason: string;
  planSource: "admin" | "manual" | "subscription" | "legacy";
}

let featuresCache: { at: number; rows: Record<string, Record<string, boolean>> } | null = null;

async function loadFeatures(admin: SupabaseClient) {
  if (featuresCache && Date.now() - featuresCache.at < 5 * 60 * 1000) return featuresCache.rows;
  const { data } = await admin.from("plan_features").select("plan, feature, enabled");
  const rows: Record<string, Record<string, boolean>> = { essential: {}, pro: {} };
  for (const r of data ?? []) {
    const plan = String((r as { plan: string }).plan);
    rows[plan] = rows[plan] ?? {};
    rows[plan][String((r as { feature: string }).feature)] = Boolean(
      (r as { enabled: boolean }).enabled
    );
  }
  featuresCache = { at: Date.now(), rows };
  return rows;
}

export async function resolveAccess(
  admin: SupabaseClient,
  userId: string,
  email: string | null
): Promise<AccessInfo> {
  const featureMap = await loadFeatures(admin);
  const all = (plan: Plan) => featureMap[plan] ?? {};

  const { data: adminRole } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole) {
    return {
      isAdmin: true,
      canUse: true,
      storeStatus: "active",
      plan: "admin",
      isPro: true,
      features: { ...all("pro") },
      subscription: null,
      backupUntil: null,
      reason: "ok",
      planSource: "admin",
    };
  }

  const { data: store } = await admin
    .from("store_config")
    .select("id, status, backup_until")
    .eq("user_id", userId)
    .maybeSingle();

  const storeStatus = store ? String((store as { status?: string }).status ?? "active") : "no_store";
  const backupUntil = (store as { backup_until?: string | null } | null)?.backup_until ?? null;

  // Assinatura atual: a marcada como atual, senão a mais recente.
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  const query = admin
    .from("subscriptions")
    .select(
      "id, status, plan, hubla_subscription_id, hubla_offer_id, started_at, current_period_end, auto_renew, cancelled_at, is_current, updated_at"
    )
    .order("is_current", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1);
  const { data: subs } = normalizedEmail
    ? await query.or(`user_id.eq.${userId},email.eq.${normalizedEmail}`)
    : await query.eq("user_id", userId);
  const sub = (subs ?? [])[0] as
    | {
        id: string;
        status: string;
        plan: Plan | null;
        hubla_subscription_id: string | null;
        hubla_offer_id: string | null;
        started_at: string | null;
        current_period_end: string | null;
        auto_renew: boolean | null;
        cancelled_at: string | null;
      }
    | undefined;

  const { data: override } = await admin
    .from("plan_overrides")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  const overridePlan = override?.plan
    ? String(override.plan).toLowerCase().includes("pro")
      ? "pro"
      : "essential"
    : null;

  const now = Date.now();
  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  // Sem data de vencimento conhecida = não bloqueia (prioridade: nunca
  // bloquear quem ainda pode ter período pago).
  const withinPeriod = periodEnd === null || periodEnd > now;
  const subscriptionValid = sub
    ? (sub.status === "active" || sub.status === "cancelled") && withinPeriod
    : true; // conta sem assinatura registrada: acesso mantido (legado)

  const storeOk = storeStatus === "active" || storeStatus === "no_store";

  let reason = "ok";
  if (!storeOk) reason = storeStatus === "archived" ? "store_archived" : "store_suspended";
  else if (!subscriptionValid) reason = "expired";

  // Liberação manual continua tendo prioridade sobre o pagamento.
  const canUse = Boolean(overridePlan) || (storeOk && subscriptionValid);

  const plan: Plan = (overridePlan as Plan | null) ?? sub?.plan ?? "essential";
  const planSource: AccessInfo["planSource"] = overridePlan
    ? "manual"
    : sub?.plan
      ? "subscription"
      : "legacy";

  return {
    isAdmin: false,
    canUse,
    storeStatus,
    plan,
    isPro: plan === "pro",
    features: canUse ? { ...all(plan) } : {},
    subscription: sub
      ? {
          id: sub.id,
          status: sub.status,
          hublaSubscriptionId: sub.hubla_subscription_id,
          hublaOfferId: sub.hubla_offer_id,
          startedAt: sub.started_at,
          currentPeriodEnd: sub.current_period_end,
          autoRenew: sub.auto_renew,
          cancelledAt: sub.cancelled_at,
        }
      : null,
    backupUntil,
    reason: canUse ? "ok" : reason,
    planSource,
  };
}

/** Atalho para funções protegidas: devolve null quando pode seguir. */
export async function requireAccess(
  admin: SupabaseClient,
  userId: string,
  email: string | null,
  feature?: string
): Promise<{ error: string; status: number } | null> {
  const access = await resolveAccess(admin, userId, email);
  if (!access.canUse) {
    return { error: "Seu acesso está suspenso. Reative sua assinatura para continuar.", status: 403 };
  }
  if (feature && access.features[feature] === false) {
    return { error: "Esse recurso é do plano PRO.", status: 403 };
  }
  return null;
}
