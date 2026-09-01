import { supabase } from "./supabaseClient";
import type { StoreConfig } from "@/types/config";
import { mergeWithDefaults } from "./storage";
import { defaultConfig } from "./defaultConfig";

// Cada aluna tem UMA linha em store_config, dona dela (user_id) e com um
// endereço público (slug) — é o que forma a URL /loja/:slug que vai na
// bio do Instagram dela.

export interface RemoteStore {
  id: string;
  userId: string;
  slug: string;
  config: StoreConfig;
}

function slugify(input: string) {
  const DIACRITICS = new RegExp("[̀-ͯ]", "g");
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

// ---------- Dashboard (autenticada): a loja da própria aluna ----------

export async function fetchMyStore(): Promise<RemoteStore | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("store_config")
    .select("id, user_id, slug, data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id as string,
    userId: data.user_id as string,
    slug: data.slug as string,
    config: mergeWithDefaults(data.data),
  };
}

// Cria a primeira loja da aluna, na primeira vez que ela entra na
// dashboard. Tenta um endereço baseado no e-mail e resolve colisão de
// slug tentando de novo com um sufixo diferente.
export async function createMyStore(): Promise<RemoteStore | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const base = slugify(user.email?.split("@")[0] || "minha-loja") || "loja";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? `${base}-${randomSuffix()}` : `${base}-${randomSuffix()}`;
    const { data, error } = await supabase
      .from("store_config")
      .insert({ user_id: user.id, slug, data: defaultConfig })
      .select("id, user_id, slug, data")
      .single();

    if (!error && data) {
      return {
        id: data.id as string,
        userId: data.user_id as string,
        slug: data.slug as string,
        config: mergeWithDefaults(data.data),
      };
    }
    // 23505 = violação de unicidade. Pode ser o endereço (tenta outro
    // sufixo) ou a loja já ter sido criada em paralelo (devolve ela).
    if (error && error.code === "23505") {
      const existing = await fetchMyStore();
      if (existing) return existing;
      continue;
    }
    if (error) return null;
  }
  return null;
}

export async function saveMyConfig(userId: string, config: StoreConfig): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("store_config")
    .update({ data: config, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return !error;
}

export async function updateMySlug(
  userId: string,
  newSlug: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!supabase) return { ok: false, error: "Supabase não conectado." };
  const clean = slugify(newSlug);
  if (!clean) return { ok: false, error: "Digite um endereço válido." };

  const { error } = await supabase.from("store_config").update({ slug: clean }).eq("user_id", userId);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esse endereço já está em uso — tente outro." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, error: null };
}

// ---------- Loja pública (rota /loja/:slug): leitura só, sem login ----------

export async function fetchStoreBySlug(
  slug: string
): Promise<{ ownerId: string; config: StoreConfig } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("store_config")
    .select("user_id, data")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return { ownerId: data.user_id as string, config: mergeWithDefaults(data.data) };
}
