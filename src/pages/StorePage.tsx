import { useEffect } from "react";
import { PageMeta } from "@/components/PageMeta";
import { useParams } from "react-router-dom";
import { usePublicStore } from "@/hooks/usePublicStore";
import { StoreNav } from "@/components/store/StoreNav";
import { Hero } from "@/components/store/Hero";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { BannerCard } from "@/components/store/BannerStrip";
import { VideoCarousel } from "@/components/store/VideoCarousel";
import { QuizFunnel } from "@/components/store/QuizFunnel";
import { HelpLinkButton } from "@/components/store/HelpLinksBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Link } from "react-router-dom";
import { CustomButtonBlock } from "@/components/store/CustomButtonBlock";
import { resolveHelpLinkItems, resolveLayoutBlocks } from "@/lib/layout";
import { trackStoreEvent } from "@/lib/trackEvent";

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, notFound, inactive, ownerId, config } = usePublicStore(slug);

  // Conta uma visita por abertura da loja (alimenta os Insights com IA).
  useEffect(() => {
    if (!loading && !notFound && !inactive && ownerId) trackStoreEvent(ownerId, "visita", slug);
  }, [loading, notFound, inactive, ownerId, slug]);

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

  if (inactive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <h1 className="text-2xl font-semibold">Loja temporariamente fora do ar</h1>
        <p className="text-muted-foreground max-w-sm">
          Esse link está desativado no momento. Se a loja é sua, fale com a gente pra reativar.
        </p>
        <Link to="/" className="text-primary underline">
          Conhecer o Link Na Bio Que Vende
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-brand store-shell">
      <PageMeta
        title={`${config.brand.storeName} — Link Na Bio Que Vende`}
        description={
          config.brand.tagline?.trim() ||
          `Conheça as peças em destaque de ${config.brand.storeName} e descubra seu look ideal pelo quiz.`
        }
        path={`/${slug ?? ""}`}
      />
      <StoreNav config={config} />
      <Hero config={config} />

      {resolveLayoutBlocks(config)
        .filter((block) => block.enabled)
        .map((block) => {
          if (block.type === "banner") {
            const banner = (config.banners ?? []).find((b) => b.id === block.refId);
            if (!banner) return null;
            return <BannerCard key={block.id} banner={banner} ownerId={ownerId} />;
          }
          if (block.type === "helpLink") {
            const item = resolveHelpLinkItems(config).find((i) => i.refId === block.refId);
            if (!item) return null;
            return <HelpLinkButton key={block.id} item={item} config={config} />;
          }
          if (block.type === "produtos") return <ProductCarousel key={block.id} config={config} ownerId={ownerId} />;
          if (block.type === "videos")
            return <VideoCarousel key={block.id} config={config} ownerId={ownerId} />;
          if (block.type === "quiz")
            return <QuizFunnel key={block.id} config={config} ownerId={ownerId} />;
          return <CustomButtonBlock key={block.id} block={block} ownerId={ownerId} />;
        })}
      <StoreFooter config={config} />
    </div>
  );
}
