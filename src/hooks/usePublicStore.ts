import { useEffect, useState } from "react";
import type { StoreConfig } from "@/types/config";
import { fetchStoreBySlug } from "@/lib/remoteConfig";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { defaultConfig } from "@/lib/defaultConfig";
import { getDemoStore } from "@/lib/demoStores";


// Usado pela loja pública (rota /loja/:slug) — leitura só, sem login.
// Aplica o tema da loja encontrada como variáveis CSS no documento, do
// mesmo jeito que a dashboard faz, pra loja publicada ficar com a cara
// que a aluna escolheu.
function applyThemeToDocument(theme: StoreConfig["theme"]) {
  const root = document.documentElement.style;
  root.setProperty("--brand-primary", theme.primary);
  root.setProperty("--brand-primary-foreground", theme.primaryForeground);
  root.setProperty("--brand-secondary", theme.secondary);
  root.setProperty("--brand-secondary-foreground", theme.secondaryForeground);
  root.setProperty("--brand-accent", theme.accent);
  root.setProperty("--brand-accent-foreground", theme.accentForeground);
  root.setProperty("--brand-font", theme.font);
  root.setProperty("--radius", theme.radius);
}

interface PublicStoreState {
  loading: boolean;
  notFound: boolean;
  ownerId: string | null;
  config: StoreConfig;
}

export function usePublicStore(slug: string | undefined): PublicStoreState {
  const [state, setState] = useState<PublicStoreState>({
    loading: true,
    notFound: false,
    ownerId: null,
    config: defaultConfig,
  });

  useEffect(() => {
    if (!slug) {
      setState((s) => ({ ...s, loading: false, notFound: true }));
      return;
    }
    if (!isSupabaseConfigured) {
      // sem Supabase conectado ainda — mostra o modelo padrão em vez de
      // quebrar a página (útil pra visualizar o layout durante o setup)
      setState({ loading: false, notFound: false, ownerId: null, config: defaultConfig });
      applyThemeToDocument(defaultConfig.theme);
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    fetchStoreBySlug(slug).then((result) => {
      if (cancelled) return;
      if (!result) {
        setState({ loading: false, notFound: true, ownerId: null, config: defaultConfig });
        return;
      }
      applyThemeToDocument(result.config.theme);
      setState({ loading: false, notFound: false, ownerId: result.ownerId, config: result.config });
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
