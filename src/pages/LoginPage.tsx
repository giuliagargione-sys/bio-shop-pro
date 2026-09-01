import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth, isSupabaseConfigured } from "@/context/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PLAN_NAMES: Record<string, string> = {
  essencial: "Essencial",
  "que-vende": "Que Vende",
};

export default function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const plan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  if (!loading && session) {
    const from = (location.state as { from?: string })?.from ?? "/personalizar";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, plan ? { plano: plan } : undefined);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setSignupDone(true);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
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

        <div className="rounded-2xl bg-white shadow-lg p-6 border" style={{ borderColor: "#f0d9d9" }}>
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} style={{ color: "var(--product-coral)" }} />
            <h1 className="font-semibold text-lg" style={{ color: "var(--product-ink)" }}>
              {mode === "signin" ? "Entrar na dashboard" : "Criar sua conta"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {mode === "signin"
              ? "Só quem tem a senha vê os leads e edita a loja."
              : "Leva menos de um minuto — depois é só personalizar sua loja."}
          </p>

          {mode === "signup" && plan && (
            <div
              className="mb-4 rounded-lg px-3 py-2 text-xs font-medium"
              style={{ background: "var(--product-cream)", color: "var(--product-coral-dark)" }}
            >
              Plano selecionado: {PLAN_NAMES[plan] ?? plan}
            </div>
          )}

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
          ) : signupDone ? (
            <div className="text-sm text-center py-4">
              <p className="mb-3">
                Conta criada! Verifique seu e-mail pra confirmar (se a confirmação estiver
                ativada no Supabase) e depois entre normalmente.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setMode("signin"); setSignupDone(false); }}>
                Ir para o login
              </Button>
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
                <Label htmlFor="password">Senha</Label>
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
                {submitting ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
              </Button>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="w-full text-center text-xs text-muted-foreground underline"
              >
                {mode === "signin" ? "Primeira vez? Criar conta" : "Já tenho conta — entrar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
