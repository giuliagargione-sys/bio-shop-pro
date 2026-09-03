import type { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProLockProps {
  locked: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
}

/**
 * Mostra o recurso PRO para quem está no Essencial, mas travado:
 * o conteúdo fica visível (desfocado, sem interação) com um convite de upgrade.
 */
export function ProLock({ locked, title, description, children }: ProLockProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)]">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[3px] opacity-50"
        tabIndex={-1}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 p-4">
        <div className="max-w-sm rounded-[var(--radius)] border border-border bg-card p-5 text-center shadow-sm">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Lock size={18} />
          </span>
          <p className="font-semibold">{title ?? "Recurso do plano PRO"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {description ??
              "Faça upgrade para o PRO pra desbloquear esse recurso na sua loja."}
          </p>
          <Button asChild className="mt-4 w-full">
            <a href="/#planos">
              <Sparkles size={16} className="mr-2" />
              Fazer upgrade para o PRO
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
