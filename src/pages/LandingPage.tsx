import { PageMeta } from "@/components/PageMeta";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  X,
  ExternalLink,
  Smartphone,
  Star,
  Send,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { PlanSignupDialog, type PlanSignupTarget } from "@/components/PlanSignupDialog";
import { Button } from "@/components/ui/button";
import { storeUrl } from "@/lib/storeUrl";

const DEMO_SLUG = "giuteste";
const DEMO_URL = storeUrl(DEMO_SLUG);

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
    demo: true,
  },
];

// TROQUE pelos links reais de checkout direto criados na Hubla (um por
// oferta/plano). O botão do plano abre esse link numa aba nova.
const HUBLA_CHECKOUT_LINKS: Record<string, string> = {
  essencial: "https://pay.hub.la/SEU-LINK-ESSENCIAL",
  "essencial-anual": "https://pay.hub.la/SEU-LINK-ESSENCIAL-ANUAL",
  pro: "https://pay.hub.la/SEU-LINK-PRO",
  "pro-anual": "https://pay.hub.la/SEU-LINK-PRO-ANUAL",
};

type PlanFeature = string | { text: string; highlight?: boolean; star?: boolean };

const PLANS = [
  {
    slug: "essencial",
    name: "Essencial",
    monthlyPrice: 47,
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
    monthlyPrice: 97,
    tagline: "Pra quem quer vender mais com menos esforço",
    features: [
      "Tudo do plano Essencial",
      { text: "Insights com IA: melhorar vendas com base nos dados do seu negócio!", highlight: true, star: true },
      { text: "Banners personalizados", star: true },
      { text: "Vídeos Reels", star: true },
      { text: "Botões extras personalizados", star: true },
      { text: "Suporte prioritário", star: true },
    ] as PlanFeature[],

    highlighted: true,
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

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

function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(11,11,11,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Fechar demonstração"
        >
          <X size={28} />
        </button>

        <div
          className="relative rounded-[2.2rem] p-2 shadow-2xl"
          style={{
            background: "var(--product-ink)",
            transform: "scale(0.82)",
            transformOrigin: "top center",
          }}
        >
          {/* Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10" />

          <div
            className="relative overflow-hidden rounded-[1.7rem] bg-white"
            style={{ width: "min(84vw, 390px)", height: "min(78vh, 720px)" }}
          >
            {loading && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm opacity-60 z-10 bg-white">
                <Smartphone size={32} style={{ color: "var(--product-coral)" }} />
                <span>Carregando demonstração…</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center z-10 bg-white">
                <Smartphone size={40} style={{ color: "var(--product-coral)" }} />
                <p className="text-sm opacity-70">
                  Não foi possível carregar a prévia aqui.
                </p>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" className="rounded-full gap-2" style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}>
                    Abrir demo <ExternalLink size={14} />
                  </Button>
                </a>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={DEMO_URL}
              title="Demonstração da loja"
              className="w-full h-full border-0"
              loading="eager"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          </div>

          {/* Footer do celular */}
          <div className="flex items-center justify-center gap-2 pt-3 pb-1">
            <Send size={14} style={{ color: "var(--product-cream)" }} />
            <span className="text-[11px] font-medium" style={{ color: "var(--product-cream)" }}>
              Potencialize suas vendas!
            </span>
          </div>
        </div>

        <p className="text-white/60 text-xs mt-4 text-center max-w-xs">
          Visualização da loja de exemplo. Toque fora ou pressione ESC para fechar.
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan, onChoose }: { plan: (typeof PLANS)[number]; onChoose: () => void }) {
  const isPro = plan.highlighted;
  return (
    <div
      className="rounded-lg p-7 flex flex-col gap-6 relative"
      style={{
        background: isPro ? "var(--product-coral)" : "#ffffff",
        color: isPro ? "var(--product-cream)" : "var(--product-ink)",
        border: isPro ? "1px solid var(--product-coral)" : "1px solid var(--product-line)",
      }}
    >
      {isPro && (
        <span
          className="absolute -top-3 left-7 text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
          style={{ background: "var(--product-cream)", color: "var(--product-coral)" }}
        >
          Mais escolhido
        </span>
      )}
      <div>
        <p className="font-product font-semibold text-base uppercase tracking-[0.12em]">{plan.name}</p>
        <p className="text-sm opacity-75 mt-1">{plan.tagline}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-product text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className="text-sm opacity-75">{plan.period}</span>
      </div>
      <div className="h-px w-full" style={{ background: isPro ? "rgba(255,253,249,0.22)" : "var(--product-line)" }} />
      <ul className="space-y-3 flex-1">
        {plan.features.map((f, idx) => {
          const text = typeof f === "string" ? f : f.text;
          const isHighlight = typeof f !== "string" && f.highlight;
          const isStar = typeof f !== "string" && f.star;
          const Icon = isStar ? Star : Check;
          return (
            <li key={`${text}-${idx}`} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Icon
                size={15}
                className="shrink-0 mt-1"
                style={{ color: isPro ? "var(--product-gold)" : "var(--product-coral)" }}
              />
              <span className={isHighlight ? "font-semibold" : "opacity-90"}>{text}</span>
            </li>
          );
        })}
      </ul>
      <Button
        className="w-full min-h-11 rounded-full"
        onClick={onChoose}
        style={
          isPro
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
  const [demoOpen, setDemoOpen] = useState(false);

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
          Venda mais pelo Instagram
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
          O link da sua bio leva a cliente direto pro produto certo.
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
          className="grid sm:grid-cols-3 gap-4 w-full max-w-5xl mt-14"
        >
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
              className="rounded-2xl p-5 sm:p-6 flex items-center gap-4 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              style={{ border: "1px solid var(--product-line)" }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(107, 27, 43, 0.06)", color: "var(--product-coral)" }}
              >
                {item.icon}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-base sm:text-lg leading-tight">{item.title}</p>
                <p className="text-sm opacity-65 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

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
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {FEATURES.map((f, idx) => (
              <div
                key={f.title}
                className="group rounded-xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: "var(--product-cream)",
                  color: "var(--product-ink)",
                  border: "1px solid rgba(107, 27, 43, 0.08)",
                  boxShadow: "0 4px 18px -8px rgba(11,11,11,0.08)",
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: "rgba(107, 27, 43, 0.08)",
                    color: "var(--product-coral)",
                  }}
                >
                  {f.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(107, 27, 43, 0.08)", color: "var(--product-coral)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="font-semibold text-[15px] sm:text-base leading-tight">{f.title}</p>
                  </div>
                  <p className="text-sm opacity-60 leading-relaxed">{f.text}</p>
                </div>
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

      {/* CTA between Monte sua loja em 5 passos and Planos */}
      <section className="container -mt-8 sm:-mt-10 mb-6 relative z-10">
        <div className="flex justify-center">
          <button
            onClick={() => setDemoOpen(true)}
            className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: "var(--product-ink)", color: "var(--product-cream)" }}
          >
            <Star size={16} className="fill-[var(--product-gold)] text-[var(--product-gold)]" />
            Ver demonstração
          </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto items-stretch">
          <PlanCard
            plan={PLANS[0]}
            onChoose={() =>
              setSelectedPlan({
                slug: PLANS[0].slug,
                name: PLANS[0].name,
                checkoutUrl: HUBLA_CHECKOUT_LINKS[PLANS[0].slug],
              })
            }
          />
          <PlanCard
            plan={PLANS[1]}
            onChoose={() =>
              setSelectedPlan({
                slug: PLANS[1].slug,
                name: PLANS[1].name,
                checkoutUrl: HUBLA_CHECKOUT_LINKS[PLANS[1].slug],
              })
            }
          />
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
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
