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
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" strokeWidth="2" stroke="currentColor" strokeLinecap="round">
      <path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7L12 19" />
    </svg>
  );
}
function IconQuiz() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4" />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}
function IconLeads() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M18 8.5h4M20 6.5v4" />
    </svg>
  );
}
function IconBrush() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c0-2 1.5-3 3-3s3 1 3 3-1.5 2-3 2H4v-2z" />
      <path d="M9.5 16.5L19 7a2.1 2.1 0 00-3-3L6.5 13.5" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-creme/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Página inicial">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
              Entrar
            </Link>
            <a href="#planos" className="btn-coral !px-4 !py-2 text-sm sm:!px-5">
              Ver planos
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-dourado/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-coral-dark">
            Pra quem vende pelo Instagram
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-tinta sm:text-6xl">
            O link da bio que{" "}
            <span className="relative inline-block text-coral">
              também vende
              <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-dourado/50" />
            </span>{" "}
            por você
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
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
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-3 text-muted-foreground">
              Do clique na bio até a conversa no WhatsApp, sem depender de ninguém.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {steps.map((s, i) => (
              <article
                key={s.title}
                className="group rounded-3xl border border-border bg-card p-6 shadow-[0_2px_20px_-12px_rgba(34,18,38,0.35)] transition hover:-translate-y-1 hover:border-coral/40 hover:shadow-[0_16px_40px_-24px_rgba(226,58,87,0.6)] sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-coral/10 text-coral">
                    {s.icon}
                  </span>
                  <span className="font-display text-sm font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-tinta">
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
      <section id="planos" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
              Escolha o seu plano
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Comece simples e evolua quando a loja começar a girar. Cancele quando quiser.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
            {/* Essencial */}
            <div className="rounded-3xl border border-border bg-card p-7 sm:p-8">
              <h3 className="font-display text-2xl font-semibold text-tinta">Essencial</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pra tirar a loja do papel.
              </p>
              <p className="mt-6 font-display text-4xl font-semibold text-tinta">
                R$ 47
                <span className="text-base font-medium text-muted-foreground">/mês</span>
              </p>
              <ul className="mt-7 space-y-3 text-sm text-tinta/85">
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
              <a href="#" className="btn-ghost mt-8 w-full">
                Escolher Essencial
              </a>
            </div>

            {/* Que Vende */}
            <div className="relative rounded-3xl border-2 border-coral bg-ameixa p-7 shadow-[0_24px_60px_-30px_rgba(61,31,77,0.9)] sm:p-8">
              <span className="absolute -top-3 left-7 rounded-full bg-dourado px-3 py-1 text-xs font-bold uppercase tracking-wide text-tinta">
                Mais escolhido
              </span>
              <h3 className="font-display text-2xl font-semibold text-creme">Que Vende</h3>
              <p className="mt-1 text-sm text-creme/70">
                Pra transformar seguidora em cliente.
              </p>
              <p className="mt-6 font-display text-4xl font-semibold text-creme">
                R$ 97
                <span className="text-base font-medium text-creme/70">/mês</span>
              </p>
              <ul className="mt-7 space-y-3 text-sm text-creme/90">
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
              <a href="#" className="btn-dourado mt-8 w-full">
                Escolher Que Vende
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--ameixa),var(--tinta))] px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-creme sm:text-4xl">
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
      <footer className="border-t border-border px-4 py-8 sm:px-6">
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
