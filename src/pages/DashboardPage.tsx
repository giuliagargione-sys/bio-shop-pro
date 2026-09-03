import { PageMeta } from "@/components/PageMeta";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useStoreConfig } from "@/context/ConfigContext";
import { DashboardLayout, type DashboardSectionKey } from "@/components/dashboard/DashboardLayout";
import { BrandSection } from "@/components/dashboard/sections/BrandSection";
import { ThemeSection } from "@/components/dashboard/sections/ThemeSection";
import { StructureSection } from "@/components/dashboard/sections/StructureSection";
import { HeroSection } from "@/components/dashboard/sections/HeroSection";
import { ProductsSection } from "@/components/dashboard/sections/ProductsSection";
import { BannersSection } from "@/components/dashboard/sections/BannersSection";
import { VideosSection } from "@/components/dashboard/sections/VideosSection";
import { QuizSection } from "@/components/dashboard/sections/QuizSection";
import { LeadsSection } from "@/components/dashboard/sections/LeadsSection";
import { InsightsSection } from "@/components/dashboard/sections/InsightsSection";
import { ContactSection } from "@/components/dashboard/sections/ContactSection";
import { HelpLinksSection } from "@/components/dashboard/sections/HelpLinksSection";
import { FooterSection } from "@/components/dashboard/sections/FooterSection";
import { SaveBar } from "@/components/dashboard/SaveBar";

// Abas que só mostram dados (não editam a loja) não precisam do botão salvar.
const READ_ONLY_SECTIONS: DashboardSectionKey[] = ["leads", "insights"];

const SECTION_MAP: Record<DashboardSectionKey, ReactNode> = {
  marca: <BrandSection />,
  tema: (
    <div className="space-y-6">
      <StructureSection />
      <ThemeSection />
    </div>
  ),
  hero: <HeroSection />,
  banners: <BannersSection />,
  videos: <VideosSection />,
  produtos: <ProductsSection />,
  quiz: <QuizSection />,
  leads: <LeadsSection />,
  insights: <InsightsSection />,
  contato: <ContactSection />,
  ajuda: <HelpLinksSection />,
  rodape: <FooterSection />,
};

export default function DashboardPage() {
  const [active, setActive] = useState<DashboardSectionKey>("leads");
  const { editingAsAdmin } = useStoreConfig();

  return (
    <DashboardLayout active={active} onChange={setActive}>
      <PageMeta title="Personalizar minha loja — Link Na Bio Que Vende" description="Edite logo, cores, produtos, quiz e botões da sua loja no link da bio." path="/personalizar" noindex />
      {editingAsAdmin && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted p-3 text-sm">
          <span>
            Você está editando a loja de uma aluna pelo acesso central. Tudo que mudar aqui salva na
            loja dela.
          </span>
          <Link to="/admin" className="underline">
            Voltar pro acesso central
          </Link>
        </div>
      )}
      {SECTION_MAP[active]}
      {!READ_ONLY_SECTIONS.includes(active) && <SaveBar />}
    </DashboardLayout>
  );
}
