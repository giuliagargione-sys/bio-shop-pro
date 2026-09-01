import { useParams } from "react-router-dom";
import { usePublicStore } from "@/hooks/usePublicStore";
import { StoreNav } from "@/components/store/StoreNav";
import { Hero } from "@/components/store/Hero";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { QuizFunnel } from "@/components/store/QuizFunnel";
import { HelpLinksBar } from "@/components/store/HelpLinksBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Link } from "react-router-dom";

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, notFound, ownerId, config } = usePublicStore(slug);

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
    <div className="min-h-screen font-brand">
      <StoreNav config={config} />
      <Hero config={config} />
      <ProductCarousel config={config} />
      <QuizFunnel config={config} ownerId={ownerId} />
      <HelpLinksBar config={config} />
      <StoreFooter config={config} />
    </div>
  );
}
