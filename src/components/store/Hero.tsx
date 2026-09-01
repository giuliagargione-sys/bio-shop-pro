import type { StoreConfig } from "@/types/config";
import { Button } from "@/components/ui/button";

export function Hero({ config }: { config: StoreConfig }) {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="container py-14 text-center flex flex-col items-center gap-5">
        <p className="font-brand text-sm uppercase tracking-widest opacity-80">
          {config.brand.tagline}
        </p>
        <h1 className="font-brand text-3xl sm:text-4xl font-bold max-w-xl leading-tight">
          {config.hero.headline}
        </h1>
        <p className="max-w-md opacity-90">{config.hero.subheadline}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href={config.hero.primaryCtaHref}>
            <Button size="lg">{config.hero.primaryCtaLabel}</Button>
          </a>
          <a href={config.hero.secondaryCtaHref}>
            <Button size="lg" variant="outline" className="border-white/40 text-secondary-foreground">
              {config.hero.secondaryCtaLabel}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
