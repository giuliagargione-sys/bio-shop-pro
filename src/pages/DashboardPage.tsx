import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useStoreConfig } from "@/context/ConfigContext";
import { DashboardLayout, type DashboardSectionKey } from "@/components/dashboard/DashboardLayout";
import { BrandSection } from "@/components/dashboard/sections/BrandSection";
import { ThemeSection } from "@/components/dashboard/sections/ThemeSection";
import { StructureSection } from "@/components/dashboard/sections/StructureSection";
import { HeroSection } from "@/components/dashboard/sections/HeroSection";
import { ProductsSection } from "@/components/dashboard/sections/ProductsSection";
import { QuizSection } from "@/components/dashboard/sections/QuizSection";
import { LeadsSection } from "@/components/dashboard/sections/LeadsSection";
import { InsightsSection } from "@/components/dashboard/sections/InsightsSection";
import { ContactSection } from "@/components/dashboard/sections/ContactSection";
import { HelpLinksSection } from "@/components/dashboard/sections/HelpLinksSection";
import { FooterSection } from "@/components/dashboard/sections/FooterSection";
import { ExportSection } from "@/components/dashboard/sections/ExportSection";

const SECTION_MAP: Record<DashboardSectionKey, ReactNode> = {
  marca: <BrandSection />,
  tema: (
    <div className="space-y-6">
      <StructureSection />
      <ThemeSection />
    </div>
  ),
  hero: <HeroSection />,
  produtos: <ProductsSection />,
  quiz: <QuizSection />,
  leads: <LeadsSection />,
  insights: <InsightsSection />,
  contato: <ContactSection />,
  ajuda: <HelpLinksSection />,
  rodape: <FooterSection />,
  exportar: <ExportSection />,
};

export default function DashboardPage() {
  const [active, setActive] = useState<DashboardSectionKey>("leads");
  const { editingAsAdmin } = useStoreConfig();

  return (
    <DashboardLayout active={active} onChange={setActive}>
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
    </DashboardLayout>
  );
}
