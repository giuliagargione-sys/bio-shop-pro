// Edge Function (rotina diária): fecha o ciclo de vida das assinaturas.
//
// 1. Assinatura cujo período pago terminou -> expirada; loja suspensa e
//    data limite de recuperação = vencimento + 30 dias.
// 2. Loja suspensa cuja data limite passou -> arquivada.
//
// NADA é apagado: produtos, leads, configurações, arquivos e histórico
// continuam intactos em qualquer um dos estados.
//
// Protegida pelo segredo de rotina (LOVABLE_CRON_SECRET).
import { createClient } from "npm:@supabase/supabase-js@2";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

const RETENTION_DAYS = 30;

Deno.serve(async (req: Request) => {
  const denied = authenticateCronRequest(req);
  if (denied) return denied;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const nowIso = new Date().toISOString();
  const expired: string[] = [];
  const archived: string[] = [];

  // 1) Períodos que realmente terminaram.
  const { data: due } = await admin
    .from("subscriptions")
    .select("id, user_id, email, current_period_end, status")
    .in("status", ["active", "cancelled"])
    .not("current_period_end", "is", null)
    .lt("current_period_end", nowIso);

  for (const sub of due ?? []) {
    const row = sub as { id: string; user_id: string | null; current_period_end: string };
    await admin
      .from("subscriptions")
      .update({ status: "expired", auto_renew: false, updated_at: nowIso })
      .eq("id", row.id);
    expired.push(row.id);

    if (row.user_id) {
      const backupUntil = new Date(
        new Date(row.current_period_end).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();
      await admin
        .from("store_config")
        .update({ status: "suspended", backup_until: backupUntil, active: false })
        .eq("user_id", row.user_id)
        .eq("status", "active");
      console.log("expire-subscriptions:loja-suspensa", row.id, backupUntil);
    }
  }

  // 2) Janela de recuperação encerrada -> arquiva (sem excluir dados).
  const { data: toArchive } = await admin
    .from("store_config")
    .select("id")
    .eq("status", "suspended")
    .not("backup_until", "is", null)
    .lt("backup_until", nowIso);

  for (const store of toArchive ?? []) {
    const id = (store as { id: string }).id;
    await admin.from("store_config").update({ status: "archived" }).eq("id", id);
    archived.push(id);
    console.log("expire-subscriptions:loja-arquivada", id);
  }

  console.log("expire-subscriptions:fim", JSON.stringify({ expired: expired.length, archived: archived.length }));

  return new Response(JSON.stringify({ ok: true, expired: expired.length, archived: archived.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
