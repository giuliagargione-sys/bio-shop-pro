import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useStoreConfig } from "@/context/ConfigContext";

interface PlanState {
  loading: boolean;
  plan: string | null;
  isPro: boolean;
}

/**
 * Descobre se a aluna logada está no plano PRO. Quem edita pelo acesso central
 * (admin) enxerga tudo liberado.
 */
export function usePlan(): PlanState {
  const { editingAsAdmin } = useStoreConfig();
  const [state, setState] = useState<PlanState>({ loading: true, plan: null, isPro: false });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isSupabaseConfigured || !supabase) {
        if (alive) setState({ loading: false, plan: null, isPro: false });
        return;
      }
      const { data, error } = await supabase.functions.invoke("my-plan", { body: {} });
      if (!alive) return;
      if (error || data?.error) {
        setState({ loading: false, plan: null, isPro: false });
        return;
      }
      setState({
        loading: false,
        plan: (data?.plan as string | null) ?? null,
        isPro: Boolean(data?.isPro),
      });
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  if (editingAsAdmin) return { loading: false, plan: "admin", isPro: true };
  return state;
}
