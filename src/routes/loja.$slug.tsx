import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Music2, ArrowRight, Check, MessageCircle, RefreshCcw } from "lucide-react";

import { getLoja, type Loja, type Produto } from "@/data/lojas";

export const Route = createFileRoute("/loja/$slug")({
  loader: ({ params }) => {
    const loja = getLoja(params.slug);
    if (!loja) throw notFound();
    return { loja };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Loja não encontrada" }, { name: "robots", content: "noindex" }],
      };
    }
    const { nome, frase } = loaderData.loja;
    const titulo = `${nome} — ${frase}`;
    const desc = `Descubra seu estilo no quiz da ${nome} e veja as peças selecionadas pra você. Novidades toda semana.`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: LojaNaoEncontrada,
  component: LojaPage,
});


const perguntas = [
  {
    titulo: "Qual ocasião você quer se vestir pra?",
    opcoes: [
      { emoji: "💼", label: "Trabalho", estilo: "classico" },
      { emoji: "🥂", label: "Festa & eventos", estilo: "romantico" },
      { emoji: "☕", label: "Dia a dia", estilo: "moderno" },
      { emoji: "🌴", label: "Viagem & férias", estilo: "moderno" },
    ],
  },
  {
    titulo: "Qual seu estilo favorito?",
    opcoes: [
      { emoji: "🎀", label: "Romântico e delicado", estilo: "romantico" },
      { emoji: "🖤", label: "Clean e minimalista", estilo: "moderno" },
      { emoji: "👔", label: "Clássico e elegante", estilo: "classico" },
      { emoji: "✨", label: "Ousado e cheio de brilho", estilo: "romantico" },
    ],
  },
  {
    titulo: "Que cor você mais usa?",
    opcoes: [
      { emoji: "🤍", label: "Neutros (branco, bege)", estilo: "moderno" },
      { emoji: "🌸", label: "Tons de rosa", estilo: "romantico" },
      { emoji: "🖤", label: "Preto", estilo: "classico" },
      { emoji: "🌿", label: "Cores terrosas", estilo: "classico" },
    ],
  },
];

const resultados: Record<string, { nome: string; emoji: string; desc: string }> = {
  romantico: {
    nome: "Romântico",
    emoji: "✨",
    desc: "Você ama peças fluidas, estampas florais e detalhes delicados. Vestidos midi, cetim e tons de rosa são a sua assinatura.",
  },
  moderno: {
    nome: "Moderno",
    emoji: "🤍",
    desc: "Seu look é prático e atual: alfaiataria leve, neutros bem combinados e peças que resolvem o dia todo sem esforço.",
  },
  classico: {
    nome: "Clássico",
    emoji: "🖤",
    desc: "Você aposta em atemporais bem cortados: blazer, alfaiataria e uma paleta sóbria que nunca sai de moda.",
  },
};

function LojaNaoEncontrada() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loja não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse link da bio não existe ou foi alterado.
        </p>
        <Link to="/" className="btn-coral mt-6 inline-flex">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function LojaPage() {
  const { loja } = Route.useLoaderData();
  return (
    <div
      style={loja.tema}
      className="min-h-screen bg-[var(--loja-bg)] pb-24 text-[var(--loja-ink)] [font-family:var(--loja-font)]"
    >
      <Nav loja={loja} />
      <Hero loja={loja} />
      <Favoritos loja={loja} />
      <Quiz loja={loja} />
      <Footer loja={loja} />
      <BarraAjuda loja={loja} />
    </div>
  );
}


function Socials({ loja, className = "" }: { loja: Loja; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={loja.instagram}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram da loja"
        className="grid size-9 place-items-center rounded-full border border-[var(--loja-primary)]/40 text-[var(--loja-secondary)] transition-colors hover:bg-[var(--loja-primary)] hover:text-white"
      >
        <Instagram className="size-4" />
      </a>
      <a
        href={loja.tiktok}
        target="_blank"
        rel="noreferrer"
        aria-label="TikTok da loja"
        className="grid size-9 place-items-center rounded-full border border-[var(--loja-primary)]/40 text-[var(--loja-secondary)] transition-colors hover:bg-[var(--loja-primary)] hover:text-white"
      >
        <Music2 className="size-4" />
      </a>
    </div>
  );
}

function Nav({ loja }: { loja: Loja }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--loja-primary)]/15 bg-[var(--loja-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <span className="text-lg font-semibold tracking-tight text-[var(--loja-secondary)]">
          {loja.nome}
        </span>
        <Socials loja={loja} />
      </div>
    </header>
  );
}

function Hero({ loja }: { loja: Loja }) {
  return (
    <section className="relative flex min-h-[86svh] items-end overflow-hidden pt-16">
      <img
        src={loja.hero}
        alt={`Peças em destaque da loja ${loja.nome}`}
        width={1536}
        height={1024}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B1A1E]/85 via-[#2B1A1E]/35 to-transparent" />
      <div className="relative mx-auto w-full max-w-5xl px-5 pb-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--loja-accent)]">
          {loja.heroTag}
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
          {loja.nome}
        </h1>
        <p className="mt-3 max-w-md text-lg text-white/85 sm:text-xl">{loja.frase}</p>
        <a
          href="#quiz"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--loja-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[var(--loja-secondary)]"
        >
          Descobrir meu estilo
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}

function Favoritos({ loja }: { loja: Loja }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--loja-accent)]">
            {loja.selecaoTitulo}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Meus favoritos</h2>
        </div>
        <span className="hidden text-sm text-[var(--loja-ink)]/50 sm:block">arraste para o lado →</span>
      </div>

      <div className="-mx-5 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loja.produtos.map((p: Produto) => (
          <article
            key={p.nome}
            className="group w-[68%] shrink-0 snap-start sm:w-[38%] lg:w-[30%]"
          >
            <div className="relative overflow-hidden rounded-xl bg-white">
              <img
                src={p.img}
                alt={p.nome}
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {p.selo && (
                <span className="absolute left-3 top-3 rounded-full bg-[var(--loja-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {p.selo}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-sm font-medium">{p.nome}</h3>
            <p className="text-sm text-[var(--loja-secondary)]">{p.preco}</p>
            <a
              href={loja.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[var(--loja-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--loja-secondary)] transition-colors hover:bg-[var(--loja-primary)] hover:text-white"
            >
              Comprar
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Quiz ---------- */

function Quiz({ loja }: { loja: Loja }) {
  const [etapa, setEtapa] = useState<"perguntas" | "dados" | "resultado">("perguntas");
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [erro, setErro] = useState("");
  const [lead, setLead] = useState<{ nome: string; whatsapp: string } | null>(null);

  const totalEtapas = perguntas.length + 1;
  const passoAtual = etapa === "perguntas" ? indice + 1 : totalEtapas;
  const progresso = etapa === "resultado" ? 100 : (passoAtual / totalEtapas) * 100;

  function escolher(estilo: string) {
    const novas = [...respostas, estilo];
    setRespostas(novas);
    if (indice + 1 < perguntas.length) setIndice(indice + 1);
    else setEtapa("dados");
  }

  function enviarDados(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || whats.replace(/\D/g, "").length < 10) {
      setErro("Preencha seu nome e um WhatsApp válido com DDD.");
      return;
    }
    setErro("");
    setLead({ nome: nome.trim(), whatsapp: whats.trim() });
    setEtapa("resultado");
  }

  function reiniciar() {
    setEtapa("perguntas");
    setIndice(0);
    setRespostas([]);
    setNome("");
    setWhats("");
    setLead(null);
  }

  const contagem = respostas.reduce<Record<string, number>>((acc, r) => {
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});
  const vencedor = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "romantico";
  const resultado = resultados[vencedor] ?? resultados["romantico"]!;

  const pergunta = perguntas[indice]!;

  return (
    <section id="quiz" className="scroll-mt-20 bg-white/70 py-16">
      <div className="mx-auto max-w-2xl px-5">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--loja-accent)]">
            Quiz de estilo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Descubra seu estilo em 1 minuto
          </h2>
          <p className="mt-2 text-sm text-[var(--loja-ink)]/60">
            3 perguntinhas e eu monto uma seleção só pra você.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--loja-primary)]/20 bg-[var(--loja-bg)] p-5 shadow-[0_18px_50px_-30px_rgba(58,42,46,0.5)] sm:p-8">
          {etapa !== "resultado" && (
            <>
              <div className="flex items-center justify-between text-xs font-medium text-[var(--loja-ink)]/55">
                <span>
                  Etapa {passoAtual} de {totalEtapas}
                </span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--loja-primary)]/15">
                <div
                  className="h-full rounded-full bg-[var(--loja-primary)] transition-[width] duration-500 ease-out"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </>
          )}

          {etapa === "perguntas" && (
            <div key={indice} className="mt-7 animate-in fade-in slide-in-from-right-6 duration-400">
              <h3 className="text-lg font-semibold sm:text-xl">{pergunta.titulo}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {pergunta.opcoes.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => escolher(o.estilo)}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--loja-primary)]/25 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--loja-primary)] hover:shadow-lg hover:shadow-[var(--loja-primary)]/15"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--loja-primary)]/12 text-lg">
                      {o.emoji}
                    </span>
                    <span className="text-sm font-medium">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapa === "dados" && (
            <form
              onSubmit={enviarDados}
              className="mt-7 animate-in fade-in slide-in-from-right-6 duration-400"
            >
              <h3 className="text-lg font-semibold sm:text-xl">Quase lá! Pra onde envio o resultado?</h3>
              <p className="mt-1 text-sm text-[var(--loja-ink)]/60">
                Deixe seu nome e WhatsApp pra ver seu estilo e receber a seleção.
              </p>
              <div className="mt-5 space-y-3">
                <div>
                  <label htmlFor="q-nome" className="text-xs font-medium uppercase tracking-wider text-[var(--loja-ink)]/60">
                    Seu nome
                  </label>
                  <input
                    id="q-nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ana Beatriz"
                    className="mt-1.5 w-full rounded-lg border border-[var(--loja-primary)]/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--loja-primary)] focus:ring-2 focus:ring-[var(--loja-primary)]/25"
                  />
                </div>
                <div>
                  <label htmlFor="q-whats" className="text-xs font-medium uppercase tracking-wider text-[var(--loja-ink)]/60">
                    WhatsApp
                  </label>
                  <input
                    id="q-whats"
                    required
                    inputMode="tel"
                    value={whats}
                    onChange={(e) => setWhats(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1.5 w-full rounded-lg border border-[var(--loja-primary)]/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--loja-primary)] focus:ring-2 focus:ring-[var(--loja-primary)]/25"
                  />
                </div>
              </div>
              {erro && <p className="mt-3 text-sm text-[var(--loja-secondary)]">{erro}</p>}
              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--loja-primary)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--loja-secondary)]"
              >
                Ver meu resultado
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          {etapa === "resultado" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--loja-accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--loja-accent)]">
                <Check className="size-3.5" /> Resultado pronto
              </span>
              <p className="mt-4 text-sm text-[var(--loja-ink)]/60">
                {lead?.nome}, seu estilo é
              </p>
              <h3 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--loja-secondary)] sm:text-4xl">
                {resultado.nome} {resultado.emoji}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--loja-ink)]/75">
                {resultado.desc}
              </p>
              <a
                href={loja.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--loja-primary)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--loja-secondary)]"
              >
                Ver produtos pra mim
                <ArrowRight className="size-4" />
              </a>
              <button
                type="button"
                onClick={reiniciar}
                className="mt-3 block w-full text-xs font-medium text-[var(--loja-ink)]/50 underline-offset-4 hover:underline"
              >
                Refazer o quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BarraAjuda({ loja }: { loja: Loja }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--loja-primary)]/20 bg-[var(--loja-bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-2 px-4 py-3">
        <a
          href={loja.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--loja-primary)] px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-[var(--loja-secondary)] sm:text-sm"
        >
          <MessageCircle className="size-4" />
          Dúvidas? Fale com a gente
        </a>
        <a
          href={loja.trocas}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--loja-primary)] px-3 py-3 text-xs font-semibold text-[var(--loja-secondary)] transition-colors hover:bg-[var(--loja-primary)]/10 sm:text-sm"
        >
          <RefreshCcw className="size-4" />
          Trocas e devoluções
        </a>
      </div>
    </div>
  );
}

function Footer({ loja }: { loja: Loja }) {
  return (
    <footer className="border-t border-[var(--loja-primary)]/15 px-5 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <span className="text-lg font-semibold tracking-tight text-[var(--loja-secondary)]">
          {loja.nome}
        </span>
        <Socials loja={loja} />

        <p className="text-xs text-[var(--loja-ink)]/50">
          © {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
