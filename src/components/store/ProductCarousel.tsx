import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { StoreConfig } from "@/types/config";
import { trackStoreEvent } from "@/lib/trackEvent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCarousel({
  config,
  ownerId,
}: {
  config: StoreConfig;
  ownerId?: string | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [centerItems, setCenterItems] = useState(true);

  useEffect(() => {
    const el = trackRef.current;
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
  }, [config.products.length]);

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (config.products.length === 0) return null;

  return (
    <section id="produtos" className="py-8 sm:py-12">
      <div className="container max-w-md mx-auto grid grid-cols-[1fr_auto_1fr] items-center mb-4 sm:mb-5 px-4 sm:px-0">
        <div />
        <h2 className="font-brand text-xl sm:text-2xl font-semibold text-center">
          {(config.productsTitle || "").trim() || "Peças em destaque"}
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

      {/* No celular o carrossel mostra um cartão por vez, centralizado, com dica de arrastar. */}
      <div
        ref={trackRef}
        className={`flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-2 sm:container ${
          centerItems ? "justify-center" : "justify-start"
        }`}
      >
        {config.products.map((product, index) => (
          <a
            key={product.id}
            href={product.link}
            target={product.link?.startsWith("#") ? undefined : "_blank"}
            rel="noreferrer"
            onClick={() => trackStoreEvent(ownerId, "produto", product.name)}
            className="snap-center shrink-0 w-[78%] max-w-[280px] sm:w-56 rounded-[var(--radius)] border border-border overflow-hidden bg-white active:scale-[0.99] hover:shadow-md transition-all"
          >
            <div className="relative aspect-[3/4] bg-muted flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  // A primeira imagem costuma ser a LCP: prioriza ela e deixa
                  // o resto do carrossel em lazy (recomendação do PageSpeed).
                  loading={index === 0 ? "eager" : "lazy"}
                  {...({ fetchpriority: index === 0 ? "high" : "auto" } as object)}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageOff className="text-muted-foreground" size={28} />
              )}
              {product.badge && <Badge className="absolute top-2 left-2">{product.badge}</Badge>}
              {product.showPrice !== false && product.salePrice?.trim() && product.price?.trim() && (
                <Badge className="absolute top-2 right-2">Oferta</Badge>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm leading-snug line-clamp-2">{product.name}</p>
              {product.showPrice !== false && (product.price?.trim() || product.salePrice?.trim()) && (
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                  {product.salePrice?.trim() && product.price?.trim() ? (
                    <>
                      <span className="text-xs text-foreground/70 line-through">
                        de {product.price}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        por {product.salePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold">
                      {product.salePrice?.trim() || product.price}
                    </span>
                  )}
                </div>
              )}
              <span className="text-xs text-primary font-medium">Ver look →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
