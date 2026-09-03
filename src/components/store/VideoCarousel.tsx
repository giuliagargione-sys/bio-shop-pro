import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { StoreConfig, VideoItem } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";
import { Button } from "@/components/ui/button";

function useCenterItems<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const [centerItems, setCenterItems] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setCenterItems(el.scrollWidth <= el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, deps);

  return { ref, centerItems };
}

// Carrossel de videos (reels) mobile-first. O card inteiro é clicável e leva
// pra página do produto no site da aluna.
function VideoCard({ video, ownerId }: { video: VideoItem; ownerId?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  function togglePlay(e: React.MouseEvent) {
    // O play não deve abrir o link — só o card/nome do produto abre.
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      setUserPaused(false);
      el.play().catch(() => {});
    } else {
      setUserPaused(true);
      el.pause();
    }
  }

  // Autoplay quando o card entra na viewport; pausa quando sai.
  // Só volta a tocar sozinho se a usuária não tiver pausado manualmente.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (!userPaused) {
              el.play().catch(() => {});
            }
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.55, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [userPaused, video.videoUrl]);

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
          // Nada de pré-carregar/baixar os vídeos no carregamento da página:
          // o IntersectionObserver dá play só quando o card entra na tela.
          // Isso tirou ~28 MB do payload inicial (apontado no PageSpeed).
          preload="none"
          className="h-full w-full object-cover"
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pausar vídeo" : "Assistir vídeo"}
          className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur-sm"
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
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
  const { ref: trackRef, centerItems } = useCenterItems<HTMLDivElement>([
    config.videos?.length,
  ]);
  const videos = (config.videos ?? [])
    .filter((v) => v.enabled !== false && v.videoUrl?.trim())
    .slice(0, 4);

  if (videos.length === 0) return null;

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section id="videos" className="py-8 sm:py-12">
      <div className="container max-w-md mx-auto grid grid-cols-[1fr_auto_1fr] items-center mb-4 sm:mb-5 px-4 sm:px-0">
        <div />
        <h2 className="font-brand text-xl sm:text-2xl font-semibold text-center">
          {(config.videosTitle || "").trim() || "Peças no vídeo"}
        </h2>
        <div className="hidden sm:flex gap-2 justify-end">
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
        className={`flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-2 sm:container ${
          centerItems ? "justify-center" : "justify-start"
        }`}
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} ownerId={ownerId} />
        ))}
      </div>
    </section>
  );
}
