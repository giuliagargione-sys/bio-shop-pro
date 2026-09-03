import { PageMeta } from "@/components/PageMeta";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!supabase) {
      setError("O Supabase ainda não foi conectado a este projeto.");
      setSubmitting(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta title="Recuperar senha — Link Na Bio Que Vende" description="Receba um e-mail para criar uma nova senha e voltar a acessar sua dashboard." path="/recuperar-senha" noindex />
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
            <Mail size={16} style={{ color: "var(--product-coral)" }} />
            <h1 className="font-semibold text-lg" style={{ color: "var(--product-ink)" }}>
              Recuperar senha
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Digite seu e-mail que enviamos um link pra você criar uma nova senha.
          </p>

          {!isSupabaseConfigured ? (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <span>
                O Supabase ainda não foi conectado a este projeto no Lovable. Conecte em
                Configurações → Supabase e rode o SQL do arquivo{" "}
                <code className="text-xs">supabase/migrations/0001_init.sql</code>.
              </span>
            </div>
          ) : sent ? (
            <div className="text-sm text-center py-4 space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 size={40} style={{ color: "var(--product-coral)" }} />
              </div>
              <p>
                Se houver uma conta com <strong>{email}</strong>, você receberá um e-mail com
                instruções em poucos minutos.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                Enviar para outro e-mail
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
                {submitting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
