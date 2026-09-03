import { useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Day = { date: string; label: string; count: number };

const DAYS = 14;

function buildDays(): Day[] {
  const out: Day[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    out.push({
      date,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      count: 0,
    });
  }
  return out;
}

// Quantas pessoas entraram nas lojas por dia (evento "visita" de todas as alunas).
export function DailyVisitsChart() {
  const [days, setDays] = useState<Day[]>(buildDays);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!supabase) {
      setError("Banco não conectado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const { data, error: qError } = await supabase
      .from("store_events")
      .select("created_at")
      .eq("kind", "visita")
      .gte("created_at", since.toISOString())
      .limit(10000);

    if (qError) {
      setError(qError.message);
      setLoading(false);
      return;
    }

    const base = buildDays();
    const index = new Map(base.map((d, i) => [d.date, i]));
    for (const row of data ?? []) {
      const key = new Date(row.created_at as string).toISOString().slice(0, 10);
      const i = index.get(key);
      if (i !== undefined) base[i].count += 1;
    }
    setDays(base);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const hoje = days[days.length - 1]?.count ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 size={16} /> Entradas por dia
          </CardTitle>
          <CardDescription>Visitas nas lojas nos últimos {DAYS} dias.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Atualizar gráfico">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-2xl font-semibold">{hoje}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total no período</p>
                <p className="text-2xl font-semibold">{total}</p>
              </div>
            </div>

            <div className="flex items-end gap-1 h-32">
              {days.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(3, (d.count / max) * 100)}%`,
                      background: d.count ? "var(--product-coral)" : "var(--product-line)",
                    }}
                    title={`${d.label}: ${d.count} entradas`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {days.map((d, i) => (
                <span
                  key={d.date}
                  className="flex-1 text-center text-[9px] text-muted-foreground"
                >
                  {i % 2 === 0 || i === days.length - 1 ? d.label : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
