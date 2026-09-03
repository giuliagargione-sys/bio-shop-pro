import type { Banner, StoreConfig } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";

// Proporção única, mobile-first (referência: 350 x 256)
const BANNER_RATIO_CLASS = "aspect-[35/26]";

// Um banner clicável que a aluna sobe pra destacar uma coleção.
// Formato pensado pro celular: largura total do link, sem cortes.
export function BannerCard({
  banner,
  ownerId,
}: {
  banner: Banner;
  ownerId?: string | null;
}) {
  if (banner.enabled === false || !banner.imageUrl?.trim()) return null;

  const href = banner.link?.trim();
  const label = banner.title?.trim() || "Banner da coleção";
  const overlayTitle = banner.overlayTitle?.trim();
  const ctaLabel = banner.ctaLabel?.trim();
  const hasOverlay = Boolean(overlayTitle || ctaLabel);

  const image = (
    <div className={`relative w-full ${BANNER_RATIO_CLASS}`}>
      <img
        src={banner.imageUrl}
        alt={label}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {hasOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 px-4 text-center">
          {overlayTitle && (
            <span className="font-heading text-2xl sm:text-3xl text-white drop-shadow-sm">
              {overlayTitle}
            </span>
          )}
          {ctaLabel && (
            <span className="rounded-full border border-white/80 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {ctaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const shell = "block overflow-hidden rounded-[var(--radius)] border border-border bg-muted";

  return (
    <section className="py-1.5">
      <div className="container max-w-md mx-auto px-4 sm:px-0">
        {href ? (
          <a
            href={href}
            target={href.startsWith("#") ? undefined : "_blank"}
            rel="noreferrer"
            onClick={() => trackStoreEvent(ownerId, "botao", `Banner: ${label}`)}
            className={`${shell} active:scale-[0.99] hover:shadow-md transition-all`}
          >
            {image}
          </a>
        ) : (
          <div className={shell}>{image}</div>
        )}
      </div>
    </section>
  );
}

// Compatibilidade: renderiza todos os banners em sequência.
export function BannerStrip({
  config,
  ownerId,
}: {
  config: StoreConfig;
  ownerId?: string | null;
}) {
  const banners = config.banners ?? [];
  if (banners.length === 0) return null;
  return (
    <div id="banners">
      {banners.map((banner) => (
        <BannerCard key={banner.id} banner={banner} ownerId={ownerId} />
      ))}
    </div>
  );
}
