import { Link } from "react-router-dom";
import {
  ArrowRight,
  Link2,
  Sparkles,
  Users,
  Palette,
  Check,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: <Link2 size={20} />,
    title: "Um link, uma loja",
    text: "Cole um único link na bio do Instagram e transforme ele numa loja de verdade: capa, produtos e um jeito de comprar.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Quiz que vira venda",
    text: "Um quiz de estilo guia a cliente até o look ideal — e captura o contato dela no processo, sem ela perceber que é \"só marketing\".",
  },
  {
    icon: <Users size={20} />,
    title: "Leads organizados",
    text: "Cada resposta do quiz vira um lead na sua dashboard, com respostas, WhatsApp pronto pra chamar e controle de quem já foi atendida.",
  },
  {
    icon: <Palette size={20} />,
    title: "Sua cara, sem precisar programar",
    text: "Cores, fonte, produtos, textos, dúvidas e trocas — tudo isso você edita numa dashboard simples, sem mexer em nenhuma linha de código.",
  },
];

// TROQUE pelos links reais de checkout direto criados na Hubla (um por
// oferta/plano). O botão do plano abre esse link numa aba nova.
const HUBLA_CHECKOUT_LINKS: Record<string, string> = {
  essencial: "https://pay.hub.la/SEU-LINK-ESSENCIAL",
  pro: "https://pay.hub.la/SEU-LINK-PRO",
};

const PLANS = [
  {
    slug: "essencial",
    name: "Essencial",
    price: "R$ 47",
    period: "/mês",
    tagline: "Pra começar a vender pelo link da bio",
    features: [
      "Loja personalizável no link da bio",
      "Quiz de estilo com captura de leads",
      "Dashboard de leads",
      "Painel de cliques e peças mais desejadas",
      "Produtos ilimitados",
    ],
    highlighted: false,
  },
  {
    slug: "pro",
    name: "PRO",
    price: "R$ 97",
    period: "/mês",
    tagline: "Pra quem quer tirar o trabalho manual do caminho",
    features: [
      "Tudo do plano Essencial",
      "Insights com IA: sugestões de melhoria a partir dos seus cliques",
      "Botões de dúvidas e trocas personalizados",
      "Suporte prioritário",
    ],

    highlighted: true,
  },
];

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-5 relative"
      style={{
        background: plan.highlighted ? "var(--product-ink)" : "#ffffff",
        color: plan.highlighted ? "#ffffff" : "var(--product-ink)",
        border: plan.highlighted ? "none" : "1px solid var(--product-line)",
        boxShadow: plan.highlighted ? "0 20px 40px -18px rgba(34,18,38,0.45)" : "none",
      }}
    >
      {plan.highlighted && (
        <span
          className="absolute -top-3 left-6 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: "var(--product-gold)", color: "var(--product-ink)" }}
        >
          Mais escolhido
        </span>
      )}
      <div>
        <p className="font-product font-semibold text-lg">{plan.name}</p>
        <p className="text-sm opacity-70 mt-0.5">{plan.tagline}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-product text-3xl font-semibold">{plan.price}</span>
        <span className="text-sm opacity-70">{plan.period}</span>
      </div>
      <ul className="space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              size={16}
              className="shrink-0 mt-0.5"
              style={{ color: plan.highlighted ? "var(--product-gold)" : "var(--product-coral)" }}
            />
            <span className="opacity-90">{f}</span>
          </li>
        ))}
      </ul>
      {/* Checkout direto na Hubla — não passa pelo nosso /login. Depois de
          pagar, configure na Hubla o redirecionamento pra
          /login?mode=signup&plan={plan.slug}, pra pessoa criar a conta. */}
      <a href={HUBLA_CHECKOUT_LINKS[plan.slug]} target="_blank" rel="noreferrer">
        <Button
          className="w-full"
          style={
            plan.highlighted
              ? { background: "var(--product-coral)", color: "#fff" }
              : { background: "var(--product-cream)", color: "var(--product-ink)" }
          }
        >
          Escolher {plan.name}
        </Button>
      </a>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="font-product" style={{ background: "var(--product-cream)", color: "var(--product-ink)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur border-b" style={{ borderColor: "var(--product-line)", background: "rgba(255,253,249,0.88)" }}>
        <div className="container flex items-center justify-between py-3">
          <Logo size={32} />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <a href="#planos">
              <Button size="sm" style={{ background: "var(--product-coral)", color: "#fff" }}>
                Ver planos
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 sm:py-24 text-center flex flex-col items-center gap-6">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "var(--product-cream-deep)", color: "var(--product-coral-dark)" }}
        >
          Para quem quer vender mais pelo Instagram
        </span>
        <h1 className="font-semibold leading-[1.05] max-w-2xl" style={{ fontSize: "clamp(32px, 6vw, 54px)" }}>
          O link da bio que vende por você
        </h1>
        <p className="max-w-lg text-base sm:text-lg opacity-70">
          Sua cliente clica no link, faz um quiz rápido e já sai sabendo o que comprar — o contato
          dela cai pronto na sua dashboard, pra você{" "}
          <span className="font-semibold" style={{ color: "var(--product-coral-dark)" }}>
            fechar no WhatsApp
          </span>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href="#planos">
            <Button size="lg" style={{ background: "var(--product-coral)", color: "#fff" }}>
              Quero minha loja <ArrowRight size={18} />
            </Button>
          </a>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Entrar
            </Button>
          </Link>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs opacity-60 pt-1">
          <ShieldCheck size={14} style={{ color: "var(--product-coral)" }} />
          Sem fidelidade — cancele quando quiser
        </p>
      </section>

      {/* Features */}
      <section id="como-funciona" className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div className="text-center max-w-md mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-coral-dark)" }}>
            Como funciona
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Tudo o que sua loja no link da bio precisa</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-5 flex gap-4" style={{ border: "1px solid var(--product-line)" }}>
              <div
                className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--product-cream)", color: "var(--product-coral)" }}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-medium mb-1">{f.title}</p>
                <p className="text-sm opacity-70 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div className="text-center max-w-md mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-coral-dark)" }}>
            Por dentro
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Do jeito que a sua cliente vê, do jeito que você controla</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="rounded-xl bg-white p-5" style={{ border: "1px solid var(--product-line)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-3">A loja que a cliente vê</p>
            <div
              className="rounded-xl p-5 text-center text-white"
              style={{ background: "linear-gradient(135deg, var(--product-plum), var(--product-ink))" }}
            >
              <p className="text-[10px] uppercase tracking-wider opacity-75">Moda que combina com você</p>
              <p className="font-semibold text-lg mt-1 mb-3">Descubra seu look ideal</p>
              <span
                className="inline-flex text-xs font-semibold px-4 py-2 rounded-full"
                style={{ background: "var(--product-coral)" }}
              >
                Fazer o quiz
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white p-5" style={{ border: "1px solid var(--product-line)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-3">A dashboard que você controla</p>
            <div className="space-y-1.5">
              {[
                { label: "Leads", active: true },
                { label: "Produtos", active: false },
                { label: "Quiz", active: false },
                { label: "Botões extras", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-sm rounded-lg px-3 py-2 flex items-center gap-2"
                  style={
                    item.active
                      ? { background: "var(--product-coral)", color: "#fff", fontWeight: 600 }
                      : { color: "var(--product-ink)", opacity: 0.7 }
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor", opacity: 0.6 }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div className="text-center max-w-md mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-coral-dark)" }}>
            Planos
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Escolha o plano e crie sua loja agora</h2>
          <p className="text-sm opacity-70 mt-2">Pagamento seguro pela Hubla. Cancele quando quiser.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} />
          ))}
        </div>
        <p className="text-center text-sm opacity-70 mt-8">
          Já pagou e ainda não criou sua conta?{" "}
          <Link to="/login?mode=signup" className="underline font-medium">
            Criar minha conta
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div
          className="rounded-xl p-10 text-center flex flex-col items-center gap-5"
          style={{ background: "linear-gradient(135deg, var(--product-plum), var(--product-ink))", color: "#fff" }}
        >
          <LogoMark size={44} />
          <h2 className="text-2xl sm:text-3xl font-semibold max-w-md">Sua loja no link da bio pode começar a vender hoje</h2>
          <a href="#planos">
            <Button size="lg" style={{ background: "var(--product-coral)", color: "#fff" }}>
              Ver planos <ArrowRight size={18} />
            </Button>
          </a>
        </div>
      </section>

      <footer className="py-8 text-center text-sm opacity-60 flex flex-col items-center gap-2">
        <span>© {new Date().getFullYear()} Link Na Bio Que Vende</span>
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center gap-1 underline">
          <MessageCircle size={14} /> Falar com a gente
        </a>
      </footer>
    </div>
  );
}
