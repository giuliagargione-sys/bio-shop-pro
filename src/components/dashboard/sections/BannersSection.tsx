import { useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { uid } from "@/lib/utils";
import { uploadStoreImage } from "@/lib/logoUpload";
import { cropToBannerRatio } from "@/lib/bannerImage";
import type { Banner } from "@/types/config";



function BannerImageField({
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
    const cropped = await cropToBannerRatio(file);
    const { url, error: uploadError } = await uploadStoreImage(cropped, "banner");
    setBusy(false);
    if (uploadError || !url) {
      setError(uploadError || "Não conseguimos enviar a imagem.");
      return;
    }
    onChange(url);
  }

  return (
    <div>
      <Label>Imagem do banner</Label>
      <div className="mt-1 flex items-start gap-3">
        <div
          className="w-28 shrink-0 aspect-[35/26] overflow-hidden rounded-md border bg-muted flex items-center justify-center"
        >
          {value ? (
            <img src={value} alt="Banner" className="h-full w-full object-cover" />
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
            {busy ? "Enviando..." : value ? "Trocar imagem" : "Subir imagem"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remover
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function BannersSection() {
  const { config, updateConfig } = useStoreConfig();
  const banners = config.banners ?? [];

  const setBanners = (next: Banner[]) => updateConfig({ banners: next });
  const patch = (id: string, values: Partial<Banner>) =>
    setBanners(banners.map((b) => (b.id === id ? { ...b, ...values } : b)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banners da loja</CardTitle>
        <CardDescription>
          Suba uma imagem e a deixe clicável pra destacar uma coleção, promoção ou lançamento. Os
          banners serão ajustados automaticamente para o formato mobile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem banners. Adicione o primeiro abaixo.
          </p>
        )}

        {banners.map((banner, index) => (
          <div key={banner.id} className="space-y-3">
            {index > 0 && <Separator />}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Banner {index + 1}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {banner.enabled === false ? "Escondido" : "Aparecendo"}
                </span>
                <Switch
                  checked={banner.enabled !== false}
                  onCheckedChange={(v) => patch(banner.id, { enabled: v })}
                />
              </div>
            </div>

            <BannerImageField
              value={banner.imageUrl}
              onChange={(url) => patch(banner.id, { imageUrl: url })}
            />

            <div>
              <Label htmlFor={`banner-title-${banner.id}`}>Nome do banner (só pra você)</Label>
              <Input
                id={`banner-title-${banner.id}`}
                value={banner.title ?? ""}
                onChange={(e) => patch(banner.id, { title: e.target.value })}
                placeholder="Coleção Verão"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`banner-overlay-${banner.id}`}>
                  Texto sobre a imagem (opcional)
                </Label>
                <Input
                  id={`banner-overlay-${banner.id}`}
                  value={banner.overlayTitle ?? ""}
                  onChange={(e) => patch(banner.id, { overlayTitle: e.target.value })}
                  placeholder="Coleção Verão"
                />
              </div>
              <div>
                <Label htmlFor={`banner-cta-${banner.id}`}>Texto do botão (opcional)</Label>
                <Input
                  id={`banner-cta-${banner.id}`}
                  value={banner.ctaLabel ?? ""}
                  onChange={(e) => patch(banner.id, { ctaLabel: e.target.value })}
                  placeholder="Conferir"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`banner-link-${banner.id}`}>Link ao clicar</Label>
              <Input
                id={`banner-link-${banner.id}`}
                value={banner.link ?? ""}
                onChange={(e) => patch(banner.id, { link: e.target.value })}
                placeholder="https://sualoja.com/colecao-verao"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pode ser a categoria do seu site, um link de WhatsApp ou deixar vazio (aí o banner
                fica só como imagem).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBanners(banners.filter((b) => b.id !== banner.id))}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 size={14} />
              Remover este banner
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setBanners([
              ...banners,
              { id: uid("banner"), imageUrl: "", link: "", title: "", ratio: "4/5", enabled: true },
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-border py-3 text-sm hover:bg-muted"
        >
          <Plus size={16} />
          Adicionar banner
        </button>
      </CardContent>
    </Card>
  );
}
