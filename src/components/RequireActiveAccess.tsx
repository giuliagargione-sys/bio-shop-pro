import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, LifeBuoy, RefreshCw } from "lucide-react";
import { useAccess } from "@/hooks/useAccess";
import { Logo } from "@/components/brand/Logo";
import { PageMeta } from "@/components/PageMeta";

const SUPPORT_WHATSAPP = "https://wa.me/5519995550029";

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function planLabel(plan: string | null) {
  if (plan === "pro") return "PRO";
  if (plan === "essential") return "Essencial";
  return null;
}

/**
 * Enquanto a assinatura está em dia, o painel abre normalmente.
 * Quando o período pago termina, a loja fica guardada e o painel dá lugar
 * a esta tela — o login continua funcionando para a cliente reativar.
 *
 * Isto é só a experiência de uso: o servidor também confere o acesso.
 */
export function RequireActiveAccess({ children }: { children: ReactNode }) {
  const access = useAccess();
  const [params] = useSearchParams();

  // Acesso central editando a loja de outra pessoa continua liberado.
  if (access.isAdmin || params.get("loja")) return <>{children}</>;

  if (access.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (access.canUse) return <>{children}</>;

  const expiredAt = formatDate(access.subscription?.currentPeriodEnd ?? null);
  const backupUntil = formatDate(access.backupUntil);
  const label = planLabel(access.plan);
  const arquivada = access.storeStatus === "archived";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <PageMeta title="Acesso suspenso" description="Reative sua assinatura para voltar a usar sua loja." path="/personalizar" noindex />
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle size={20} />
          </span>
          <h1 className="text-xl font-semibold">Seu acesso está temporariamente suspenso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {arquivada
              ? "Sua loja e seus dados continuam guardados com a gente. Fale com o suporte para reativar."
              : "Sua loja e todos os seus dados estão preservados por mais 30 dias. Para continuar utilizando sua loja, reative sua assinatura."}
          </p>

          <dl className="mt-5 space-y-2 rounded-[var(--radius)] bg-muted/50 p-4 text-sm">
            {label && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Plano anterior</dt>
                <dd className="font-medium">{label}</dd>
              </div>
            )}
            {expiredAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Venceu em</dt>
                <dd className="font-medium">{expiredAt}</dd>
              </div>
            )}
            {backupUntil && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dados guardados até</dt>
                <dd className="font-medium">{backupUntil}</dd>
              </div>
            )}
          </dl>

          <a
            href="/#planos"
            className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius)] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw size={16} className="mr-2" />
            Reativar minha assinatura
          </a>

          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center rounded-[var(--radius)] border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <LifeBuoy size={16} className="mr-2" />
            Falar com o suporte
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/login" className="underline">
            Entrar com outra conta
          </Link>
        </p>
      </div>
    </div>
  );
}
