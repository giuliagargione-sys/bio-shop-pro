import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { StoreConfig, VideoItem } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";
import { Button } from "@/components/ui/button";

// Carrossel de videos (reels) mobile-first. O card inteiro é clicável e leva
// pra página do produto no site da aluna.
function VideoCard({ video, ownerId }: { video: VideoItem; ownerId?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function togglePlay(e: React.MouseEvent) {
    // O play não deve abrir o link — só o card/nome do produto abre.
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  const href = video.link?.trim();

  const card = (
    <>
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.posterUrl || undefined}
          playsInline
          muted
          loop
          preload="metadata"
          className="h-full w-full object-cover"
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Assistir vídeo"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-black/30 text-white">
              <Play size={22} className="ml-0.5" />
            </span>
          </button>
        )}
        {playing && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Pausar vídeo"
            className="absolute inset-0"
          />
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm leading-snug line-clamp-2">{video.productName}</p>
        {video.price?.trim() && (
          <p className="mt-0.5 text-sm font-semibold">{video.price}</p>
        )}
        {href && <span className="text-xs text-primary font-medium">Ver produto →</span>}
      </div>
    </>
  );

  const className =
    "snap-center shrink-0 w-[78%] max-w-[280px] sm:w-56 rounded-[var(--radius)] border border-border overflow-hidden bg-white active:scale-[0.99] hover:shadow-md transition-all block";

  if (!href) return <div className={className}>{card}</div>;

  return (
    <a
      href={href}
      target={href.startsWith("#") ? undefined : "_blank"}
      rel="noreferrer"
      onClick={() => trackStoreEvent(ownerId, "produto", video.productName || "Vídeo")}
      className={className}
    >
      {card}
    </a>
  );
}

export function VideoCarousel({
  config,
  ownerId,
}: {
  config: StoreConfig;
  ownerId?: string | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videos = (config.videos ?? []).filter(
    (v) => v.enabled !== false && v.videoUrl?.trim()
  );

  if (videos.length === 0) return null;

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section id="videos" className="py-8 sm:py-12">
      <div className="container max-w-md mx-auto flex items-center justify-between mb-4 sm:mb-5 px-4 sm:px-0">
        <h2 className="font-brand text-xl sm:text-2xl font-semibold">
          {(config.videosTitle || "").trim() || "Peças no vídeo"}
        </h2>
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scrollBy(-280)} aria-label="Anterior">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scrollBy(280)} aria-label="Próximo">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x-mandatory px-4 pb-2 sm:container"
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} ownerId={ownerId} />
        ))}
      </div>
    </section>
  );
}
