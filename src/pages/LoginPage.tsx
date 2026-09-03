import { PageMeta } from "@/components/PageMeta";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth, isSupabaseConfigured } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { session, loading, signIn } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (searchParams.get("mode") === "signup") {
    return <Navigate to="/#planos" replace />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    if (session.user?.user_metadata?.must_change_password) {
      return <Navigate to="/trocar-senha" replace />;
    }
    const from = (location.state as { from?: string })?.from ?? "/personalizar";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta title="Entrar — Link Na Bio Que Vende" description="Acesse sua dashboard para editar sua loja, ver leads e acompanhar os cliques do seu link." path="/login" noindex />
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="flex items-center gap-1 text-xs mb-4 justify-center"
          style={{ color: "var(--product-coral-dark)" }}
        >
          <ArrowLeft size={13} /> Voltar pro site
        </Link>

        <div className="flex justify-center mb-6">
          <Logo size={44} />
        </div>

        <div className="rounded-xl bg-white shadow-lg p-6 border" style={{ borderColor: "var(--product-line)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} style={{ color: "var(--product-coral)" }} />
            <h1 className="font-semibold text-lg" style={{ color: "var(--product-ink)" }}>
              Painel do administrador
            </h1>
          </div>

          {!isSupabaseConfigured ? (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <span>
                O Supabase ainda não foi conectado a este projeto no Lovable. Conecte em
                Configurações → Supabase e rode o SQL do arquivo{" "}
                <code className="text-xs">supabase/migrations/0001_init.sql</code> — depois é só
                recarregar essa página.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/recuperar-senha"
                    className="text-xs underline"
                    style={{ color: "var(--product-coral-dark)" }}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                style={{ background: "var(--product-coral)", color: "#fff" }}
              >
                {submitting ? "Aguarde..." : "Entrar"}
              </Button>

              <Link
                to="/#planos"
                className="block w-full text-center text-xs text-muted-foreground underline"
              >
                Primeira vez? Criar conta
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
