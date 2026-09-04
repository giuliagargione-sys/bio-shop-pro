import { PageMeta } from "@/components/PageMeta";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-product"
      style={{ background: "var(--product-cream)" }}
    >
      <PageMeta
        title="Bem-vinda — Link Na Bio Que Vende"
        description="Seu pagamento foi confirmado. Sua conta está sendo ativada e em breve você poderá personalizar sua loja."
        path="/bem-vindo"
        noindex
      />

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size={48} />
        </div>

        <div
          className="rounded-xl bg-white shadow-lg p-8 border text-center"
          style={{ borderColor: "var(--product-line)" }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(107, 27, 43, 0.08)" }}
          >
            <Sparkles size={28} style={{ color: "var(--product-coral)" }} />
          </div>

          <h1
            className="text-2xl font-semibold mb-3"
            style={{ color: "var(--product-ink)" }}
          >
            Pagamento confirmado!
          </h1>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--product-plum)" }}>
            Sua conta está sendo ativada. Em poucos minutos você receberá um
            e-mail com seus dados de acesso e o link para começar a montar sua
            loja.
          </p>

          <div
            className="flex items-start gap-3 rounded-lg p-4 mb-6 text-left text-sm"
            style={{ background: "var(--product-cream-deep)" }}
          >
            <Mail
              size={18}
              className="shrink-0 mt-0.5"
              style={{ color: "var(--product-coral)" }}
            />
            <span style={{ color: "var(--product-plum)" }}>
              Não esqueça de conferir a caixa de spam ou promoções caso o
              e-mail não apareça na sua caixa de entrada.
            </span>
          </div>

          <Button
            asChild
            size="lg"
            className="w-full"
            style={{ background: "var(--product-coral)", color: "#fff" }}
          >
            <Link to="/login" className="inline-flex items-center justify-center gap-2">
              Ir para o Login
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--product-plum)" }}>
          Dúvidas? Entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}
