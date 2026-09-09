// Edge Function: fonte ÚNICA de verdade do acesso da cliente logada.
// Devolve: pode usar, plano, recursos liberados, situação da assinatura,
// situação da loja, vencimento e data limite de recuperação.
import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveAccess } from "../_shared/access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data } = await admin.auth.getUser(jwt);
    const user = data.user;
    if (!user) return json({ error: "Não autenticado." }, 401);

    const access = await resolveAccess(admin, user.id, user.email ?? null);
    return json(access);
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
