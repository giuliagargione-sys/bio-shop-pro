import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StoreConfig } from "@/types/config";
import { defaultConfig } from "@/lib/defaultConfig";
import { useSearchParams } from "react-router-dom";
import {
  fetchMyStore,
  createMyStore,
  saveMyConfig,
  updateMySlug,
  fetchStoreByUserId,
} from "@/lib/remoteConfig";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export type SyncStatus = "loading" | "synced" | "saving" | "error";

interface ConfigContextValue {
  config: StoreConfig;
  slug: string | null;
  /** true quando o acesso central está editando a loja de outra pessoa */
  editingAsAdmin: boolean;
  syncStatus: SyncStatus;
  /** true quando existem mudanças ainda não gravadas na nuvem */
  hasUnsavedChanges: boolean;
  /** grava agora mesmo (usado pelo botão "Salvar alterações") */
  saveNow: () => Promise<boolean>;
  updateConfig: (patch: Partial<StoreConfig>) => void;
  updateNested: <K extends keyof StoreConfig>(key: K, patch: Partial<StoreConfig[K]>) => void;
  resetConfig: () => void;
  changeSlug: (newSlug: string) => Promise<{ ok: boolean; error: string | null }>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

// Aplica as cores/fonte/raio como variaveis CSS no documento inteiro —
// assim a dashboard mostra em tempo real a personalização que está sendo feita.
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

// Só é montado dentro de /personalizar (depois do login) — ver App.tsx.
// Carrega a loja da PRÓPRIA aluna logada; cria uma na primeira visita.
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<StoreConfig>(defaultConfig);
  const [slug, setSlug] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  // O acesso central pode abrir a loja de uma aluna com /personalizar?loja=<id>
  // (as regras do banco só deixam salvar se quem está logada for admin).
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("loja");

  const userIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSyncStatus("error");
      return;
    }
    let cancelled = false;

    (async () => {
      let store = targetUserId ? await fetchStoreByUserId(targetUserId) : await fetchMyStore();
      if (!store && !targetUserId) store = await createMyStore();
      if (cancelled) return;

      if (store) {
        userIdRef.current = store.userId;
        skipNextSaveRef.current = true;
        setConfigState(store.config);
        setSlug(store.slug);
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
      }
      readyRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  useEffect(() => {
    applyThemeToDocument(config.theme);
  }, [config.theme]);

  useEffect(() => {
    if (!readyRef.current || !userIdRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    setSyncStatus("saving");
    setHasUnsavedChanges(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const ok = await saveMyConfig(userIdRef.current as string, config);
      setSyncStatus(ok ? "synced" : "error");
      if (ok) setHasUnsavedChanges(false);
    }, 700);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      slug,
      syncStatus,
      hasUnsavedChanges,
      saveNow: async () => {
        if (!userIdRef.current) return false;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSyncStatus("saving");
        const ok = await saveMyConfig(userIdRef.current, configRef.current);
        setSyncStatus(ok ? "synced" : "error");
        if (ok) setHasUnsavedChanges(false);
        return ok;
      },
      editingAsAdmin: Boolean(targetUserId),
      updateConfig: (patch) => setConfigState((prev) => ({ ...prev, ...patch })),
      updateNested: (key, patch) =>
        setConfigState((prev) => ({
          ...prev,
          [key]: { ...(prev[key] as object), ...(patch as object) },
        })),
      resetConfig: () => setConfigState(defaultConfig),
      changeSlug: async (newSlug) => {
        if (!userIdRef.current) return { ok: false, error: "Sua loja ainda está carregando." };
        const result = await updateMySlug(userIdRef.current, newSlug);
        if (result.ok) setSlug(newSlug.toLowerCase());
        return result;
      },
    }),
    [config, slug, syncStatus, hasUnsavedChanges, targetUserId]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useStoreConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useStoreConfig precisa estar dentro de <ConfigProvider>");
  return ctx;
}
