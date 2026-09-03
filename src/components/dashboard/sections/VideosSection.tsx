import { useRef, useState } from "react";
import { Film, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { uid } from "@/lib/utils";
import { uploadStoreVideo } from "@/lib/videoUpload";
import { uploadStoreImage } from "@/lib/logoUpload";
import type { VideoItem } from "@/types/config";

function VideoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    const { url, error: uploadError } = await uploadStoreVideo(file);
    setBusy(false);
    if (uploadError || !url) {
      setError(uploadError || "Não conseguimos enviar o vídeo.");
      return;
    }
    onChange(url);
  }

  return (
    <div>
      <Label>Vídeo (MP4 ou MOV, até 50 MB)</Label>
      <div className="mt-1 flex items-start gap-3">
        <div className="w-20 shrink-0 aspect-[9/16] overflow-hidden rounded-md border bg-muted flex items-center justify-center">
          {value ? (
            <video src={value} muted playsInline className="h-full w-full object-cover" />
          ) : (
            <Film size={18} className="text-muted-foreground" />
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
            {busy ? "Enviando..." : value ? "Trocar vídeo" : "Subir vídeo"}
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
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PosterField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    const { url, error: uploadError } = await uploadStoreImage(file, "video-capa");
    setBusy(false);
    if (uploadError || !url) {
      setError(uploadError || "Não conseguimos enviar a capa.");
      return;
    }
    onChange(url);
  }

  return (
    <div>
      <Label>Capa do vídeo (opcional)</Label>
      <div className="mt-1 flex items-start gap-3">
        <div className="w-20 shrink-0 aspect-[9/16] overflow-hidden rounded-md border bg-muted flex items-center justify-center">
          {value ? (
            <img src={value} alt="Capa" className="h-full w-full object-cover" />
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
            {busy ? "Enviando..." : value ? "Trocar capa" : "Subir capa"}
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

const MAX_VIDEOS = 4;

export function VideosSection() {
  const { config, updateConfig } = useStoreConfig();
  const { isPro, loading: planLoading } = usePlan();
  const videos = config.videos ?? [];
  const atLimit = videos.length >= MAX_VIDEOS;

  const setVideos = (next: VideoItem[]) => updateConfig({ videos: next });
  const patch = (id: string, values: Partial<VideoItem>) =>
    setVideos(videos.map((v) => (v.id === id ? { ...v, ...values } : v)));

  return (
    <ProLock
      locked={!isPro && !planLoading}
      title="Carrossel de vídeos é do plano PRO"
      description="No PRO você sobe até 4 vídeos clicáveis com o card do produto na sua loja."
    >
    <Card>
      <CardHeader>
        <CardTitle>Carrossel de vídeos</CardTitle>
        <CardDescription>
          Suba o vídeo do seu reel e monte o card do produto. O card fica clicável e leva a cliente
          direto pra página do produto no seu site. O formato é ajustado pro celular.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="videos-title">Título da seção</Label>
          <Input
            id="videos-title"
            value={config.videosTitle ?? ""}
            onChange={(e) => updateConfig({ videosTitle: e.target.value })}
            placeholder="Peças no vídeo"
          />
        </div>

        {videos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem vídeos. Adicione o primeiro abaixo.
          </p>
        )}

        {videos.map((video, index) => (
          <div key={video.id} className="flex items-start gap-2">
            <div className="flex-1 space-y-4 rounded-[var(--radius)] border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Vídeo {index + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {video.enabled === false ? "Escondido" : "Aparecendo"}
                  </span>
                  <Switch
                    checked={video.enabled !== false}
                    onCheckedChange={(v) => patch(video.id, { enabled: v })}
                  />
                </div>
              </div>

              <VideoField
                value={video.videoUrl}
                onChange={(url) => patch(video.id, { videoUrl: url })}
              />

              <PosterField
                value={video.posterUrl ?? ""}
                onChange={(url) => patch(video.id, { posterUrl: url })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`video-name-${video.id}`}>Nome do produto</Label>
                  <Input
                    id={`video-name-${video.id}`}
                    value={video.productName}
                    onChange={(e) => patch(video.id, { productName: e.target.value })}
                    placeholder="Conjunto Lara"
                  />
                </div>
                <div>
                  <Label htmlFor={`video-price-${video.id}`}>Preço (opcional)</Label>
                  <Input
                    id={`video-price-${video.id}`}
                    value={video.price ?? ""}
                    onChange={(e) => patch(video.id, { price: e.target.value })}
                    placeholder="R$ 189,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`video-link-${video.id}`}>Link do produto no seu site</Label>
                <Input
                  id={`video-link-${video.id}`}
                  value={video.link}
                  onChange={(e) => patch(video.id, { link: e.target.value })}
                  placeholder="https://sualoja.com/produto/conjunto-lara"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Excluir vídeo"
              aria-label="Excluir vídeo"
              className="mt-1 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setVideos(videos.filter((v) => v.id !== video.id))}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}

        <button
          type="button"
          disabled={atLimit}
          onClick={() =>
            setVideos([
              ...videos,
              { id: uid("video"), videoUrl: "", productName: "", link: "", enabled: true },
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-border py-3 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Plus size={16} />
          Adicionar vídeo
        </button>
        <p className="text-xs text-muted-foreground">
          {atLimit
            ? "Você chegou no limite de 4 vídeos. Exclua um pra adicionar outro — assim a loja continua leve e rápida."
            : `Você pode adicionar até 4 vídeos (${videos.length}/4) pra não pesar a página.`}
        </p>
      </CardContent>
    </Card>
    </ProLock>
  );
}
