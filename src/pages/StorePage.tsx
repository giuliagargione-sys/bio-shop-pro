import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePublicStore } from "@/hooks/usePublicStore";
import { StoreNav } from "@/components/store/StoreNav";
import { Hero } from "@/components/store/Hero";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { QuizFunnel } from "@/components/store/QuizFunnel";
import { HelpLinksBar } from "@/components/store/HelpLinksBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StickyContactBar } from "@/components/store/StickyContactBar";
import { Link } from "react-router-dom";
import { CustomButtonBlock } from "@/components/store/CustomButtonBlock";
import { resolveLayoutBlocks } from "@/lib/layout";
import { trackStoreEvent } from "@/lib/trackEvent";

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, notFound, ownerId, config } = usePublicStore(slug);

  // Conta uma visita por abertura da loja (alimenta os Insights com IA).
  useEffect(() => {
    if (!loading && !notFound && ownerId) trackStoreEvent(ownerId, "visita", slug);
  }, [loading, notFound, ownerId, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando loja...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <h1 className="text-2xl font-semibold">Essa loja não existe (ainda)</h1>
        <p className="text-muted-foreground max-w-sm">
          Confira se o endereço está certo, ou crie a sua própria loja no Link Na Bio Que Vende.
        </p>
        <Link to="/" className="text-primary underline">
          Conhecer o Link Na Bio Que Vende
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-brand store-shell">
      <StoreNav config={config} />
      <Hero config={config} />
      {resolveLayoutBlocks(config)
        .filter((block) => block.enabled)
        .map((block) => {
          if (block.type === "produtos") return <ProductCarousel key={block.id} config={config} ownerId={ownerId} />;
          if (block.type === "quiz")
            return <QuizFunnel key={block.id} config={config} ownerId={ownerId} />;
          if (block.type === "ajuda") return <HelpLinksBar key={block.id} config={config} />;
          return <CustomButtonBlock key={block.id} block={block} ownerId={ownerId} />;
        })}
      <StoreFooter config={config} />
      <StickyContactBar config={config} ownerId={ownerId} />
    </div>
  );
}
