// Edge Function: recebe o link de um produto e devolve titulo + imagem,
// lendo as tags <meta property="og:..."> da pagina do lado do servidor
// (o navegador nao consegue fazer isso sozinho por causa de CORS).
//
// Deploy (no terminal, com a Supabase CLI já logada no projeto):
//   supabase functions deploy fetch-product-preview

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*property=["']${property}["']`,
      "i"
    ),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Cole um link válido (começando com http)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkNaBioQueVende/1.0; +https://lovable.dev)",
      },
      // evita ficar pendurado num site fora do ar
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Site respondeu ${response.status}`);
    }

    const html = await response.text();

    const title =
      extractMetaContent(html, "og:title") ||
      extractMetaContent(html, "twitter:title") ||
      extractTitleTag(html) ||
      "";
    const image =
      extractMetaContent(html, "og:image") ||
      extractMetaContent(html, "twitter:image") ||
      "";

    return new Response(JSON.stringify({ title, image, url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error:
          "Não consegui buscar os dados desse link automaticamente. Preencha manualmente abaixo.",
      }),
      {
        status: 200, // 200 proposital: o front trata isso como "sem preview", nao como erro fatal
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
