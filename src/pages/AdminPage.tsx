import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  UserPlus,
  Check,
  Copy,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { fetchAlunas, createAluna, type AlunaSummary } from "@/lib/adminApi";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUS_STYLE: Record<AlunaSummary["paymentStatus"], { label: string; bg: string; color: string }> = {
  ativo: { label: "Adimplente", bg: "#e6f7ef", color: "#1a9c5b" },
  inadimplente: { label: "Inadimplente", bg: "#fdecec", color: "#c0392b" },
  cancelado: { label: "Cancelado", bg: "#f1f1f1", color: "#737373" },
  desconhecido: { label: "Sem info de pagamento", bg: "#fff8e6", color: "#a06b00" },
};

function StatusBadge({ status }: { status: AlunaSummary["paymentStatus"] }) {
  const s = STATUS_STYLE[status];
  return (
    <Badge style={{ background: s.bg, color: s.color }} className="whitespace-nowrap">
      {s.label}
    </Badge>
  );
}

function CreateAlunaCard({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    const res = await createAluna(email.trim());
    setSubmitting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setResult(res);
    setEmail("");
    onCreated();
  }

  function copyCreds() {
    if (!result) return;
    navigator.clipboard
      ?.writeText(`Login: ${result.email}\nSenha: ${result.tempPassword}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={18} /> Criar login de uma aluna
        </CardTitle>
        <CardDescription>
          Já que a criação de conta ainda não é automática pelo pagamento, use aqui pra dar acesso
          assim que confirmar que ela pagou (na Hubla ou no status abaixo, se já estiver
          espelhando).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="flex-1 w-full">
            <Label htmlFor="new-aluna-email">E-mail da aluna</Label>
            <Input
              id="new-aluna-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluna@email.com"
            />
          </div>
          <Button type="submit" disabled={submitting} className="sm:mt-6">
            {submitting ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        {error && (
          <div className="mt-3 flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-3 rounded-lg border border-border p-3 text-sm space-y-2" style={{ background: "#f7f7f7" }}>
            <p className="font-medium">Conta criada! Envie esses dados pra aluna (WhatsApp, por exemplo):</p>
            <p>
              Login: <span className="font-mono">{result.email}</span>
              <br />
              Senha provisória: <span className="font-mono">{result.tempPassword}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Ela consegue entrar direto com esses dados em <code>/login</code>. Não tem tela de
              troca de senha ainda — se precisar, dá pra criar depois.
            </p>
            <Button size="sm" variant="outline" onClick={copyCreds}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar login e senha"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { signOut } = useAuth();
  const [alunas, setAlunas] = useState<AlunaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetchAlunas();
    setAlunas(res.alunas);
    setError(res.error);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const total = alunas.length;
  const ativas = alunas.filter((a) => a.paymentStatus === "ativo").length;
  const inadimplentes = alunas.filter((a) => a.paymentStatus === "inadimplente").length;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <span className="hidden sm:flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1" style={{ background: "var(--product-cream)", color: "var(--product-coral-dark)" }}>
              <ShieldCheck size={12} /> Acesso central
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/personalizar" className="text-xs text-muted-foreground underline flex items-center gap-1">
              <ArrowLeft size={13} /> Minha loja
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Todas as alunas</h1>
          <p className="text-sm text-muted-foreground">
            Toda loja criada no app, num lugar só — endereço, status de pagamento e criação de
            login.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total de alunas</p>
              <p className="text-2xl font-semibold">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Adimplentes</p>
              <p className="text-2xl font-semibold" style={{ color: "#1a9c5b" }}>{ativas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Inadimplentes</p>
              <p className="text-2xl font-semibold" style={{ color: "#c0392b" }}>{inadimplentes}</p>
            </CardContent>
          </Card>
        </div>

        <CreateAlunaCard onCreated={load} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lojas criadas</CardTitle>
              <CardDescription>
                Status de pagamento vem da tabela espelhada pelos webhooks da Hubla — enquanto isso
                não estiver configurado lá, tudo aparece como "sem info de pagamento".
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={load} aria-label="Atualizar">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loading && alunas.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}

            {!loading && alunas.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">Ninguém criou conta ainda.</p>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[560px] space-y-2">
                {alunas.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-border p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.storeName || a.email}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.email} · conta criada em {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={a.paymentStatus} />
                      {a.slug ? (
                        <a
                          href={`/loja/${a.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline flex items-center gap-1"
                          style={{ color: "var(--product-coral-dark)" }}
                        >
                          /loja/{a.slug} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">sem loja ainda</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ligar o status de pagamento (Hubla)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Configure na Hubla um webhook (Integrações → Webhooks) apontando pra sua função{" "}
              <code className="text-xs">hubla-webhook</code>, com os eventos de assinatura/fatura
              ativados. Veja o passo a passo completo no README, seção "Checkout com a Hubla".
            </p>
            <p>
              Isso ainda não foi validado com um evento real da Hubla — dispare um teste de lá e
              confira em Supabase → Edge Functions → hubla-webhook → Logs se o e-mail está sendo
              reconhecido certo. Me manda o que aparecer lá que eu ajusto.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
