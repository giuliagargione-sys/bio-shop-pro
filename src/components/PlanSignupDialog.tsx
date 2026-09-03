import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export type PlanSignupTarget = {
  slug: string;
  name: string;
  checkoutUrl: string;
};

type Props = {
  plan: PlanSignupTarget | null;
  onClose: () => void;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function PlanSignupDialog({ plan, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setError(null);
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (plan) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [plan, onClose]);

  if (!plan) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const digits = onlyDigits(whatsapp);

    if (cleanName.length < 2 || cleanName.length > 100) {
      setError("Digite seu nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail) || cleanEmail.length > 255) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (digits.length < 10 || digits.length > 11) {
      setError("Digite o WhatsApp com DDD.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: insertError } = await supabase.from("checkout_signups").insert({
      name: cleanName,
      email: cleanEmail,
      whatsapp: digits,
      plan: plan.slug,
    });
    setLoading(false);

    if (insertError) {
      setError("Não conseguimos salvar seus dados. Tente novamente.");
      return;
    }

    const url = new URL(plan.checkoutUrl);
    url.searchParams.set("name", cleanName);
    url.searchParams.set("email", cleanEmail);
    url.searchParams.set("phone", digits);
    window.location.href = url.toString();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(11,11,11,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 relative"
        style={{ background: "#ffffff", color: "var(--product-ink)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 p-2 opacity-60 hover:opacity-100"
        >
          <X size={18} />
        </button>

        <h2 className="font-product text-xl font-semibold pr-8">Plano {plan.name}</h2>
        <p className="text-sm opacity-70 mt-1">
          Preencha seus dados para seguir para o pagamento seguro.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Nome</Label>
            <Input
              id="signup-name"
              value={name}
              maxLength={100}
              autoComplete="name"
              placeholder="Seu nome completo"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-whatsapp">WhatsApp</Label>
            <Input
              id="signup-whatsapp"
              value={whatsapp}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">E-mail</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              maxLength={255}
              autoComplete="email"
              placeholder="voce@email.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--product-coral-dark)" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full min-h-11"
            style={{ background: "var(--product-coral)", color: "#fff" }}
          >
            {loading ? "Enviando..." : (
              <>
                Ir para o pagamento <ArrowRight size={18} />
              </>
            )}
          </Button>
          <p className="text-xs opacity-60 text-center">
            Pagamento seguro sem fidelidade.
          </p>
        </form>
      </div>
    </div>
  );
}
