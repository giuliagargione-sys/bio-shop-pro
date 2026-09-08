import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useStoreConfig } from "@/context/ConfigContext";
import { cachedQuery, peekCache } from "@/lib/queryCache";

interface PlanState {
  loading: boolean;
  plan: string | null;
  isPro: boolean;
}

interface PlanResult {
  plan: string | null;
  isPro: boolean;
}

const PLAN_KEY = "my-plan";
// O plano quase nunca muda durante o uso do painel — 15 minutos de
// validade evitam repetir a mesma consulta em cada aba que precisa saber
// se a pessoa é PRO.
const PLAN_TTL = 15 * 60 * 1000;

async function loadPlan(): Promise<PlanResult> {
  const { data, error } = await supabase!.functions.invoke("my-plan", { body: {} });
  if (error || data?.error) return { plan: null, isPro: false };
  return {
    plan: (data?.plan as string | null) ?? null,
    isPro: Boolean(data?.isPro),
  };
}

/**
 * Descobre se a aluna logada está no plano PRO. Quem edita pelo acesso central
 * (admin) enxerga tudo liberado.
 *
 * A resposta fica em cache compartilhado: várias abas do painel usam este
 * hook e todas reaproveitam a mesma consulta.
 */
export function usePlan(): PlanState {
  const { editingAsAdmin } = useStoreConfig();
  const cached = peekCache<PlanResult>(PLAN_KEY, PLAN_TTL);
  const [state, setState] = useState<PlanState>(
    cached ? { loading: false, ...cached } : { loading: true, plan: null, isPro: false }
  );

  useEffect(() => {
    // Admin editando a loja de outra pessoa já vê tudo liberado: não há
    // motivo pra perguntar o plano ao servidor.
    if (editingAsAdmin) return;
    if (!isSupabaseConfigured || !supabase) {
      setState({ loading: false, plan: null, isPro: false });
      return;
    }
    if (peekCache<PlanResult>(PLAN_KEY, PLAN_TTL)) return;

    let alive = true;
    void cachedQuery(PLAN_KEY, loadPlan, { ttl: PLAN_TTL })
      .then((result) => {
        if (alive) setState({ loading: false, ...result });
      })
      .catch(() => {
        if (alive) setState({ loading: false, plan: null, isPro: false });
      });
    return () => {
      alive = false;
    };
  }, [editingAsAdmin]);

  if (editingAsAdmin) return { loading: false, plan: "admin", isPro: true };
  return state;
}
