import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface Stats {
  visitas: number;
  cliquesProduto: number;
  cliquesWhats: number;
  cliquesBotao: number;
  leads: number;
  taxaCliqueProduto: number;
  taxaWhatsapp: number;
  topProducts: [string, number][];
}

export function InsightsSection() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!isSupabaseConfigured) {
      setError("Backend não conectado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("ai-insights", { body: {} });
    if (fnError) {
      setError("Não consegui gerar a análise agora. Tente de novo em instantes.");
    } else {
      setStats((data?.stats as Stats) ?? null);
      setInsights((data?.insights as string) ?? null);
      if (data?.error) setError(data.error as string);
    }
    setLoading(false);
  }

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = stats
    ? [
        { label: "Visitas na loja", value: stats.visitas },
        { label: "Cliques em peças", value: stats.cliquesProduto },
        { label: "Cliques no WhatsApp", value: stats.cliquesWhats },
        { label: "Leads do quiz", value: stats.leads },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={18} />
            Seus números (últimos 30 dias)
          </CardTitle>
          <CardDescription>
            Contamos as visitas e cada clique em peça, botão e WhatsApp da sua loja pública.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-[var(--radius)] border border-border p-3">
                <p className="text-2xl font-semibold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
            {!stats && !loading && (
              <p className="text-sm text-muted-foreground col-span-2">Sem dados ainda.</p>
            )}
          </div>

          {stats && stats.topProducts.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Peças mais clicadas</p>
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
            A IA lê seus cliques e leads e sugere o que mudar na loja pra vender mais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              Analisando sua loja...
            </p>
          )}
          {!loading && insights && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {insights.split("\n").map((line, i) => {
                const trimmed = line.trim();
                const isHeading =
                  trimmed.length > 0 &&
                  trimmed.length <= 70 &&
                  !/^\d+[\.)]/.test(trimmed) &&
                  !/[.!?]$/.test(trimmed);
                if (isHeading) {
                  return (
                    <strong key={i} className="block mt-4 mb-1 font-bold text-foreground">
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
          {!loading && error && <p className="text-sm text-muted-foreground">{error}</p>}
          <Button onClick={() => void run()} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Analisando..." : "Gerar nova análise"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
