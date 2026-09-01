import { useState } from "react";
import { Plus, Trash2, Link2, Loader2, Sparkles } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uid } from "@/lib/utils";
import { fetchProductPreview } from "@/lib/productPreview";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Product } from "@/types/config";

export function ProductsSection() {
  const { config, updateConfig } = useStoreConfig();
  const [linkInput, setLinkInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function updateProduct(id: string, patch: Partial<Product>) {
    updateConfig({
      products: config.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function removeProduct(id: string) {
    updateConfig({ products: config.products.filter((p) => p.id !== id) });
  }

  function addProduct(seed?: Partial<Product>) {
    const newProduct: Product = {
      id: uid("prod"),
      name: seed?.name || "Nova peça",
      imageUrl: seed?.imageUrl || "",
      badge: seed?.badge || "",
      link: seed?.link || "#",
    };
    updateConfig({ products: [...config.products, newProduct] });
    return newProduct.id;
  }

  async function handleFetchFromLink() {
    if (!linkInput.trim()) return;
    setFetchError(null);
    setFetching(true);
    const { data, error } = await fetchProductPreview(linkInput.trim());
    setFetching(false);

    if (error) {
      setFetchError(error);
      // mesmo sem conseguir os dados automaticos, ja cria a peca com o link
      // certo — a aluna so completa nome/imagem na mao
      addProduct({ link: linkInput.trim() });
      setLinkInput("");
      return;
    }

    addProduct({
      name: data?.title || "Nova peça",
      imageUrl: data?.image || "",
      link: linkInput.trim(),
    });
    setLinkInput("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} /> Adicionar peça pelo link
          </CardTitle>
          <CardDescription>
            Cole o link do produto no seu site — o card já vem preenchido com o nome, a imagem e o
            link certinho, direto pra sua peça (dá pra ajustar tudo depois).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://sualoja.com.br/produto/..."
              onKeyDown={(e) => e.key === "Enter" && handleFetchFromLink()}
            />
            <Button onClick={handleFetchFromLink} disabled={fetching || !linkInput.trim()}>
              {fetching ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              {fetching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {fetchError && (
            <p className="text-xs mt-2" style={{ color: "#b8860b" }}>
              {fetchError} A peça foi criada com o link — só completar nome e imagem manualmente
              abaixo.
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="text-xs text-muted-foreground mt-2">
              A busca automática precisa do Supabase conectado (veja o README). Sem isso, cole o
              link e complete os campos manualmente mesmo assim.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos em destaque</CardTitle>
          <CardDescription>As peças que aparecem no carrossel da loja.</CardDescription>
        </CardHeader>
        <CardContent>
          {config.products.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma peça ainda — adicione uma acima.</p>
          )}

          {config.products.map((product, index) => (
            <div key={product.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Peça {index + 1}</span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="hover:opacity-70"
                  aria-label="Remover produto"
                  style={{ color: "#c0392b" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <Label>Nome da peça</Label>
                  <Input
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Link da imagem</Label>
                  <Input
                    value={product.imageUrl}
                    onChange={(e) => updateProduct(product.id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Selo (opcional)</Label>
                    <Input
                      value={product.badge}
                      onChange={(e) => updateProduct(product.id, { badge: e.target.value })}
                      placeholder="Ex: Mais vendida"
                    />
                  </div>
                  <div>
                    <Label>Link de compra</Label>
                    <Input
                      value={product.link}
                      onChange={(e) => updateProduct(product.id, { link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={() => addProduct()} className="w-full mt-4">
            <Plus size={16} />
            Adicionar peça em branco
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
