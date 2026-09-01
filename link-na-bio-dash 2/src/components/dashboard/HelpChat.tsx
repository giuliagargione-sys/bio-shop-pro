import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircleQuestion, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { askHelpAssistant, type ChatMessage } from "@/lib/aiHelp";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Oi! Posso ajudar a personalizar sua loja — cores, produtos, quiz, botões de dúvidas/trocas, o que precisar. O que você quer fazer?",
};

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setLoading(true);

    const reply = await askHelpAssistant(next);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
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
              <p className="text-[11px] opacity-75 leading-tight">Assistente de IA</p>
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
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-1">
                  <Loader2 size={13} className="animate-spin" /> digitando...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-2 border-t border-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo sobre sua loja..."
              className="flex-1 h-9 rounded-full border border-border px-3 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Enviar">
              <Send size={15} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
