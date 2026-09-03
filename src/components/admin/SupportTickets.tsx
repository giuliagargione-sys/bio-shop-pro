import { useEffect, useState } from "react";
import { LifeBuoy, RefreshCw, Send, Check, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchSupportTickets,
  replySupportTicket,
  closeSupportTicket,
  type AdminSupportTicket,
} from "@/lib/adminApi";

function formatWhen(iso: string) {
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

function PlanTag({ isPro, plan }: { isPro: boolean; plan: string | null }) {
  if (isPro) {
    return (
      <Badge
        className="whitespace-nowrap"
        style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}
      >
        PRO
      </Badge>
    );
  }
  return (
    <Badge className="whitespace-nowrap text-muted-foreground bg-transparent border border-border">
      {plan ? plan : "Essencial"}
    </Badge>
  );
}

function TicketCard({ ticket, onChanged }: { ticket: AdminSupportTicket; onChanged: () => void }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const body = reply.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    const res = await replySupportTicket(ticket.id, body);
    setSending(false);
    if (!res.ok) {
      setError(res.error ?? "Não consegui enviar agora.");
      return;
    }
    setReply("");
    onChanged();
  }

  async function close() {
    await closeSupportTicket(ticket.id);
    onChanged();
  }

  return (
    <div className="rounded-[var(--radius)] border border-border p-3 space-y-3 bg-white">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-sm">{ticket.storeName || ticket.email}</span>
        <PlanTag isPro={ticket.isPro} plan={ticket.plan} />
        {ticket.awaitingAdmin && (
          <Badge style={{ background: "#fff8e6", color: "#a06b00" }}>Aguardando resposta</Badge>
        )}
        {ticket.status === "fechado" && <Badge className="bg-transparent border border-border text-muted-foreground">Fechado</Badge>}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {formatWhen(ticket.lastMessageAt)}
        </span>
      </div>
      {ticket.storeName && (
        <p className="text-xs text-muted-foreground -mt-2">{ticket.email}</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={m.sender === "admin" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap"
              style={
                m.sender === "admin"
                  ? { background: "var(--product-coral)", color: "var(--product-cream)" }
                  : { background: "var(--muted, #f3f3f3)" }
              }
            >
              {m.body}
              <span className="block text-[10px] opacity-70 mt-1">{formatWhen(m.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== "fechado" && (
        <div className="space-y-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escreva sua resposta pra aluna..."
            rows={3}
          />
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={send} disabled={sending || !reply.trim()}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Responder
            </Button>
            <Button size="sm" variant="outline" onClick={close}>
              <Check size={14} /> Marcar como resolvido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pendentes" | "resolvidos">("pendentes");

  async function load() {
    setLoading(true);
    const res = await fetchSupportTickets();
    setTickets(res.tickets);
    setError(res.error);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const pendentes = tickets.filter((t) => t.status !== "fechado");
  const resolvidos = tickets.filter((t) => t.status === "fechado");
  const novas = pendentes.filter((t) => t.awaitingAdmin).length;
  const visibleTickets = tab === "pendentes" ? pendentes : resolvidos;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy size={18} /> Solicitações de suporte
            {novas > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "var(--product-coral)", color: "var(--product-cream)" }}
              >
                {novas} novas
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Dúvidas que a IA não conseguiu resolver. Responda aqui — a aluna vê a resposta no chat de
            ajuda da dashboard dela.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : undefined} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setTab("pendentes")}
            className={`text-sm font-medium pb-1 px-2 border-b-2 transition-colors ${
              tab === "pendentes"
                ? "border-[var(--product-coral)] text-[var(--product-coral)]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendências ({pendentes.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("resolvidos")}
            className={`text-sm font-medium pb-1 px-2 border-b-2 transition-colors ${
              tab === "resolvidos"
                ? "border-[var(--product-coral)] text-[var(--product-coral)]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Resolvidos ({resolvidos.length})
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        {!loading && visibleTickets.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            {tab === "pendentes"
              ? "Nenhuma pendência de suporte no momento."
              : "Nenhum chamado resolvido ainda."}
          </p>
        )}
        {visibleTickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onChanged={load} />
        ))}
      </CardContent>
    </Card>
  );
}
