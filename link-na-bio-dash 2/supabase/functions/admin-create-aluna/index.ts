// Edge Function: cria a conta de login de uma aluna manualmente, a partir
// do painel central (/admin) — só admin pode chamar. Gera uma senha
// temporária e devolve pra você mostrar/enviar pra aluna (ela pode trocar
// depois, se quiser — não tem tela de "trocar senha" ainda, mas dá pra
// pedir reset de senha pelo próprio Supabase se precisar no futuro).
//
// Deploy:
//   supabase functions deploy admin-create-aluna

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword() {
  // 10 caracteres, fácil de digitar e ler por telefone/WhatsApp
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData } = await callerClient.auth.getUser();
    const caller = callerData.user;
    if (!caller) return json({ error: "Não autenticado." }, 401);

    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("is_admin")
      .eq("id", caller.id)
      .maybeSingle();
    if (!callerProfile?.is_admin) {
      return json({ error: "Só o acesso central pode criar contas." }, 403);
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return json({ error: "Informe um e-mail válido." }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const tempPassword = generatePassword();

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // já entra confirmada, sem precisar clicar em e-mail
    });

    if (error) {
      const msg = error.message.toLowerCase().includes("already")
        ? "Já existe uma conta com esse e-mail."
        : error.message;
      return json({ error: msg }, 400);
    }

    return json({
      email,
      tempPassword,
      userId: data.user?.id ?? null,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Erro inesperado." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
