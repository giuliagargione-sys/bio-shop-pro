import { useEffect, useRef, useState } from "react";
import { Check, AlertCircle, Upload, Trash2, Copy, ExternalLink } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadLogo } from "@/lib/logoUpload";
import { isReservedSlug, storeHost, storePath, storeUrl } from "@/lib/storeUrl";

function cleanSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");
}

function StoreAddressCard() {
  const { slug, changeSlug } = useStoreConfig();
  const [value, setValue] = useState(slug ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Quando a loja termina de carregar, o endereço salvo entra no campo.
  useEffect(() => {
    if (slug) setValue(slug);
  }, [slug]);

  const host = storeHost();
  const preview = value.replace(/-+$/, "");
  const fullUrl = `${host}${storePath(preview)}`;
  const changed = preview !== (slug ?? "");
  const reserved = isReservedSlug(preview);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    if (reserved) {
      setSaving(false);
      setFeedback({ ok: false, text: "Esse endereço é reservado. Escolha outro." });
      return;
    }
    const result = await changeSlug(preview);
    setSaving(false);
    setFeedback(
      result.ok
        ? { ok: true, text: "Endereço atualizado!" }
        : { ok: false, text: result.error ?? "Não foi possível salvar." }
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(storeUrl(slug ?? ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço da sua loja</CardTitle>
        <CardDescription>
          É esse link que vai no "link da bio" do seu Instagram/TikTok. Escolha algo curto e fácil de
          lembrar — o nome da sua marca costuma ser a melhor opção.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="slug">Endereço</Label>
          <div className="flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <span className="hidden sm:flex items-center px-3 text-sm text-muted-foreground bg-muted whitespace-nowrap">
              {host}/
            </span>
            <Input
              id="slug"
              value={value}
              onChange={(e) => setValue(cleanSlug(e.target.value))}
              placeholder="sua-loja"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground break-all">
            Seu link fica: <span className="font-medium text-foreground">{fullUrl}</span>
          </p>
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

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !preview || !changed || reserved}>
            {saving ? "Salvando..." : changed ? "Salvar endereço" : "Endereço salvo"}
          </Button>
          {slug && (
            <>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy size={14} className="mr-1.5" />
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
              <a
                href={storeUrl(slug ?? "")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center h-9 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink size={14} className="mr-1.5" />
                Ver minha loja
              </a>

            </>
          )}
        </div>
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

