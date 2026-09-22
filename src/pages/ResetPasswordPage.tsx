import { PageMeta } from "@/components/PageMeta";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Stage = "checking" | "ready" | "invalid" | "success";

/**
 * O link do e-mail pode chegar em três formatos diferentes, dependendo de
 * como o e-mail foi aberto (app de e-mail, navegador, pré-visualização):
 *  1) #access_token=...&type=recovery  (link clássico)
 *  2) ?code=...                        (fluxo novo com troca de código)
 *  3) ?token_hash=...&type=recovery    (link verificado no cliente)
 * Aqui a gente aceita todos eles, para a aluna nunca ver "link inválido".
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("checking");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;

    async function prepare() {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      // Erro devolvido pelo próprio link (expirado, já usado etc.)
      if (url.searchParams.get("error") || hashParams.get("error")) {
        if (!done) setStage("invalid");
        return;
      }

      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash") ?? hashParams.get("token_hash");

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });
          if (verifyError) throw verifyError;
        }
      } catch {
        if (!done) setStage("invalid");
        return;
      }

      // O link clássico (#access_token) já cria a sessão sozinho; basta
      // esperar o cliente terminar de ler o endereço.
      const { data } = await supabase.auth.getSession();
      if (done) return;
      setStage(data.session ? "ready" : "invalid");
    }

    // Se a sessão de recuperação chegar pelo evento, liberamos o formulário.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        done = true;
        setStage("ready");
      }
    });

    void prepare();

    return () => {
      done = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.trim().length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStage("success");
    setTimeout(() => navigate("/personalizar", { replace: true }), 1800);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta
        title="Criar nova senha — Link Na Bio Que Vende"
        description="Defina uma nova senha para a sua conta do Link Na Bio Que Vende."
        path="/reset-password"
        noindex
      />
      <div className="w-full max-w-sm">
        <Link
          to="/login"
          className="flex items-center gap-1 text-xs mb-4 justify-center"
          style={{ color: "var(--product-coral-dark)" }}
        >
          <ArrowLeft size={13} /> Voltar pro login
        </Link>

        <div className="flex justify-center mb-6">
          <Logo size={44} />
        </div>

        <div
          className="rounded-xl bg-white shadow-lg p-6 border"
          style={{ borderColor: "var(--product-line)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} style={{ color: "var(--product-coral)" }} />
            <h1 className="font-semibold text-lg" style={{ color: "var(--product-ink)" }}>
              Criar nova senha
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Escolha a nova senha e já entramos na sua conta.
          </p>

          {stage === "checking" ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Verificando seu link...</p>
          ) : stage === "invalid" ? (
            <div className="space-y-3">
              <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <AlertCircle size={18} className="shrink-0" />
                <span>
                  Esse link já foi usado ou expirou. Peça um novo — ele vale por 1 hora e precisa ser
                  aberto uma única vez.
                </span>
              </div>
              <Button
                className="w-full"
                style={{ background: "var(--product-coral)", color: "#fff" }}
                onClick={() => navigate("/recuperar-senha")}
              >
                Pedir novo link
              </Button>
            </div>
          ) : stage === "success" ? (
            <div className="text-sm text-center py-4 space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 size={40} style={{ color: "var(--product-coral)" }} />
              </div>
              <p>
                <strong>Senha atualizada!</strong> Estamos abrindo sua dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                {submitting ? "Salvando..." : "Salvar e entrar"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
