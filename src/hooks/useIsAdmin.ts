import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { cachedQuery, peekCache } from "@/lib/queryCache";

// O papel de cada pessoa fica numa tabela separada (user_roles), nunca no
// perfil — assim ninguém consegue se auto-promover a admin pelo app.
// Cada usuária só enxerga o próprio papel (regra de acesso do banco).
//
// A resposta fica em cache por usuária: o menu do painel e a proteção da
// rota /admin usam o mesmo dado, com uma consulta só.
const TTL = 15 * 60 * 1000;
const keyFor = (userId: string) => `is-admin:${userId}`;

export function useIsAdmin() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;
  const cached = userId ? peekCache<boolean>(keyFor(userId), TTL) : undefined;

  const [isAdmin, setIsAdmin] = useState(cached ?? false);
  const [loading, setLoading] = useState(cached === undefined);

  useEffect(() => {
    let cancelled = false;

    // Enquanto a sessão ainda está sendo carregada, seguimos "carregando"
    // — senão a tela do acesso central acha que não é admin e desvia.
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!supabase || !userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const hit = peekCache<boolean>(keyFor(userId), TTL);
    if (hit !== undefined) {
      setIsAdmin(hit);
      setLoading(false);
      return;
    }

    setLoading(true);
    void cachedQuery(
      keyFor(userId),
      async () => {
        const { data } = await supabase!
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        return Boolean(data);
      },
      { ttl: TTL }
    )
      .then((result) => {
        if (!cancelled) {
          setIsAdmin(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  return { isAdmin, loading };
}
