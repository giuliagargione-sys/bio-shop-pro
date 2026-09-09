import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { cachedQuery, invalidateCache, peekCache } from "@/lib/queryCache";

// Fonte ÚNICA de verdade do acesso no app: tudo (plano, recursos
// liberados, assinatura, situação da loja) vem da função my-access.
// O servidor também confere isso nas funções protegidas — aqui é só a
// experiência de uso.

export interface AccessSubscription {
  id: string | null;
  status: string | null;
  hublaSubscriptionId: string | null;
  hublaOfferId: string | null;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  autoRenew: boolean | null;
  cancelledAt: string | null;
}

export interface AccessInfo {
  isAdmin: boolean;
  canUse: boolean;
  storeStatus: string;
  plan: string | null;
  isPro: boolean;
  features: Record<string, boolean>;
  subscription: AccessSubscription | null;
  backupUntil: string | null;
  reason: string;
  planSource: string;
}

export interface AccessState extends AccessInfo {
  loading: boolean;
}

const KEY = "my-access";
const TTL = 5 * 60 * 1000;

const FALLBACK: AccessInfo = {
  isAdmin: false,
  canUse: true,
  storeStatus: "active",
  plan: null,
  isPro: false,
  features: {},
  subscription: null,
  backupUntil: null,
  reason: "ok",
  planSource: "legacy",
};

async function loadAccess(): Promise<AccessInfo> {
  const { data, error } = await supabase!.functions.invoke("my-access", { body: {} });
  if (error || !data || (data as { error?: string }).error) return FALLBACK;
  return { ...FALLBACK, ...(data as AccessInfo) };
}

export function refreshAccess() {
  invalidateCache(KEY);
}

export function useAccess(): AccessState {
  const cached = peekCache<AccessInfo>(KEY, TTL);
  const [state, setState] = useState<AccessState>(
    cached ? { loading: false, ...cached } : { loading: true, ...FALLBACK }
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ loading: false, ...FALLBACK });
      return;
    }
    if (peekCache<AccessInfo>(KEY, TTL)) return;

    let alive = true;
    void cachedQuery(KEY, loadAccess, { ttl: TTL })
      .then((info) => {
        if (alive) setState({ loading: false, ...info });
      })
      .catch(() => {
        if (alive) setState({ loading: false, ...FALLBACK });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
