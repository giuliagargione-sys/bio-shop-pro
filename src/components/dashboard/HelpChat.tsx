import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircleQuestion, X, Send, Loader2, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { askHelpAssistant, type ChatMessage } from "@/lib/aiHelp";
import { sendSupportRequest, fetchMySupportMessages } from "@/lib/support";

type Bubble = ChatMessage & { support?: boolean };

const GREETING: Bubble = {
  role: "assistant",
  content:
    "Oi! Posso ajudar a personalizar sua loja — cores, produtos, quiz, botões de dúvidas/trocas, o que precisar. O que você quer fazer?",
};

// A IA marca a resposta com isso quando percebe que não consegue resolver.
const SUPPORT_MARK = "[[SUPORTE_HUMANO]]";

// Rede de segurança: se a IA esquecer o marcador mas claramente não souber
// responder, também oferecemos o suporte humano.
const FALLBACK_PATTERNS = [
  "não consigo ajudar",
  "nao consigo ajudar",
  "não sei responder",
  "nao sei responder",
  "não tenho essa informação",
  "nao tenho essa informacao",
  "fora do meu alcance",
];

function needsHuman(reply: string) {
  if (reply.includes(SUPPORT_MARK)) return true;
  const low = reply.toLowerCase();
  return FALLBACK_PATTERNS.some((p) => low.includes(p));
}

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerSupport, setOfferSupport] = useState(false);
  const [supportMode, setSupportMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadedHistory = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, offerSupport]);

  // Ao abrir, traz o histórico do suporte humano (inclusive respostas nossas).
  useEffect(() => {
    if (!open || loadedHistory.current) return;
    loadedHistory.current = true;
    void (async () => {
      const history = await fetchMySupportMessages();
      if (history.length === 0) return;
      setMessages((prev) => [
        ...prev,
        ...history.map<Bubble>((m) => ({
          role: m.sender === "admin" ? "assistant" : "user",
          content: m.sender === "admin" ? `Suporte: ${m.body}` : m.body,
          support: true,
        })),
      ]);
    })();
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    if (supportMode) {
      setMessages((prev) => [...prev, { role: "user", content: text, support: true }]);
      const res = await sendSupportRequest(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          support: true,
          content: res.ok
            ? "Mensagem enviada! Nosso time recebeu e vai te responder por aqui em breve."
            : res.error ?? "Não consegui enviar agora. Tente de novo em instantes.",
        },
      ]);
      setSupportMode(false);
      setLoading(false);
      return;
    }

    const next: Bubble[] = [...messages, { role: "user", content: text }];
    setMessages(next);

    const reply = await askHelpAssistant(
      next.filter((m) => !m.support).map(({ role, content }) => ({ role, content }))
    );
    const clean = reply.replaceAll(SUPPORT_MARK, "").trim();
    setMessages((prev) => [...prev, { role: "assistant", content: clean }]);
    if (needsHuman(reply)) setOfferSupport(true);
    setLoading(false);
  }

  function acceptSupport() {
    setOfferSupport(false);
    setSupportMode(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Sim, quero suporte humano." },
      {
        role: "assistant",
        support: true,
        content: "Envie sua mensagem que retornaremos em breve.",
      },
    ]);
  }

  function declineSupport() {
    setOfferSupport(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Não, obrigada." },
      { role: "assistant", content: "Sem problema! Me conta o que você quer ajustar na loja." },
    ]);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-40 bottom-4 right-4 h-12 w-12 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ background: "var(--product-coral)" }}
        aria-label="Ajuda"
      >
        {open ? <X size={20} /> : <MessageCircleQuestion size={22} />}
      </button>

      {open && (
        <div className="fixed z-40 bottom-20 right-4 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          <div
            className="px-4 py-3 text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--product-plum), var(--product-ink))" }}
          >
            <MessageCircleQuestion size={18} />
            <div>
              <p className="text-sm font-semibold leading-tight">Ajuda pra personalizar</p>
              <p className="text-[11px] opacity-75 leading-tight">
                {supportMode ? "Suporte humano" : "Assistente de IA"}
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                    m.role === "user" ? "text-white" : "bg-muted text-foreground"
                  )}
                  style={m.role === "user" ? { background: "var(--product-coral)" } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {offerSupport && !loading && (
              <div className="rounded-xl border border-border p-3 space-y-2">
                <p className="text-sm flex items-start gap-2">
                  <LifeBuoy size={15} className="mt-0.5 shrink-0" />
                  Deseja solicitar suporte humano?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptSupport}>
                    Sim
                  </Button>
                  <Button size="sm" variant="outline" onClick={declineSupport}>
                    Não
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-1">
                  <Loader2 size={13} className="animate-spin" />
                  {supportMode ? "enviando..." : "digitando..."}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-2 border-t border-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                supportMode ? "Escreva sua mensagem pro suporte..." : "Pergunte algo sobre sua loja..."
              }
              className="flex-1 h-9 rounded-full border border-border px-3 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Enviar">
              <Send size={15} />
            </Button>
          </form>

          {!supportMode && !offerSupport && (
            <button
              onClick={acceptSupport}
              className="text-[11px] text-muted-foreground underline pb-2 -mt-1"
            >
              Falar com suporte humano
            </button>
          )}
        </div>
      )}
    </>
  );
}
