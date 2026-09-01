// Edge Function: responde o chat de ajuda que aparece dentro de
// /personalizar (botão flutuante "Ajuda"), usando a API da Anthropic
// (Claude). Fica numa Edge Function pra a chave da API nunca aparecer no
// código do front (senão qualquer pessoa que abrir o site consegue roubar
// sua chave e usar por sua conta).
//
// Deploy:
//   supabase functions deploy ai-help
//
// Segredo necessário (Supabase → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY → pegue em https://console.anthropic.com (Settings →
//   API Keys). Sem isso configurado, o chat mostra uma mensagem avisando
//   que a IA ainda não foi ligada, em vez de quebrar.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a assistente de ajuda dentro da dashboard de personalização do
"Link Na Bio Que Vende!" — um app onde alunas configuram a própria loja
(link na bio): marca (nome/logo), cores e fonte, capa, produtos em
destaque, quiz de estilo, leads capturados, contato (WhatsApp/redes),
botões de dúvidas/trocas e rodapé.

Seu único trabalho é ajudar a aluna a usar e personalizar essa dashboard:
onde encontrar cada campo, o que cada seção faz, sugestões de texto/cores/
produtos, como resolver dúvidas comuns (ex: "como troco o link do
WhatsApp", "como coloco meus produtos", "como funciona o quiz").

Responda sempre em português do Brasil, em tom simpático e direto, em
frases curtas. Se a pergunta não tiver relação com personalizar a loja
(ex: pedidos de código, assuntos fora do app, informações pessoais),
explique gentilmente que você só ajuda com a personalização da loja aqui
dentro.`;

// Troque pelo modelo mais atual disponível na sua conta Anthropic, se
// quiser — esse é um modelo rápido e barato, bom o suficiente pra um chat
// de ajuda como esse.
const MODEL = "claude-3-5-haiku-20241022";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  try {
    // Só quem está logada (qualquer aluna) pode usar o chat.
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData } = await callerClient.auth.getUser();
    if (!callerData.user) return json({ error: "Não autenticado." }, 401);

    if (!ANTHROPIC_API_KEY) {
      return json({
        reply:
          "A assistente de IA ainda não foi configurada neste projeto. Peça pra quem administra o app adicionar a chave ANTHROPIC_API_KEY nas Secrets das Edge Functions do Supabase.",
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "Mande pelo menos uma mensagem." }, 400);
    }

    // Só repassa role/content pra API da Anthropic (limita histórico pra
    // não deixar a chamada gigante nem cara).
    const cleanMessages = messages
      .slice(-12)
      .filter((m: unknown) => {
        const msg = m as { role?: string; content?: string };
        return (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string";
      })
      .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: cleanMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return json({
        reply: "Não consegui falar com a IA agora. Tente de novo em instantes.",
      });
    }

    const data = await response.json();
    const reply =
      data?.content?.find((c: { type: string }) => c.type === "text")?.text ??
      "Desculpa, não consegui responder agora.";

    return json({ reply });
  } catch (err) {
    console.error(err);
    return json({ reply: "Algo deu errado por aqui. Tente de novo em instantes." });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
