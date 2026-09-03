import type { StoreConfig } from "@/types/config";
import { Button } from "@/components/ui/button";

export function Hero({ config }: { config: StoreConfig }) {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="container py-8 sm:py-14 text-center flex flex-col items-center gap-3 sm:gap-5">
        <p className="font-brand text-[11px] sm:text-sm uppercase tracking-[0.18em] opacity-80">
          {config.brand.tagline}
        </p>
        <h1 className="font-brand text-[26px] leading-[1.15] sm:text-4xl font-bold max-w-md">
          {config.hero.headline}
        </h1>
        <p className="max-w-sm text-sm sm:text-base opacity-90 text-balance px-2 sm:px-0">
          {config.hero.subheadline}
        </p>
        <div className="flex w-full max-w-sm flex-col items-stretch justify-center gap-3 pt-1">
          {config.hero.primaryCtaHref && (
            <a href={config.hero.primaryCtaHref}>
              <Button size="lg" className="w-full h-12">
                {config.hero.primaryCtaLabel}
              </Button>
            </a>
          )}
          {config.hero.secondaryCtaHref && (
            <a href={config.hero.secondaryCtaHref}>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 border-white/40 text-secondary-foreground"
              >
                {config.hero.secondaryCtaLabel}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
