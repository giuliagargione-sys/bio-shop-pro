import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  Eye,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { ProLock } from "@/components/dashboard/ProLock";
import { usePlan } from "@/hooks/usePlan";

interface Stats {
  periodo: string;
  visitas: number;
  visitantesUnicos: number;
  cliquesTotal: number;
  taxaClique: number;
  funil: {
    visitantes: number;
    iniciaramQuiz: number;
    viraramLead: number;
    conversao: number;
  };
  serieVisitas: { date: string; count: number }[];
  heatmap?: number[][];
  cliquesProduto: number;
  cliquesWhats: number;
  cliquesBotao: number;
  leads: number;
  topProducts: [string, number][];
  topButtons: [string, number][];
}

const PERIODS = [
  { label: "Hoje", days: 1 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

export function InsightsSection() {
  const [days, setDays] = useState(30);
  const [statsLoading, setStatsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isPro, loading: planLoading } = usePlan();

  const loadStats = useCallback(async (period: number) => {
    if (!isSupabaseConfigured) {
      setError("Backend não conectado.");
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("ai-insights", {
      body: { days: period, statsOnly: true },
    });
    if (fnError) setError("Não consegui carregar seus números agora. Tente de novo em instantes.");
    else setStats((data?.stats as Stats) ?? null);
    setStatsLoading(false);
  }, []);

  async function runAi() {
    setAiLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("ai-insights", {
      body: { days },
    });
    if (fnError) {
      setError("Não consegui gerar a análise agora. Tente de novo em instantes.");
    } else {
      setStats((data?.stats as Stats) ?? null);
      setInsights((data?.insights as string) ?? null);
      if (data?.error) setError(data.error as string);
    }
    setAiLoading(false);
  }

  useEffect(() => {
    void loadStats(days);
  }, [days, loadStats]);

  const cards = stats
    ? [
        { icon: Users, label: "Visitantes únicos", value: stats.visitantesUnicos },
        { icon: Eye, label: "Visualizações", value: stats.visitas },
        { icon: MousePointerClick, label: "Cliques", value: stats.cliquesTotal },
        { icon: TrendingUp, label: "Taxa de clique", value: `${stats.taxaClique}%` },
      ]
    : [];

  const pct = (n: number, base: number) =>
    base > 0 ? Math.round((n / base) * 100) : 0;

  const baseVisitantes = stats?.funil.visitantes ?? 0;
  const funnelSteps = stats
    ? [
        { label: "Entraram no seu link", value: baseVisitantes, percent: 100 },
        ...(stats.topButtons ?? []).map(([label, count]) => ({
          label: `Clicaram em “${label}”`,
          value: count,
          percent: pct(count, baseVisitantes),
        })),
        {
          label: "Participaram do quiz",
          value: stats.funil.iniciaramQuiz,
          percent: pct(stats.funil.iniciaramQuiz, baseVisitantes),
        },
        {
          label: "Leads capturados",
          value: stats.funil.viraramLead,
          percent: pct(stats.funil.viraramLead, baseVisitantes),
        },
      ]
    : [];
  const funnelMax = Math.max(1, ...funnelSteps.map((s) => s.value));
  const maxDay = Math.max(1, ...(stats?.serieVisitas ?? []).map((d) => d.count));
  const heatmap = stats?.heatmap;
  const heatMax = Math.max(1, ...(heatmap ?? []).flat());
  const hasHeat = !!heatmap && heatmap.flat().some((v) => v > 0);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={18} />
                Analytics da sua loja
              </CardTitle>
              <CardDescription>
                Visitantes, cliques e conversão do seu link {stats ? `(${stats.periodo})` : ""}.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadStats(days)}
              disabled={statsLoading}
            >
              <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
              Atualizar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.days}
                size="sm"
                variant={days === p.days ? "primary" : "outline"}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
                <c.icon size={16} className="mb-2 text-primary" />
                <p className="text-2xl font-semibold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
            {!stats && statsLoading && (
              <p className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground lg:col-span-4">
                <Loader2 size={16} className="animate-spin" />
                Carregando seus números...
              </p>
            )}
            {!stats && !statsLoading && (
              <p className="col-span-2 text-sm text-muted-foreground lg:col-span-4">
                Sem dados ainda. Compartilhe seu link e os números começam a aparecer aqui.
              </p>
            )}
          </div>

          {stats && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Funil da sua loja</p>
              {funnelSteps.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">
                      {s.value} <span className="font-normal text-muted-foreground">({s.percent}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(2, (s.value / funnelMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Conversão final (visitante para cliente):{" "}
                <span className="font-semibold text-foreground">{stats.funil.conversao}%</span>
              </p>
            </div>
          )}

          {stats && stats.serieVisitas.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <p className="text-sm font-semibold">Visitas por dia</p>
                <p className="text-xs text-muted-foreground">
                  Total no período:{" "}
                  <span className="font-semibold text-foreground">
                    {stats.serieVisitas.reduce((a, d) => a + d.count, 0)}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="flex gap-2">
                  <div className="flex w-6 flex-col justify-between py-[2px] text-right text-[9px] text-muted-foreground">
                    <span>{maxDay}</span>
                    <span>{Math.round(maxDay / 2)}</span>
                    <span>0</span>
                  </div>
                  <div className="relative h-28 flex-1">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="border-t border-dashed border-border/70" />
                      ))}
                    </div>
                    <div className="relative flex h-full items-end gap-1">
                      {stats.serieVisitas.map((d) => (
                        <div
                          key={d.date}
                          title={`${d.date}: ${d.count} visitas`}
                          className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                        >
                          <span className="text-[9px] font-semibold text-muted-foreground">
                            {d.count > 0 ? d.count : ""}
                          </span>
                          <div
                            className={`w-full rounded-t ${d.count > 0 ? "bg-primary" : "bg-border"}`}
                            style={{
                              height: d.count > 0 ? `${Math.max(6, (d.count / maxDay) * 88)}%` : "3px",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex gap-1 pl-8">
                  {stats.serieVisitas.map((d, i) => (
                    <span
                      key={d.date}
                      className="flex-1 truncate text-center text-[9px] text-muted-foreground"
                    >
                      {i === 0 ||
                      i === stats.serieVisitas.length - 1 ||
                      i % Math.ceil(stats.serieVisitas.length / 5) === 0
                        ? d.date.slice(5).split("-").reverse().join("/")
                        : ""}
                    </span>
                  ))}
                </div>
              </div>
              {stats.serieVisitas.every((d) => d.count === 0) && (
                <p className="text-xs text-muted-foreground">
                  Ainda sem visitas nesse período — compartilhe seu link para começar a medir.
                </p>
              )}
            </div>
          )}


          {hasHeat && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock size={16} />
                Quando seu público acessa
              </p>
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="mb-1 flex gap-1 pl-9">
                    {Array.from({ length: 24 }, (_, h) => (
                      <span
                        key={h}
                        className="flex-1 text-center text-[9px] text-muted-foreground"
                      >
                        {h % 3 === 0 ? h : ""}
                      </span>
                    ))}
                  </div>
                  {weekDays.map((day, d) => (
                    <div key={day} className="mb-1 flex items-center gap-1">
                      <span className="w-8 text-[10px] font-medium text-muted-foreground">
                        {day}
                      </span>
                      {Array.from({ length: 24 }, (_, h) => {
                        const value = heatmap?.[d]?.[h] ?? 0;
                        const intensity = value ? 0.15 + (value / heatMax) * 0.85 : 0;
                        return (
                          <span
                            key={h}
                            title={`${day} ${String(h).padStart(2, "0")}h: ${value} visitas`}
                            className="h-4 flex-1 rounded-sm bg-muted"
                            style={
                              value
                                ? {
                                    backgroundColor: "var(--brand-primary)",
                                    opacity: intensity,
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Quanto mais escuro, mais acessos naquele horário (horário de Brasília). Use pra
                postar e lançar novidades na melhor hora.
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {stats && stats.topProducts.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Peças mais clicadas</p>
                <ul className="space-y-1 text-sm">
                  {stats.topProducts.map(([name, count]) => (
                    <li key={name} className="flex justify-between border-b border-border py-1">
                      <span className="truncate pr-2">{name}</span>
                      <span className="text-muted-foreground">{count} cliques</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stats && stats.topButtons.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Botões mais clicados</p>
                <ul className="space-y-1 text-sm">
                  {stats.topButtons.map(([name, count]) => (
                    <li key={name} className="flex justify-between border-b border-border py-1">
                      <span className="truncate pr-2">{name}</span>
                      <span className="text-muted-foreground">{count} cliques</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ProLock
        locked={!isPro && !planLoading}
        title="Insights com IA é do plano PRO"
        description="No PRO a IA lê seus cliques e leads e te diz o que ajustar pra vender mais."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} />
              Insights com IA
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                PRO
              </span>
            </CardTitle>
            <CardDescription>
              Sugestões com base nos seus dados para melhorar resultado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiLoading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Analisando sua loja...
              </p>
            )}
            {!aiLoading && insights && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {insights.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  const isHeading =
                    trimmed.length > 0 &&
                    trimmed.length <= 70 &&
                    !/^\d+[.)]/.test(trimmed) &&
                    !/[.!?]$/.test(trimmed);
                  if (isHeading) {
                    return (
                      <strong key={i} className="mb-1 mt-4 block font-bold text-foreground">
                        {trimmed}
                      </strong>
                    );
                  }
                  return (
                    <span key={i} className="block">
                      {line}
                    </span>
                  );
                })}
              </div>
            )}
            {error && <p className="text-sm text-muted-foreground">{error}</p>}
            <Button onClick={() => void runAi()} disabled={aiLoading} className="w-full sm:w-auto">
              {aiLoading ? "Analisando..." : "Gerar nova análise"}
            </Button>
          </CardContent>
        </Card>
      </ProLock>
    </div>
  );
}
