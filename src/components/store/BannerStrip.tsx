import type { Banner, StoreConfig } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";

const RATIO_CLASS: Record<NonNullable<Banner["ratio"]>, string> = {
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "16/9": "aspect-[16/9]",
};

// Banners clicáveis que a aluna sobe pra destacar uma coleção.
// Formato pensado pro celular: largura total do link, sem cortes.
export function BannerStrip({
  config,
  ownerId,
}: {
  config: StoreConfig;
  ownerId?: string | null;
}) {
  const banners = (config.banners ?? []).filter((b) => b.enabled !== false && b.imageUrl?.trim());
  if (banners.length === 0) return null;

  return (
    <section id="banners" className="py-3">
      <div className="container max-w-md mx-auto px-4 sm:px-0 space-y-3">
        {banners.map((banner) => {
          const href = banner.link?.trim();
          const ratio = RATIO_CLASS[banner.ratio ?? "4/5"];
          const label = banner.title?.trim() || "Banner da coleção";
          const overlayTitle = banner.overlayTitle?.trim();
          const ctaLabel = banner.ctaLabel?.trim();
          const hasOverlay = Boolean(overlayTitle || ctaLabel);

          const image = (
            <div className={`relative w-full ${ratio}`}>
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

          const shell =
            "block overflow-hidden rounded-[var(--radius)] border border-border bg-muted";

          if (!href) {
            return (
              <div key={banner.id} className={shell}>
                {image}
              </div>
            );
          }

          return (
            <a
              key={banner.id}
              href={href}
              target={href.startsWith("#") ? undefined : "_blank"}
              rel="noreferrer"
              onClick={() => trackStoreEvent(ownerId, "botao", `Banner: ${label}`)}
              className={`${shell} active:scale-[0.99] hover:shadow-md transition-all`}
            >
              {image}
            </a>
          );
        })}
      </div>
    </section>
  );
}
