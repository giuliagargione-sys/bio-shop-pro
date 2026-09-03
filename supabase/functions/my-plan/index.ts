// Edge Function: devolve o plano da aluna logada (Essencial/PRO).
// A tabela subscribers só é visível pela service role, por isso essa checagem
// não pode ser feita direto do front.
//
// Deploy:
//   supabase functions deploy my-plan

import { createClient } from "npm:@supabase/supabase-js@2";

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

    const { data: adminRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) {
      return json({ plan: "admin", isPro: true, isAdmin: true });
    }

    const email = (caller.email ?? "").toLowerCase();
    const { data: sub } = email
      ? await admin
          .from("subscribers")
          .select("plan, status")
          .ilike("email", email)
          .maybeSingle()
      : { data: null };

    const plan = (sub?.plan as string | null) ?? null;
    const isPro = typeof plan === "string" && plan.toLowerCase().includes("pro");

    return json({ plan, isPro, isAdmin: false, status: sub?.status ?? "desconhecido" });
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
