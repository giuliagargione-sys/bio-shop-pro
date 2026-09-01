import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// Lê profiles.is_admin da própria usuária logada (permitido pela RLS —
// cada uma só lê a própria linha). É só isso que decide se ela vê o link
// "Acesso central" e se consegue entrar em /admin.
export function useIsAdmin() {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!supabase || !session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(Boolean(data?.is_admin));
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
