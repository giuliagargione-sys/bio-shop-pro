import { useRef, useState } from "react";
import { Check, AlertCircle, Upload, Trash2 } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadLogo } from "@/lib/logoUpload";


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
          <LogoUploadField />
        </CardContent>
      </Card>
    </div>
  );
}

function LogoUploadField() {
  const { config, updateNested } = useStoreConfig();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const result = await uploadLogo(file);
    setUploading(false);
    if (result.url) updateNested("brand", { logoUrl: result.url });
    else setError(result.error);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <Label>Imagem do logo</Label>
      <div className="flex items-center gap-3 mt-1">
        <div className="h-16 w-16 shrink-0 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center">
          {config.brand.logoUrl ? (
            <img src={config.brand.logoUrl} alt="Logo da loja" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">
              {config.brand.storeName.charAt(0).toUpperCase() || "L"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={14} className="mr-1.5" />
            {uploading ? "Enviando..." : config.brand.logoUrl ? "Trocar imagem" : "Subir imagem"}
          </Button>
          {config.brand.logoUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateNested("brand", { logoUrl: "" })}
              disabled={uploading}
            >
              <Trash2 size={14} className="mr-1.5" />
              Remover
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs flex items-center gap-1 mt-2" style={{ color: "#c0392b" }}>
          <AlertCircle size={13} />
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        JPG, PNG ou WEBP de até 5 MB. Se não subir nada, aparece a inicial do nome da loja.
      </p>
      <details className="mt-3">
        <summary className="text-xs text-muted-foreground cursor-pointer">
          Prefiro colar o link de uma imagem
        </summary>
        <Input
          className="mt-2"
          value={config.brand.logoUrl}
          onChange={(e) => updateNested("brand", { logoUrl: e.target.value })}
          placeholder="https://..."
        />
      </details>
    </div>
  );
}

