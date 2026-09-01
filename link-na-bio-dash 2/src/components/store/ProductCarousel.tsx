import { useRef } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { StoreConfig } from "@/types/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCarousel({ config }: { config: StoreConfig }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (config.products.length === 0) return null;

  return (
    <section id="produtos" className="container py-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-brand text-2xl font-semibold">Peças em destaque</h2>
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
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x-mandatory pb-2"
      >
        {config.products.map((product) => (
          <a
            key={product.id}
            href={product.link}
            target={product.link?.startsWith("#") ? undefined : "_blank"}
            rel="noreferrer"
            className="snap-center shrink-0 w-56 rounded-[var(--radius)] border border-border overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[3/4] bg-muted flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <ImageOff className="text-muted-foreground" size={28} />
              )}
              {product.badge && (
                <Badge className="absolute top-2 left-2">{product.badge}</Badge>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm">{product.name}</p>
              <span className="text-xs text-primary font-medium">Ver look →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
