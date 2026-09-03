import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
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

  const funnelSteps = stats
    ? [
        { label: "Visitantes", value: stats.funil.visitantes },
        { label: "Começaram o quiz", value: stats.funil.iniciaramQuiz },
        { label: "Viraram cliente (lead)", value: stats.funil.viraramLead },
      ]
    : [];
  const funnelMax = Math.max(1, ...funnelSteps.map((s) => s.value));
  const maxDay = Math.max(1, ...(stats?.serieVisitas ?? []).map((d) => d.count));

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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
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
              <p className="text-sm font-semibold">Visitas por dia</p>
              <div className="flex h-24 items-end gap-1">
                {stats.serieVisitas.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} visitas`}
                    className="flex-1 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                  />
                ))}
              </div>
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
              A IA lê esses mesmos números e sugere o que mudar na loja pra vender mais.
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
