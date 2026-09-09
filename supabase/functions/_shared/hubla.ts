// Leitura do aviso (webhook) da Hubla — usada pela função hubla-webhook.
//
// Tudo aqui é baseado no formato REAL que a nossa conta Hubla envia
// (version "2.0.0"), como no exemplo já recebido:
//
// {
//   "type": "subscription.activated",
//   "event": {
//     "user": { "email": "...", ... },
//     "product": { "id": "...", "name": "..." },
//     "products": [ { "id": "...", "offers": [ { "id": "...", "name": "..." } ] } ],
//     "subscription": {
//       "id": "...", "status": "active", "autoRenew": true, "version": 3,
//       "credits": 30, "billingCycleMonths": 1,
//       "activatedAt": "...", "modifiedAt": "...", "inactivatedAt": "...",
//       "statusAt": [ { "when": "...", "status": "active" } ],
//       "lastInvoice": { "status": "paid", "saleDate": "...", "dueDate": "..." }
//     }
//   },
//   "version": "2.0.0"
// }
//
// IMPORTANTE: o plano SEMPRE vem do id da OFERTA (products[].offers[].id).
// O id do produto da nossa conta é igual ao id da oferta do Essencial
// mensal, então usar product.id daria plano errado.

export type HublaAction =
  | "activate"
  | "cancel_renewal"
  | "resume_renewal"
  | "deactivate"
  | "payment_issue"
  | "unknown";

/** Tipos de evento tratados explicitamente (sem "adivinhar" por palavra solta). */
const ACTION_BY_TYPE: Record<string, HublaAction> = {
  // Ativação / renovação / recompra
  "subscription.activated": "activate",
  "subscription.renewed": "activate",
  "subscription.reactivated": "activate",
  "subscription.created": "activate",
  "invoice.paid": "activate",
  "newsale": "activate",
  "new_sale": "activate",
  "customer.member_added": "activate",
  // Cancelamento da renovação automática (NÃO tira acesso na hora)
  "subscription.canceled": "cancel_renewal",
  "subscription.cancelled": "cancel_renewal",
  "subscription.autorenew.canceled": "cancel_renewal",
  "subscription.autorenew.disabled": "cancel_renewal",
  // Fim real do direito de acesso
  "subscription.deactivated": "deactivate",
  "subscription.expired": "deactivate",
  "customer.member_removed": "deactivate",
  "invoice.refunded": "deactivate",
  "sale.refunded": "deactivate",
  "invoice.chargeback": "deactivate",
  // Problema de cobrança (retry/grace) — só registra, não bloqueia
  "invoice.payment_failed": "payment_issue",
  "invoice.unpaid": "payment_issue",
  "invoice.overdue": "payment_issue",
  "invoice.late": "payment_issue",
  "subscription.payment_failed": "payment_issue",
};

export function actionForEvent(eventType: string): HublaAction {
  return ACTION_BY_TYPE[eventType.trim().toLowerCase()] ?? "unknown";
}

type Obj = Record<string, unknown>;

const asObj = (v: unknown): Obj | null =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface ParsedHubla {
  eventType: string;
  email: string | null;
  offerId: string | null;
  offerName: string | null;
  productId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  autoRenew: boolean | null;
  startedAt: string | null;
  /** Fim do período efetivamente pago (preferindo dado da própria Hubla). */
  periodEnd: string | null;
  /** De onde veio a data acima (para diagnóstico). */
  periodEndSource: string;
  cancelledAt: string | null;
  deactivatedAt: string | null;
  /** Momento do evento (para ignorar aviso antigo que chega depois). */
  eventAt: string | null;
  /** Versão da assinatura na Hubla (idem). */
  version: number | null;
  invoiceStatus: string | null;
}

function findEmail(obj: unknown, depth = 0): string | null {
  if (depth > 8 || obj == null) return null;
  if (typeof obj === "string") return EMAIL_RE.test(obj.trim()) ? obj.trim() : null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const f = findEmail(item, depth + 1);
      if (f) return f;
    }
    return null;
  }
  const o = asObj(obj);
  if (!o) return null;
  for (const [k, v] of Object.entries(o)) {
    if (k.toLowerCase().includes("email") && typeof v === "string" && EMAIL_RE.test(v.trim())) {
      return v.trim();
    }
  }
  for (const v of Object.values(o)) {
    const f = findEmail(v, depth + 1);
    if (f) return f;
  }
  return null;
}

function iso(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Campos que a Hubla pode enviar indicando o fim do período pago /
 * próxima cobrança. Usamos o primeiro que existir — cálculo derivado
 * é sempre o último recurso, pra nunca bloquear antes da hora.
 */
const PERIOD_END_KEYS = [
  "currentPeriodEnd",
  "current_period_end",
  "periodEnd",
  "period_end",
  "nextPaymentDate",
  "nextPaymentAt",
  "nextPayment",
  "nextChargeDate",
  "nextChargeAt",
  "nextBillingDate",
  "nextBillingAt",
  "nextInvoiceDate",
  "renewsAt",
  "renewalDate",
  "expiresAt",
  "expirationDate",
  "expiredAt",
  "validUntil",
  "endsAt",
  "endDate",
  "accessEndsAt",
];

function pickPeriodEnd(subscription: Obj | null, event: Obj): { at: string | null; source: string } {
  for (const key of PERIOD_END_KEYS) {
    for (const scope of [subscription, event]) {
      if (!scope) continue;
      const found = iso(scope[key]);
      if (found) return { at: found, source: `hubla:${key}` };
    }
  }
  return { at: null, source: "none" };
}

function addMonths(from: Date, months: number) {
  const d = new Date(from.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

/**
 * Só entra em ação quando a Hubla NÃO manda a data de término:
 * base = data do último pagamento (ou ativação) + ciclo cobrado.
 * Usa `credits` (dias de acesso) quando existir, senão o ciclo em meses.
 */
function derivePeriodEnd(subscription: Obj | null): { at: string | null; source: string } {
  if (!subscription) return { at: null, source: "none" };
  const invoice = asObj(subscription.lastInvoice);
  const base =
    iso(invoice?.saleDate) ??
    iso(subscription.activatedAt) ??
    iso(subscription.modifiedAt) ??
    iso(subscription.createdAt);
  if (!base) return { at: null, source: "none" };
  const start = new Date(base);

  const credits = subscription.credits;
  if (typeof credits === "number" && credits > 0 && credits <= 400) {
    const d = new Date(start.getTime() + credits * 24 * 60 * 60 * 1000);
    return { at: d.toISOString(), source: "derived:credits" };
  }
  const cycle = subscription.billingCycleMonths;
  if (typeof cycle === "number" && cycle > 0 && cycle <= 24) {
    return { at: addMonths(start, cycle).toISOString(), source: "derived:billingCycleMonths" };
  }
  return { at: null, source: "none" };
}

/** Momento em que o estado atual da assinatura passou a valer. */
function lastStatusChange(subscription: Obj | null): string | null {
  const list = subscription?.statusAt;
  if (!Array.isArray(list)) return null;
  let latest: string | null = null;
  for (const entry of list) {
    const when = iso(asObj(entry)?.when);
    if (when && (!latest || when > latest)) latest = when;
  }
  return latest;
}

export function parseHubla(body: unknown): ParsedHubla {
  const root = asObj(body) ?? {};
  const event = asObj(root.event) ?? root;
  const subscription = asObj(event.subscription);
  const invoice = asObj(subscription?.lastInvoice) ?? asObj(event.invoice);

  const eventType = String(root.type ?? root.event_type ?? root.topic ?? "").trim();

  // Oferta: products[].offers[].id (fonte única do plano)
  let offerId: string | null = null;
  let offerName: string | null = null;
  const products = Array.isArray(event.products) ? event.products : [];
  for (const p of products) {
    const offers = asObj(p)?.offers;
    if (Array.isArray(offers)) {
      for (const o of offers) {
        const oo = asObj(o);
        const id = typeof oo?.id === "string" ? oo.id.trim() : "";
        if (id) {
          offerId = id;
          offerName = typeof oo?.name === "string" ? oo.name : null;
          break;
        }
      }
    }
    if (offerId) break;
  }
  // Alguns eventos mandam a oferta solta (event.offer.id)
  if (!offerId) {
    const offer = asObj(event.offer);
    if (typeof offer?.id === "string" && offer.id.trim()) {
      offerId = offer.id.trim();
      offerName = typeof offer.name === "string" ? offer.name : null;
    }
  }

  const productId =
    (typeof asObj(event.product)?.id === "string" ? (asObj(event.product)!.id as string) : null) ??
    (typeof asObj(products[0])?.id === "string" ? (asObj(products[0])!.id as string) : null);

  const fromHubla = pickPeriodEnd(subscription, event);
  const period = fromHubla.at ? fromHubla : derivePeriodEnd(subscription);

  const statusChange = lastStatusChange(subscription);

  return {
    eventType,
    email: findEmail(body),
    offerId,
    offerName,
    productId,
    subscriptionId:
      typeof subscription?.id === "string"
        ? subscription.id
        : typeof invoice?.subscriptionId === "string"
          ? (invoice.subscriptionId as string)
          : null,
    subscriptionStatus:
      typeof subscription?.status === "string" ? subscription.status.toLowerCase() : null,
    autoRenew: typeof subscription?.autoRenew === "boolean" ? subscription.autoRenew : null,
    startedAt: iso(subscription?.activatedAt) ?? iso(subscription?.createdAt),
    periodEnd: period.at,
    periodEndSource: period.source,
    cancelledAt: iso(subscription?.canceledAt) ?? iso(subscription?.cancelledAt),
    deactivatedAt: iso(subscription?.inactivatedAt) ?? iso(subscription?.deactivatedAt),
    eventAt:
      iso(root.eventAt) ??
      iso(root.createdAt) ??
      statusChange ??
      iso(subscription?.modifiedAt) ??
      iso(invoice?.modifiedAt),
    version: typeof subscription?.version === "number" ? subscription.version : null,
    invoiceStatus: typeof invoice?.status === "string" ? invoice.status.toLowerCase() : null,
  };
}

/** Identificador de idempotência: usa o id do evento quando existir. */
export async function eventIdFor(body: unknown, rawBody: string, parsed: ParsedHubla) {
  const root = asObj(body) ?? {};
  for (const key of ["eventId", "event_id", "id", "idempotencyKey", "idempotency_key"]) {
    const v = root[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // Sem id próprio: impressão digital do conteúdo (mesmo aviso = mesmo id).
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${parsed.eventType || "evento"}:${hex}`;
}
