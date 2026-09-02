import type { StoreConfig } from "@/types/config";
import { Button } from "@/components/ui/button";

export function Hero({ config }: { config: StoreConfig }) {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="container py-10 sm:py-14 text-center flex flex-col items-center gap-4 sm:gap-5">
        <p className="font-brand text-[11px] sm:text-sm uppercase tracking-[0.18em] opacity-80">
          {config.brand.tagline}
        </p>
        <h1 className="font-brand text-[28px] leading-[1.15] sm:text-4xl font-bold max-w-xl">
          {config.hero.headline}
        </h1>
        <p className="max-w-md text-sm sm:text-base opacity-90 text-balance">
          {config.hero.subheadline}
        </p>
        <div className="flex w-full flex-col sm:flex-row sm:w-auto items-stretch sm:items-center justify-center gap-3 pt-1">
          <a href={config.hero.primaryCtaHref} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12">
              {config.hero.primaryCtaLabel}
            </Button>
          </a>
          <a href={config.hero.secondaryCtaHref} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 border-white/40 text-secondary-foreground"
            >
              {config.hero.secondaryCtaLabel}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
