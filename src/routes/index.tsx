import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Link Na Bio Que Vende — a loja no link da bio do Instagram" },
      {
        name: "description",
        content:
          "Transforme o link da bio do Instagram numa loja com quiz de estilo, leads organizados e dashboard fácil. Planos a partir de R$ 47/mês.",
      },
      { property: "og:title", content: "Link Na Bio Que Vende" },
      {
        property: "og:description",
        content:
          "Uma loja, um quiz que gera leads e uma dashboard fácil — tudo no único link que cabe na sua bio.",
      },
    ],
  }),
  component: Landing,
});

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round">
      <path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7L12 19" />
    </svg>
  );
}
function IconQuiz() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4" />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}
function IconLeads() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M18 8.5h4M20 6.5v4" />
    </svg>
  );
}
function IconBrush() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c0-2 1.5-3 3-3s3 1 3 3-1.5 2-3 2H4v-2z" />
      <path d="M9.5 16.5L19 7a2.1 2.1 0 00-3-3L6.5 13.5" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth="2.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const steps = [
  { icon: <IconLink />, title: "Um link, uma loja", text: "Cole um único link na bio do Instagram e transforme ele numa loja de verdade." },
  { icon: <IconQuiz />, title: "Quiz que vira venda", text: "Um quiz de estilo guia a cliente até o look ideal e captura o contato dela no processo." },
  { icon: <IconLeads />, title: "Leads organizados", text: "Cada resposta do quiz vira um lead na sua dashboard, com WhatsApp pronto pra chamar." },
  { icon: <IconBrush />, title: "Sua cara, sem precisar programar", text: "Cores, fonte, produtos, tudo editável numa dashboard simples." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-creme">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-tinta/8 bg-creme/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link to="/" aria-label="Página inicial">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-ameixa transition hover:bg-ameixa/5"
            >
              Entrar
            </Link>
            <a href="#planos" className="btn-coral !px-4 !py-2 text-sm">
              Ver planos
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-tinta/8 px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.245 0.045 332 / 7%) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-coral-dark">
            Pra quem vende pelo Instagram
          </span>
          <h1 className="mt-7 font-display text-4xl font-medium leading-[1.1] tracking-tight text-tinta sm:text-6xl">
            O link da bio que{" "}
            <span className="text-coral">também vende</span> por você
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Uma loja, um quiz que gera leads e uma dashboard fácil de mexer — tudo no
            único link que cabe na sua bio do Instagram.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#planos" className="btn-coral w-full sm:w-auto">
              Ver planos
            </a>
            <Link to="/login" className="btn-ghost w-full sm:w-auto">
              Já sou aluna — entrar
            </Link>
          </div>
          <p className="mt-8 text-xs font-medium tracking-wide text-muted-foreground/80">
            Sem mensalidade escondida · Cancele quando quiser · Suporte em português
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                Como funciona
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-tinta sm:text-4xl">
                Da bio até o WhatsApp, em quatro passos
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Sem depender de programador, designer ou agência.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-tinta/10 bg-tinta/10 sm:grid-cols-2">
            {steps.map((s, i) => (
              <article
                key={s.title}
                className="bg-card p-6 transition sm:p-8 hover:bg-card/60"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-coral/8 text-coral ring-1 ring-coral/15">
                    {s.icon}
                  </span>
                  <span className="text-xs font-bold tabular-nums tracking-widest text-muted-foreground/60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-medium text-tinta">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section
        id="planos"
        className="scroll-mt-24 border-t border-tinta/8 bg-white/60 px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
              Planos
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-tinta sm:text-4xl">
              Escolha o seu plano
            </h2>
            <p className="mt-3 text-muted-foreground">
              Comece simples e evolua quando a loja começar a girar. Cancele quando quiser.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
            {/* Essencial */}
            <div className="flex flex-col rounded-xl border border-tinta/10 bg-card p-7 sm:p-8">
              <h3 className="font-display text-xl font-medium text-tinta">Essencial</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pra tirar a loja do papel.</p>
              <p className="mt-6 font-display text-4xl font-medium tracking-tight text-tinta">
                R$ 47
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </p>
              <ul className="mt-7 space-y-3.5 text-sm text-tinta/85">
                {[
                  "Loja no link da bio com seu domínio da plataforma",
                  "Até 30 produtos com fotos e preços",
                  "Botão de WhatsApp em cada produto",
                  "Dashboard simples de edição",
                ].map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="text-coral">
                      <Check />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-ghost mt-auto w-full pt-0" style={{ marginTop: "2rem" }}>
                Escolher Essencial
              </a>
            </div>

            {/* Que Vende */}
            <div className="relative flex flex-col rounded-xl bg-ameixa p-7 shadow-[0_20px_50px_-24px_rgba(61,31,77,0.55)] ring-1 ring-ameixa sm:p-8">
              <span className="absolute -top-3 left-7 rounded-full bg-dourado px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-tinta">
                Mais escolhido
              </span>
              <h3 className="font-display text-xl font-medium text-creme">Que Vende</h3>
              <p className="mt-1 text-sm text-creme/65">Pra transformar seguidora em cliente.</p>
              <p className="mt-6 font-display text-4xl font-medium tracking-tight text-creme">
                R$ 97
                <span className="text-sm font-normal text-creme/65">/mês</span>
              </p>
              <ul className="mt-7 space-y-3.5 text-sm text-creme/85">
                {[
                  "Tudo do Essencial, sem limite de produtos",
                  "Quiz de estilo que recomenda os looks",
                  "Leads organizados com WhatsApp pronto",
                  "Personalização completa de cores e fontes",
                ].map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="text-dourado">
                      <Check />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-dourado mt-auto w-full" style={{ marginTop: "2rem" }}>
                Escolher Que Vende
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[linear-gradient(135deg,var(--ameixa),var(--tinta))] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-creme sm:text-4xl">
            Sua loja no link da bio pode começar a vender hoje
          </h2>
          <div className="mt-8">
            <a href="#planos" className="btn-coral">
              Ver planos
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-tinta/8 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Link Na Bio Que Vende. Todos os direitos reservados.</p>
          <a
            href="#"
            className="font-semibold text-coral-dark underline-offset-4 hover:underline"
          >
            Falar com a gente
          </a>
        </div>
      </footer>
    </div>
  );
}
