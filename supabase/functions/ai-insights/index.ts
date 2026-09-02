// Edge Function: gera os "Insights com IA" do plano PRO.
// Lê os cliques (store_events) e os leads da loja da própria aluna logada,
// resume os números e pede sugestões práticas de melhoria pra IA do Lovable.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const client = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await client.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Não autenticado." }, 401);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [{ data: events }, { data: leads }, { data: store }] = await Promise.all([
      client
        .from("store_events")
        .select("kind,label,created_at")
        .eq("store_user_id", user.id)
        .gte("created_at", since)
        .limit(5000),
      client.from("leads").select("id,answers,created_at").eq("store_user_id", user.id).limit(1000),
      client.from("store_config").select("data,slug").eq("user_id", user.id).maybeSingle(),
    ]);

    const rows = events ?? [];
    const byKind: Record<string, number> = {};
    const byProduct: Record<string, number> = {};
    const byButton: Record<string, number> = {};
    for (const e of rows) {
      byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
      if (e.kind === "produto" && e.label) byProduct[e.label] = (byProduct[e.label] ?? 0) + 1;
      if ((e.kind === "botao" || e.kind === "whatsapp") && e.label)
        byButton[e.label] = (byButton[e.label] ?? 0) + 1;
    }
    const topProducts = Object.entries(byProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const topButtons = Object.entries(byButton)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const visitas = byKind["visita"] ?? 0;
    const cliquesProduto = byKind["produto"] ?? 0;
    const cliquesWhats = byKind["whatsapp"] ?? 0;
    const cliquesBotao = byKind["botao"] ?? 0;
    const totalLeads = (leads ?? []).length;

    const stats = {
      periodo: "últimos 30 dias",
      visitas,
      cliquesProduto,
      cliquesWhats,
      cliquesBotao,
      leads: totalLeads,
      taxaCliqueProduto: visitas ? Math.round((cliquesProduto / visitas) * 100) : 0,
      taxaWhatsapp: visitas ? Math.round((cliquesWhats / visitas) * 100) : 0,
      topProducts,
      topButtons,
    };

    if (!LOVABLE_API_KEY) {
      return json({ stats, insights: null, error: "IA não configurada neste projeto." });
    }

    const config = (store?.data ?? {}) as Record<string, unknown>;
    const resumoLoja = JSON.stringify({
      nome: (config.brand as Record<string, string> | undefined)?.storeName,
      capa: config.hero,
      quizAtivo: (config.quiz as Record<string, unknown> | undefined)?.enabled,
      qtdProdutos: Array.isArray(config.products) ? config.products.length : 0,
      ordemSecoes: (config.layout as Record<string, unknown> | undefined)?.blocks,
    }).slice(0, 3000);

    const prompt = `Dados da loja (link na bio de uma lojista de moda):
NÚMEROS: ${JSON.stringify(stats)}
CONFIGURAÇÃO: ${resumoLoja}

Analise principalmente as PEÇAS MAIS CLICADAS (topProducts) e os BOTÕES MAIS CLICADOS (topButtons).
Escreva em português do Brasil, tom simpático e direto, falando com a lojista.

Estrutura da resposta, exatamente com estes títulos em linhas separadas:
O que os números dizem
2 a 3 frases interpretando visitas, cliques em peças, cliques nos botões e leads.

Peças e botões que chamam mais atenção
Liste as peças e os botões mais clicados com o número de cliques e diga o que isso revela sobre o interesse das clientes.

Oportunidades
2 a 3 oportunidades concretas que os cliques revelam (ex: peça com muito clique e pouca conversa no WhatsApp, botão ignorado que precisa de outro texto, seção na ordem errada).

3 ações pra vender mais essa semana
Lista numerada (1. 2. 3.), cada item uma ação concreta e específica citando o nome real da peça ou do botão.

Ideias de conteúdo
2 ou 3 ideias de post ou story usando a peça que está chamando mais atenção (ex: provador, look do dia, bastidores, enquete), cada uma com uma frase de chamada pronta pra usar.

REGRAS DE FORMATO OBRIGATÓRIAS:
- NUNCA use asteriscos, markdown, negrito, hashtags ou qualquer símbolo de formatação. Só texto puro.
- Não use travessão no começo das linhas; nas listas use "1." "2." "3.".
- Se os dados forem poucos, diga isso e foque em como gerar os primeiros cliques. Não invente números nem nomes de peças que não estejam nos dados.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Você é consultora de vendas online para lojistas de moda que vendem pelo link da bio do Instagram. Seja prática, específica e curta. Responda sempre em texto puro, sem markdown e sem nenhum asterisco.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, detail);
      const msg =
        aiRes.status === 429
          ? "Muitas análises em pouco tempo. Tente de novo em alguns minutos."
          : "Não consegui gerar os insights agora. Tente de novo em instantes.";
      return json({ stats, insights: null, error: msg });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? null;
    const insights = typeof raw === "string"
      ? raw.replace(/\*+/g, "").replace(/^#+\s*/gm, "").replace(/^\s*[-•]\s+/gm, "").trim()
      : null;
    return json({ stats, insights, error: insights ? null : "Resposta vazia da IA." });
  } catch (err) {
    console.error(err);
    return json({ error: "Algo deu errado ao gerar os insights." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
