import { PageMeta } from "@/components/PageMeta";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FirstPasswordPage() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length === 0) {
      setError("Digite uma senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!supabase) {
      setError("O backend ainda não está conectado.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    navigate("/personalizar", { replace: true });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta
        title="Criar sua senha — Link Na Bio Que Vende"
        description="Defina sua senha definitiva para acessar a dashboard."
        path="/trocar-senha"
        noindex
      />
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo size={44} />
        </div>

        <div className="rounded-xl bg-white shadow-lg p-6 border" style={{ borderColor: "var(--product-line)" }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} style={{ color: "var(--product-coral)" }} />
            <h1 className="font-semibold text-lg" style={{ color: "var(--product-ink)" }}>
              Crie sua senha
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Por segurança, escolha uma senha só sua para substituir a senha provisória.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                required
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
              <Lock size={15} className="mr-1.5" />
              {submitting ? "Salvando..." : "Salvar e entrar"}
            </Button>

            <button
              type="button"
              onClick={() => signOut()}
              className="block w-full text-center text-xs text-muted-foreground underline"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
