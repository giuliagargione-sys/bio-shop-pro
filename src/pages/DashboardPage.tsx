import { useState, type ReactNode } from "react";
import { DashboardLayout, type DashboardSectionKey } from "@/components/dashboard/DashboardLayout";
import { BrandSection } from "@/components/dashboard/sections/BrandSection";
import { ThemeSection } from "@/components/dashboard/sections/ThemeSection";
import { HeroSection } from "@/components/dashboard/sections/HeroSection";
import { ProductsSection } from "@/components/dashboard/sections/ProductsSection";
import { QuizSection } from "@/components/dashboard/sections/QuizSection";
import { LeadsSection } from "@/components/dashboard/sections/LeadsSection";
import { ContactSection } from "@/components/dashboard/sections/ContactSection";
import { HelpLinksSection } from "@/components/dashboard/sections/HelpLinksSection";
import { FooterSection } from "@/components/dashboard/sections/FooterSection";
import { ExportSection } from "@/components/dashboard/sections/ExportSection";

const SECTION_MAP: Record<DashboardSectionKey, ReactNode> = {
  marca: <BrandSection />,
  tema: <ThemeSection />,
  hero: <HeroSection />,
  produtos: <ProductsSection />,
  quiz: <QuizSection />,
  leads: <LeadsSection />,
  contato: <ContactSection />,
  ajuda: <HelpLinksSection />,
  rodape: <FooterSection />,
  exportar: <ExportSection />,
};

export default function DashboardPage() {
  const [active, setActive] = useState<DashboardSectionKey>("leads");

  return (
    <DashboardLayout active={active} onChange={setActive}>
      {SECTION_MAP[active]}
    </DashboardLayout>
  );
}
