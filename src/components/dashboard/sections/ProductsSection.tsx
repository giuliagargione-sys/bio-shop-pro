import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Loader2, ImageIcon } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { uid } from "@/lib/utils";
import { uploadStoreImage } from "@/lib/logoUpload";
import type { Product } from "@/types/config";

function ProductImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    const { url, error: uploadError } = await uploadStoreImage(file, "produto");
    setBusy(false);
    if (uploadError || !url) {
      setError(uploadError || "Não conseguimos enviar a imagem.");
      return;
    }
    onChange(url);
  }

  return (
    <div>
      <Label>Foto do produto</Label>
      <div className="flex items-center gap-3 mt-1">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
          {value ? (
            <img src={value} alt="Foto do produto" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={18} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {busy ? "Enviando..." : value ? "Trocar foto" : "Subir foto"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <Trash2 size={14} />
              Remover
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="text-xs mt-2" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou WEBP de até 5 MB.</p>
    </div>
  );
}

export function ProductsSection() {
  const { config, updateConfig } = useStoreConfig();

  function updateProduct(id: string, patch: Partial<Product>) {
    updateConfig({
      products: config.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function removeProduct(id: string) {
    updateConfig({ products: config.products.filter((p) => p.id !== id) });
  }

  function addProduct() {
    const newProduct: Product = {
      id: uid("prod"),
      name: "",
      imageUrl: "",
      badge: "",
      link: "#",
      showPrice: true,
      price: "",
      salePrice: "",
    };
    updateConfig({ products: [...config.products, newProduct] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Produtos em destaque</CardTitle>
          <CardDescription>
            Os produtos que aparecem no carrossel da loja. Suba a foto direto do computador ou celular.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="productsTitle">Título da seção na loja</Label>
          <Input
            id="productsTitle"
            value={config.productsTitle ?? ""}
            onChange={(e) => updateConfig({ productsTitle: e.target.value })}
            placeholder="Ex: Produtos em destaque"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Dê o nome que quiser: "Novidades da semana", "Mais amados", "Meus favoritos"...
          </p>
        </CardContent>
      </Card>

      {config.products.length === 0 && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground text-center">
            Nenhum produto ainda — adicione o primeiro abaixo.
          </CardContent>
        </Card>
      )}

      {config.products.map((product, index) => (
        <Card key={product.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 border-b">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={16} className="text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">Produto {index + 1}</CardTitle>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => removeProduct(product.id)}
              aria-label="Remover produto"
            >
              <Trash2 size={16} />
            </Button>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div>
              <Label>Nome da peça</Label>
              <Input
                value={product.name}
                onChange={(e) => updateProduct(product.id, { name: e.target.value })}
              />
            </div>

            <Separator />

            <ProductImageField
              value={product.imageUrl}
              onChange={(url) => updateProduct(product.id, { imageUrl: url })}
            />

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
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

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor={`showPrice-${product.id}`}>Mostrar preço na loja</Label>
                  <p className="text-xs text-muted-foreground">
                    Desligue se preferir não exibir valores.
                  </p>
                </div>
                <Switch
                  id={`showPrice-${product.id}`}
                  checked={product.showPrice !== false}
                  onCheckedChange={(checked) => updateProduct(product.id, { showPrice: checked })}
                />
              </div>
              {product.showPrice !== false && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Preço</Label>
                      <Input
                        value={product.price ?? ""}
                        onChange={(e) => updateProduct(product.id, { price: e.target.value })}
                        placeholder="R$ 189,90"
                      />
                    </div>
                    <div>
                      <Label>Preço promocional (opcional)</Label>
                      <Input
                        value={product.salePrice ?? ""}
                        onChange={(e) => updateProduct(product.id, { salePrice: e.target.value })}
                        placeholder="R$ 149,90"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preenchendo o promocional, a loja mostra "de {product.price || "R$ 189,90"} por{" "}
                    {product.salePrice || "R$ 149,90"}" com selo de oferta.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addProduct} className="w-full">
        <Plus size={16} />
        Adicionar peça
      </Button>
    </div>
  );
}

