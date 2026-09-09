// Edge Function: plano da aluna logada (Essencial/PRO).
// Mantida por compatibilidade com o app: hoje ela apenas repassa o
// resultado da fonte única de verdade (_shared/access.ts), a mesma usada
// por my-access e pelas funções protegidas.
import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveAccess } from "../_shared/access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: callerData } = await admin.auth.getUser(jwt);
    const caller = callerData.user;
    if (!caller) return json({ error: "Não autenticado." }, 401);

    const access = await resolveAccess(admin, caller.id, caller.email ?? null);

    return json({
      plan: access.plan,
      isPro: access.isPro,
      isAdmin: access.isAdmin,
      status: access.planSource,
      canUse: access.canUse,
      features: access.features,
    });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
