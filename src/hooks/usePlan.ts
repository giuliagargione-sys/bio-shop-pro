import { useStoreConfig } from "@/context/ConfigContext";
import { useAccess } from "@/hooks/useAccess";

interface PlanState {
  loading: boolean;
  plan: string | null;
  isPro: boolean;
  /** Recurso liberado no plano atual (definido no banco, em plan_features). */
  can: (feature: string) => boolean;
}

/**
 * Plano da aluna logada. Hoje é apenas uma leitura da fonte única de
 * verdade (useAccess / função my-access) — nenhuma regra de plano fica
 * espalhada pelo código.
 *
 * Quem edita pelo acesso central (admin) enxerga tudo liberado.
 */
export function usePlan(): PlanState {
  const { editingAsAdmin } = useStoreConfig();
  const access = useAccess();

  if (editingAsAdmin) {
    return { loading: false, plan: "admin", isPro: true, can: () => true };
  }

  return {
    loading: access.loading,
    plan: access.plan,
    isPro: access.isPro,
    can: (feature: string) =>
      access.isAdmin || access.features[feature] !== false,
  };
}
