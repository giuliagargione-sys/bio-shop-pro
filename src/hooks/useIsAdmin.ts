import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// O papel de cada pessoa fica numa tabela separada (user_roles), nunca no
// perfil — assim ninguém consegue se auto-promover a admin pelo app.
// Cada usuária só enxerga o próprio papel (regra de acesso do banco).
export function useIsAdmin() {
  const { session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Enquanto a sessão ainda está sendo carregada, seguimos "carregando"
      // — senão a tela do acesso central acha que não é admin e desvia.
      if (authLoading) {
        setLoading(true);
        return;
      }
      if (!supabase || !session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(Boolean(data));
        setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return { isAdmin, loading };
}
