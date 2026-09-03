import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hashMissing, setHashMissing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");

    if (type !== "recovery") {
      setHashMissing(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length === 0) {
      setError("Digite uma senha.");
      return;
    }



    setSubmitting(true);

    if (!supabase) {
      setError("O Supabase ainda não foi conectado a este projeto.");
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/personalizar"), 2000);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
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
              Nova senha
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Crie uma nova senha forte pra sua conta.
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
          ) : hashMissing ? (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <span>
                Esse link não é válido para redefinir senha. Peça um novo link em{" "}
                <Link to="/recuperar-senha" className="underline">
                  Recuperar senha
                </Link>
                .
              </span>
            </div>
          ) : success ? (
            <div className="text-sm text-center py-4 space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 size={40} style={{ color: "var(--product-coral)" }} />
              </div>
              <p>
                <strong>Senha atualizada!</strong> Você já pode entrar com a nova senha.
              </p>
              <Button
                className="w-full"
                style={{ background: "var(--product-coral)", color: "#fff" }}
                onClick={() => navigate("/login")}
              >
                Ir pro login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nova senha</Label>
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
              <div>
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
