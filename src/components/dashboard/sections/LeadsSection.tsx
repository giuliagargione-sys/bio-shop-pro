import { useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Users, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { fetchLeads, setLeadContacted, type Lead } from "@/lib/leads";
import { buildWhatsAppLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type GroupKey = "hoje" | "ontem" | "7dias" | "30dias" | "antigos";

const GROUP_LABELS: Record<GroupKey, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  "7dias": "Últimos 7 dias",
  "30dias": "Últimos 30 dias",
  antigos: "Mais antigos",
};

const GROUP_ORDER: GroupKey[] = ["hoje", "ontem", "7dias", "30dias", "antigos"];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function groupOf(iso: string): GroupKey {
  const created = new Date(iso);
  const today = startOfDay(new Date());
  const diffDays = Math.floor((today.getTime() - startOfDay(created).getTime()) / 86400000);
  if (diffDays <= 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays <= 7) return "7dias";
  if (diffDays <= 30) return "30dias";
  return "antigos";
}

export function LeadsSection() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"abertos" | "contatados">("abertos");

  async function load() {
    setLoading(true);
    const data = await fetchLeads();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleContacted(lead: Lead) {
    const next = !lead.contacted;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, contacted: next } : l)));
    const ok = await setLeadContacted(lead.id, next);
    if (!ok) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, contacted: !next } : l)));
    }
  }

  const abertos = useMemo(() => leads.filter((l) => !l.contacted), [leads]);
  const contatados = useMemo(() => leads.filter((l) => l.contacted), [leads]);
  const visible = tab === "abertos" ? abertos : contatados;

  const groups = useMemo(() => {
    const map = new Map<GroupKey, Lead[]>();
    for (const lead of visible) {
      const key = groupOf(lead.created_at);
      const arr = map.get(key) ?? [];
      arr.push(lead);
      map.set(key, arr);
    }
    return GROUP_ORDER.filter((k) => (map.get(k)?.length ?? 0) > 0).map((k) => ({
      key: k,
      label: GROUP_LABELS[k],
      items: (map.get(k) ?? []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));
  }, [visible]);

  if (!isSupabaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>Quem respondeu o quiz e deixou o contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <AlertCircle size={18} className="shrink-0" />
            <span>
              Conecte o Supabase a este projeto no Lovable (Configurações → Supabase) e rode o SQL
              de <code className="text-xs">supabase/migrations/0001_init.sql</code> pra começar a
              receber leads aqui.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} /> Leads ({leads.length})
          </CardTitle>
          <CardDescription>Quem respondeu o quiz e deixou o contato.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Atualizar">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 inline-flex rounded-lg border border-border p-1">
          {(
            [
              { key: "abertos" as const, label: `Abertos (${abertos.length})` },
              { key: "contatados" as const, label: `Contatados (${contatados.length})` },
            ]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm min-h-[36px] transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && leads.length === 0 && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}

        {!loading && leads.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ainda não chegou nenhum lead. Assim que alguém terminar o quiz na sua loja, aparece
            aqui.
          </p>
        )}

        {!loading && leads.length > 0 && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {tab === "abertos"
              ? "Nenhum lead em aberto por aqui. Tudo contatado!"
              : "Nenhum lead marcado como contatado ainda."}
          </p>
        )}

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{group.label}</h4>
                <span className="text-xs text-muted-foreground">({group.items.length})</span>
              </div>

              {group.items.map((lead) => {
                const whatsappHref = buildWhatsAppLink(
                  lead.whatsapp,
                  `Oi ${lead.name.split(" ")[0]}! Vi que você respondeu nosso quiz de estilo 💕`
                );
                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-border p-4"
                    style={{ opacity: lead.contacted ? 0.75 : 1 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.whatsapp} · {formatDate(lead.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleContacted(lead)}
                        className="flex items-center gap-1 text-xs shrink-0 rounded-full border border-border px-2 py-1 hover:bg-muted"
                      >
                        {lead.contacted && <Check size={12} />}
                        {lead.contacted ? "Contatada" : "Marcar como contatada"}
                      </button>
                    </div>

                    {Object.keys(lead.answers ?? {}).length > 0 && (
                      <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                        {Object.entries(lead.answers).map(([question, answer]) => (
                          <p key={question}>
                            <span className="font-medium">{question}</span> {answer}
                          </p>
                        ))}
                      </div>
                    )}

                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3"
                    >
                      <Button size="sm">
                        <MessageCircle size={14} /> Entrar em contato
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
