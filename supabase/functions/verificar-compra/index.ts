// Verifica se um e-mail tem compra ativa (tabela compradores_ativos).
// Usada pela página /bem-vindo antes de liberar o cadastro.
import { createClient } from "npm:@supabase/supabase-js@2";

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

  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return json({ allowed: false, reason: "invalid_body" }, 400);
  }

  if (!email || !email.includes("@") || email.length > 254) {
    return json({ allowed: false, reason: "invalid_email" }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await admin
    .from("compradores_ativos")
    .select("status")
    .ilike("email", email)
    .maybeSingle();

  if (error) return json({ allowed: false, reason: "error" }, 500);

  return json({ allowed: data?.status === "ativo" });
});
