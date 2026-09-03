import { PageMeta } from "@/components/PageMeta";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Link2,
  Sparkles,
  Users,
  Check,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { PlanSignupDialog, type PlanSignupTarget } from "@/components/PlanSignupDialog";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: <Link2 size={18} />,
    title: "Link personalizado",
    text: "Escolha os produtos, o tipo de quiz e transforme a experiência da sua loja em venda personalizada e certeira.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Quiz que vira venda",
    text: "Direcione o seu cliente para o produto ideal conforme o que ele está buscando — aumentando a conversão do site.",
  },
  {
    icon: <Users size={18} />,
    title: "Mais Clientes",
    text: "Aumente sua base de clientes com as respostas do quiz. Cada resposta vira um lead com preferências na sua dash, pronto para ser convertido no WhatsApp.",
  },
  {
    icon: <Zap size={18} />,
    title: "Rápido e fácil",
    text: "Toda estrutura pronta, sem precisar de programação. Fácil e rápido de personalizar.",
  },
];

// TROQUE pelos links reais de checkout direto criados na Hubla (um por
// oferta/plano). O botão do plano abre esse link numa aba nova.
const HUBLA_CHECKOUT_LINKS: Record<string, string> = {
  essencial: "https://pay.hub.la/SEU-LINK-ESSENCIAL",
  pro: "https://pay.hub.la/SEU-LINK-PRO",
};

type PlanFeature = string | { text: string; highlight?: boolean };

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
    ] as PlanFeature[],
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
      { text: "Insights com IA: a partir dos cliques e do uso do seu link, a IA te diz o que ajustar pra vender mais", highlight: true },
      "Botões extras personalizados",
      "Suporte prioritário",
    ] as PlanFeature[],

    highlighted: true,
  },
];

function SectionLabel({ children, tone = "ink" }: { children: string; tone?: "ink" | "light" }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className="h-px w-8"
        style={{ background: tone === "light" ? "rgba(255,253,249,0.35)" : "var(--product-line)" }}
      />
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: tone === "light" ? "var(--product-gold)" : "var(--product-coral)" }}
      >
        {children}
      </span>
      <span
        className="h-px w-8"
        style={{ background: tone === "light" ? "rgba(255,253,249,0.35)" : "var(--product-line)" }}
      />
    </div>
  );
}

function PlanCard({ plan, onChoose }: { plan: (typeof PLANS)[number]; onChoose: () => void }) {
  return (
    <div
      className="rounded-lg p-7 flex flex-col gap-6 relative"
      style={{
        background: plan.highlighted ? "var(--product-ink)" : "#ffffff",
        color: plan.highlighted ? "var(--product-cream)" : "var(--product-ink)",
        border: plan.highlighted ? "1px solid var(--product-ink)" : "1px solid var(--product-line)",
      }}
    >
      {plan.highlighted && (
        <span
          className="absolute -top-3 left-7 text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
          style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}
        >
          Mais escolhido
        </span>
      )}
      <div>
        <p className="font-product font-semibold text-base uppercase tracking-[0.12em]">{plan.name}</p>
        <p className="text-sm opacity-60 mt-1">{plan.tagline}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-product text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className="text-sm opacity-60">{plan.period}</span>
      </div>
      <div className="h-px w-full" style={{ background: plan.highlighted ? "rgba(255,253,249,0.14)" : "var(--product-line)" }} />
      <ul className="space-y-3 flex-1">
        {plan.features.map((f, idx) => {
          const text = typeof f === "string" ? f : f.text;
          const isHighlight = typeof f !== "string" && f.highlight;
          return (
            <li key={`${text}-${idx}`} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Check
                size={15}
                className="shrink-0 mt-1"
                style={{ color: plan.highlighted ? "var(--product-gold)" : "var(--product-coral)" }}
              />
              <span className={isHighlight ? "font-medium" : "opacity-75"}>{text}</span>
            </li>
          );
        })}
      </ul>
      <Button
        className="w-full min-h-11 rounded-full"
        onClick={onChoose}
        style={
          plan.highlighted
            ? { background: "var(--product-cream)", color: "var(--product-ink)" }
            : { background: "var(--product-ink)", color: "var(--product-cream)" }
        }
      >
        Escolher {plan.name}
      </Button>
    </div>
  );
}

export default function LandingPage() {
  const { hash } = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PlanSignupTarget | null>(null);

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hash]);

  return (
    <div className="font-product" style={{ background: "var(--product-cream)", color: "var(--product-ink)" }}>
      <PageMeta title="Link Na Bio Que Vende — sua loja no link da bio do Instagram" description="Monte sua loja no link da bio: produtos em destaque, quiz que vira venda e leads prontos pra fechar no WhatsApp." path="/" />

      {/* Nav */}
      <header className="sticky top-0 z-30 pt-3 sm:pt-5">
        <div className="container">
          <div
            className="flex items-center justify-between gap-4 rounded-full pl-4 pr-2 py-2 backdrop-blur"
            style={{
              border: "1px solid var(--product-line)",
              background: "rgba(255,253,249,0.82)",
              boxShadow: "0 12px 30px -22px rgba(11,11,11,0.35)",
            }}
          >
            <Logo size={28} />
            <nav className="hidden md:flex items-center gap-7 text-sm">
              <a href="#como-funciona" className="opacity-70 hover:opacity-100 transition-opacity">
                Como funciona
              </a>
              <a href="#por-dentro" className="opacity-70 hover:opacity-100 transition-opacity">
                Por dentro
              </a>
              <a href="#planos" className="opacity-70 hover:opacity-100 transition-opacity">
                Planos
              </a>
            </nav>
            <div className="flex items-center gap-1.5">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Entrar
                </Button>
              </Link>
              <a href="#planos">
                <Button size="sm" className="rounded-full px-4" style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}>
                  Começar
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-14 pb-16 sm:pt-24 sm:pb-24 text-center flex flex-col items-center">
        <span
          className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] px-4 py-1.5 rounded-full"
          style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}
        >
          Para quem quer vender mais pelo Instagram
        </span>
        <h1
          className="font-semibold leading-[0.98] tracking-[-0.03em] max-w-3xl mt-7"
          style={{ fontSize: "clamp(38px, 7vw, 68px)" }}
        >
          O link da bio que{" "}
          <span className="italic" style={{ color: "var(--product-coral)" }}>
            vende por você!
          </span>
        </h1>
        <p className="max-w-xl text-base sm:text-lg opacity-65 leading-relaxed mt-6">
          O link da sua bio leva a cliente direto pro produto certo — pra ela comprar ali, na hora.
          E se não comprar, a venda não é perdida: o contato cai pronto pra você{" "}
          <span className="font-semibold" style={{ color: "var(--product-coral-dark)" }}>
            recuperar no WhatsApp
          </span>
          !
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
          <a href="#planos">
            <Button size="lg" className="rounded-full px-7" style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}>
              Quero criar! <ArrowRight size={17} />
            </Button>
          </a>
          <Link to="/login">
            <Button size="lg" variant="outline" className="rounded-full px-7" style={{ borderColor: "var(--product-line)" }}>
              Entrar
            </Button>
          </Link>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs opacity-55 mt-4">
          <ShieldCheck size={14} style={{ color: "var(--product-coral)" }} />
          Sem fidelidade — cancele quando quiser
        </p>

        <div
          id="hero-benefits"
          className="grid sm:grid-cols-3 w-full max-w-4xl mt-14 rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--product-line)", background: "#ffffff" }}
        >
          {[
            {
              icon: <TrendingUp size={18} />,
              title: "Aumente faturamento",
              text: "Converta mais seguidores em clientes com um link que vende de verdade.",
            },
            {
              icon: <Users size={18} />,
              title: "Aumente sua base",
              text: "Capture leads qualificados pelo quiz e organize tudo na dashboard.",
            },
            {
              icon: <Target size={18} />,
              title: "Venda mais certeira",
              text: "Direcione cada cliente ao produto ideal e recupere a venda no WhatsApp.",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="p-6 sm:p-7 text-left flex flex-col gap-3"
              style={{
                borderTop: idx === 0 ? "none" : "1px solid var(--product-line)",
              }}
            >
              <div style={{ color: "var(--product-coral)" }}>{item.icon}</div>
              <p className="font-semibold text-sm sm:text-[15px]">{item.title}</p>
              <p className="text-[13px] sm:text-sm opacity-60 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
        <style>{`@media (min-width: 640px) { #hero-benefits > div + div { border-top: none; border-left: 1px solid var(--product-line); } }`}</style>
      </section>

      {/* Features */}
      <section id="como-funciona" className="py-20 sm:py-24" style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}>
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-14 flex flex-col items-center gap-4">
            <SectionLabel tone="light">Como funciona</SectionLabel>
            <h2 className="text-3xl sm:text-[42px] font-semibold tracking-[-0.02em] leading-tight">
              Venda mais do jeito certo!
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg p-6 flex flex-col gap-3"
                style={{ background: "var(--product-cream)", color: "var(--product-ink)" }}
              >
                <div style={{ color: "var(--product-coral)" }}>{f.icon}</div>
                <p className="font-semibold text-[15px]">{f.title}</p>
                <p className="text-sm opacity-60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA between Como funciona and Por dentro */}
      <section className="container -mt-8 sm:-mt-10 mb-6 relative z-10">
        <div className="flex justify-center">
          <a href="#planos">
            <Button
              size="lg"
              className="rounded-full px-8 shadow-lg"
              style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}
            >
              Quero criar! <ArrowRight size={17} />
            </Button>
          </a>
        </div>
      </section>

      {/* Preview */}
      <section id="por-dentro" className="container py-20 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-14 flex flex-col items-center gap-4">
          <SectionLabel>Por dentro</SectionLabel>
          <h2 className="text-3xl sm:text-[42px] font-semibold tracking-[-0.02em] leading-tight">
            Monte sua loja em 5 passos!
          </h2>
        </div>
        <div className="max-w-3xl mx-auto" style={{ borderTop: "1px solid var(--product-line)" }}>
          {[
            { step: 1, title: "Escolha a sua logo e cores", text: "Defina a identidade visual do seu link com a sua marca." },
            { step: 2, title: "Escolha os produtos em destaque", text: "Selecione as peças que você quer destacar e puxar vendas." },
            { step: 3, title: "Monte o seu quiz personalizado", text: "Crie perguntas que guiam o cliente até o produto ideal." },
            { step: 4, title: "Direcione as respostas", text: "Leve o cliente para o WhatsApp ou para uma aba específica do seu site." },
            { step: 5, title: "Tudo pronto e no ar!", text: "Publique seu link e comece a vender mais pelo Instagram." },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-5 sm:gap-8 py-6"
              style={{ borderBottom: "1px solid var(--product-line)" }}
            >
              <span
                className="font-product text-2xl sm:text-3xl font-semibold tabular-nums shrink-0 w-9 sm:w-12"
                style={{ color: "var(--product-coral)", opacity: 0.45 }}
              >
                {String(item.step).padStart(2, "0")}
              </span>
              <div className="sm:flex sm:items-baseline sm:gap-8 sm:flex-1">
                <p className="font-semibold text-[15px] sm:text-base sm:w-64 shrink-0">{item.title}</p>
                <p className="text-sm opacity-60 leading-relaxed mt-1 sm:mt-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="container py-20 sm:py-24" style={{ borderTop: "1px solid var(--product-line)" }}>
        <div className="text-center max-w-xl mx-auto mb-14 flex flex-col items-center gap-4">
          <SectionLabel>Planos</SectionLabel>
          <h2 className="text-3xl sm:text-[42px] font-semibold tracking-[-0.02em] leading-tight">
            Escolha o plano e crie sua loja agora
          </h2>
          <p className="text-sm opacity-60">Pagamento seguro sem fidelidade.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              onChoose={() =>
                setSelectedPlan({
                  slug: plan.slug,
                  name: plan.name,
                  checkoutUrl: HUBLA_CHECKOUT_LINKS[plan.slug],
                })
              }
            />
          ))}
        </div>
        <p className="text-center text-sm opacity-60 mt-10">
          Já pagou e ainda não criou sua conta?{" "}
          <Link to="/login?mode=signup" className="underline font-medium">
            Criar minha conta
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="container pb-20 sm:pb-24">
        <div
          className="rounded-lg px-8 py-16 text-center flex flex-col items-center gap-6"
          style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}
        >
          <LogoMark size={40} />
          <h2 className="text-2xl sm:text-[38px] font-semibold tracking-[-0.02em] leading-tight max-w-xl">
            Crie seu link em 5 minutos e comece a aumentar suas vendas!
          </h2>
          <a href="#planos">
            <Button size="lg" className="rounded-full px-7" style={{ background: "var(--product-cream)", color: "var(--product-ink)" }}>
              Ver planos <ArrowRight size={17} />
            </Button>
          </a>
        </div>
      </section>

      <footer
        className="py-10 text-center text-sm opacity-55 flex flex-col items-center gap-2"
        style={{ borderTop: "1px solid var(--product-line)" }}
      >
        <span>© {new Date().getFullYear()} Link Na Bio Que Vende</span>
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center gap-1 underline">
          <MessageCircle size={14} /> Falar com a gente
        </a>
      </footer>

      <PlanSignupDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
}
