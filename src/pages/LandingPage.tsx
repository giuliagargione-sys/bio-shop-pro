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
    icon: <Link2 size={20} />,
    title: "Link personalizado",
    text: "Escolha os produtos, o tipo de quiz e transforme a experiência da sua loja em venda personalizada e certeira.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Quiz que vira venda",
    text: "Direcione o seu cliente para o produto ideal conforme o que ele está buscando — aumentando a conversão do site.",
  },
  {
    icon: <Users size={20} />,
    title: "Mais Clientes",
    text: "Aumente sua base de clientes com as respostas do quiz. Cada resposta vira um lead com preferências na sua dash, pronto para ser convertido no WhatsApp.",
  },
  {
    icon: <Zap size={20} />,
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

function PlanCard({ plan, onChoose }: { plan: (typeof PLANS)[number]; onChoose: () => void }) {

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
        {plan.features.map((f, idx) => {
          const text = typeof f === "string" ? f : f.text;
          const isHighlight = typeof f !== "string" && f.highlight;
          return (
            <li key={`${text}-${idx}`} className="flex items-start gap-2 text-sm">
              <Check
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: plan.highlighted ? "var(--product-gold)" : "var(--product-coral)" }}
              />
              <span className={`opacity-90 ${isHighlight ? "underline underline-offset-2" : ""}`}>{text}</span>
            </li>
          );
        })}
      </ul>
      <Button
        className="w-full min-h-11"
        onClick={onChoose}
        style={
          plan.highlighted
            ? { background: "var(--product-coral)", color: "#fff" }
            : { background: "var(--product-cream)", color: "var(--product-ink)" }
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
          style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}
        >
          Para quem quer vender mais pelo Instagram
        </span>
        <h1 className="font-semibold leading-[1.05] max-w-2xl" style={{ fontSize: "clamp(32px, 6vw, 54px)" }}>
          O link da bio que vende por você!
        </h1>
        <p className="max-w-lg text-base sm:text-lg opacity-70">
          O link da sua bio leva a cliente direto pro produto certo — pra ela comprar ali, na hora.
          E se não comprar, a venda não é perdida: o contato cai pronto pra você{" "}
          <span className="font-semibold" style={{ color: "var(--product-coral-dark)" }}>
            recuperar no WhatsApp
          </span>
          !
        </p>
        <div className="grid sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {[
            {
              icon: <TrendingUp size={22} />,
              title: "Aumente faturamento",
              text: "Converta mais seguidores em clientes com um link que vende de verdade.",
            },
            {
              icon: <Users size={22} />,
              title: "Aumente sua base",
              text: "Capture leads qualificados pelo quiz e organize tudo na dashboard.",
            },
            {
              icon: <Target size={22} />,
              title: "Venda mais certeira",
              text: "Direcione cada cliente ao produto ideal e recupere a venda no WhatsApp.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-5 text-left flex flex-col gap-3"
              style={{
                background: "#ffffff",
                border: "1px solid var(--product-line)",
                boxShadow: "0 8px 24px -12px rgba(11,11,11,0.08)",
              }}
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--product-coral)", color: "#ffffff" }}
              >
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base" style={{ color: "var(--product-ink)" }}>
                  {item.title}
                </p>
                <p className="text-xs sm:text-sm opacity-70 leading-relaxed mt-1">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
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
      <section id="como-funciona" className="py-16" style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}>
        <div className="container">
          <div className="text-center max-w-md mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-gold)" }}>
              Como funciona
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold">Venda mais do jeito certo!</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl p-5 flex gap-4" style={{ background: "#ffffff", color: "var(--product-ink)" }}>
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
        </div>
      </section>

      {/* Preview */}
      <section className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div className="text-center max-w-md mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-coral-dark)" }}>
            Por dentro
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Monte sua loja em 5 passos!</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { step: 1, title: "Escolha a sua logo e cores", text: "Defina a identidade visual do seu link com a sua marca." },
            { step: 2, title: "Escolha os produtos em destaque", text: "Selecione as peças que você quer destacar e puxar vendas." },
            { step: 3, title: "Monte o seu quiz personalizado", text: "Crie perguntas que guiam o cliente até o produto ideal." },
            { step: 4, title: "Direcione as respostas", text: "Leve o cliente para o WhatsApp ou para uma aba específica do seu site." },
            { step: 5, title: "Tudo pronto e no ar!", text: "Publique seu link e comece a vender mais pelo Instagram.", highlight: true },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-xl p-5 flex gap-4 ${item.highlight ? "sm:col-span-2 lg:col-span-1 lg:col-start-2 justify-center" : ""}`}
              style={
                item.highlight
                  ? { background: "var(--product-coral)", color: "#ffffff", boxShadow: "0 12px 28px -10px rgba(107,27,43,0.35)" }
                  : { background: "#ffffff", color: "var(--product-ink)", border: "1px solid var(--product-line)" }
              }
            >
              <div
                className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={
                  item.highlight
                    ? { background: "#ffffff", color: "var(--product-coral)" }
                    : { background: "var(--product-coral)", color: "#ffffff" }
                }
              >
                {item.step}
              </div>
              <div>
                <p className="font-medium mb-1">{item.title}</p>
                <p className={`text-sm leading-relaxed ${item.highlight ? "opacity-90" : "opacity-70"}`}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="container py-16 border-t" style={{ borderColor: "var(--product-line)" }}>
        <div className="text-center max-w-md mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--product-coral-dark)" }}>
            Planos
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Escolha o plano e crie sua loja agora</h2>
          <p className="text-sm opacity-70 mt-2">Pagamento seguro sem fidelidade.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
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
          <h2 className="text-2xl sm:text-3xl font-semibold max-w-md">Crie seu link em 5 minutos e comece a aumentar suas vendas!</h2>
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

      <PlanSignupDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
}
