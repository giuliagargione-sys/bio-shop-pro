import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function StoreAddressCard() {
  const { slug, changeSlug } = useStoreConfig();
  const [value, setValue] = useState(slug ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    const result = await changeSlug(value);
    setSaving(false);
    setFeedback(
      result.ok
        ? { ok: true, text: "Endereço atualizado!" }
        : { ok: false, text: result.error ?? "Não foi possível salvar." }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço da sua loja</CardTitle>
        <CardDescription>
          É esse link que vai no "link da bio" do seu Instagram/TikTok.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="slug">Endereço</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">.../loja/</span>
            <Input
              id="slug"
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase())}
              placeholder="sua-loja"
            />
          </div>
        </div>
        {feedback && (
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: feedback.ok ? "#1a9c5b" : "#c0392b" }}
          >
            {feedback.ok ? <Check size={13} /> : <AlertCircle size={13} />}
            {feedback.text}
          </p>
        )}
        <Button size="sm" onClick={handleSave} disabled={saving || !value.trim()}>
          {saving ? "Salvando..." : "Salvar endereço"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function BrandSection() {
  const { config, updateNested } = useStoreConfig();

  return (
    <div className="space-y-6">
      <StoreAddressCard />

      <Card>
        <CardHeader>
          <CardTitle>Marca</CardTitle>
          <CardDescription>Nome, frase de efeito e logo da sua loja.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="storeName">Nome da loja</Label>
            <Input
              id="storeName"
              value={config.brand.storeName}
              onChange={(e) => updateNested("brand", { storeName: e.target.value })}
              placeholder="Ex: Ateliê da Ana"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Frase de efeito</Label>
            <Input
              id="tagline"
              value={config.brand.tagline}
              onChange={(e) => updateNested("brand", { tagline: e.target.value })}
              placeholder="Ex: Moda que combina com você"
            />
          </div>
          <div>
            <Label htmlFor="logoUrl">Link da imagem do logo</Label>
            <Input
              id="logoUrl"
              value={config.brand.logoUrl}
              onChange={(e) => updateNested("brand", { logoUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cole o link de uma imagem (do Instagram, Google Drive público, Imgur, etc). Se deixar
              em branco, aparece a inicial do nome da loja.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
