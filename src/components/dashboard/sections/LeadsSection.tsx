import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Users, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { fetchLeads, setLeadContacted, type Lead } from "@/lib/leads";
import { buildWhatsAppLink } from "@/lib/utils";

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

export function LeadsSection() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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
      // reverte se a escrita falhar
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, contacted: !next } : l)));
    }
  }

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
        {loading && leads.length === 0 && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}

        {!loading && leads.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ainda não chegou nenhum lead. Assim que alguém terminar o quiz na sua loja, aparece
            aqui.
          </p>
        )}

        <div className="space-y-3">
          {leads.map((lead) => {
            const whatsappHref = buildWhatsAppLink(
              lead.whatsapp,
              `Oi ${lead.name.split(" ")[0]}! Vi que você respondeu nosso quiz de estilo 💕`
            );
            return (
              <div
                key={lead.id}
                className="rounded-lg border border-border p-4"
                style={{ opacity: lead.contacted ? 0.65 : 1 }}
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

                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-block mt-3">
                  <Button size="sm">
                    <MessageCircle size={14} /> Entrar em contato
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
