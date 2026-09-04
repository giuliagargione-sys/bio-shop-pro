import { PageMeta } from "@/components/PageMeta";
import { Logo } from "@/components/brand/Logo";
import { Sparkles, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!password) {
      setError("Crie uma senha para acessar seu painel.");
      return;
    }

    setSubmitting(true);

    // Só libera o cadastro se o e-mail tiver compra ativa na Hubla.
    const { data: check, error: checkError } = await supabase.functions.invoke(
      "verificar-compra",
      { body: { email: cleanEmail } }
    );

    if (checkError || !check?.allowed) {
      setSubmitting(false);
      setError(
        "Este e-mail não possui uma compra ativa na Hubla. Verifique se digitou o e-mail correto da compra ou fale com o nosso suporte."
      );
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/personalizar` },
    });


    if (signUpError) {
      const msg = signUpError.message || "";
      if (/already registered|already been registered|User already/i.test(msg)) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) {
          setSubmitting(false);
          setError("Esse e-mail já tem conta. Faça login ou recupere sua senha.");
          return;
        }
        navigate("/personalizar", { replace: true });
        return;
      }
      setSubmitting(false);
      setError(msg || "Não foi possível criar sua conta. Tente novamente.");
      return;
    }

    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        setSubmitting(false);
        setError(
          "Conta criada! Confirme seu e-mail para entrar ou tente fazer login."
        );
        return;
      }
    }

    navigate("/personalizar", { replace: true });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 font-product relative overflow-hidden"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta
        title="Bem-vinda — Link Na Bio Que Vende"
        description="Pagamento confirmado. Crie seu acesso e comece a montar o seu link na bio que vende."
        path="/bem-vindo"
        noindex
      />

      {/* Glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
        style={{ background: "var(--product-coral)" }}
      />

      <div className="w-full max-w-lg relative">
        <div className="flex justify-center mb-8">
          <Logo size={44} />
        </div>

        <div className="text-center mb-8">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4 animate-fade-in"
            style={{
              background: "rgba(107, 27, 43, 0.08)",
              color: "var(--product-coral)",
            }}
          >
            <Sparkles size={14} />
            Pagamento confirmado
          </span>

          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight animate-fade-in"
            style={{ color: "var(--product-ink)" }}
          >
            Sua jornada começou! 🎉
          </h1>
          <p
            className="mt-3 text-base leading-relaxed animate-fade-in"
            style={{ color: "var(--product-plum)" }}
          >
            Falta apenas um passo para você criar o seu link na bio que vende.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-7 sm:p-9 border shadow-xl"
          style={{
            borderColor: "var(--product-line)",
            boxShadow: "0 24px 60px -30px rgba(11,11,11,0.35)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--product-ink)" }}
          >
            Criar meu acesso
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--product-plum)" }}>
            Use o mesmo e-mail da sua compra.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="welcome-email">E-mail</Label>
              <Input
                id="welcome-email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="welcome-password">Criar senha</Label>
              <div className="relative">
                <Input
                  id="welcome-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-11"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--product-plum)" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm"
              style={{ background: "rgba(107, 27, 43, 0.08)", color: "var(--product-coral)" }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full h-12 px-6 text-base font-medium rounded-xl transition-all hover:opacity-90 disabled:opacity-70"
            style={{ background: "var(--product-coral)", color: "#fff" }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Criando sua conta...
              </>
            ) : (
              <>
                Concluir cadastro
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div
            className="mt-5 flex items-center justify-center gap-2 text-xs"
            style={{ color: "var(--product-plum)" }}
          >
            <ShieldCheck size={14} />
            Seus dados ficam protegidos e você entra direto no painel.
          </div>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--product-plum)" }}>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium underline underline-offset-4">
            Ir para o login
          </Link>
        </p>

        <p
          className="text-center text-[11px] leading-relaxed mt-4 opacity-80"
          style={{ color: "var(--product-plum)" }}
        >
          Está com problemas para acessar?{" "}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Clique aqui para falar com o nosso Suporte no WhatsApp
          </a>
        </p>

      </div>
    </div>
  );
}
