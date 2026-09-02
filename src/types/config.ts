// Schema completo que descreve TUDO que uma aluna pode personalizar.
// Qualquer campo novo que a Giulia quiser adicionar no futuro entra aqui
// e vira automaticamente editavel na dashboard (/personalizar).

export interface ThemeConfig {
  primary: string; // cor principal (botoes, destaques)
  primaryForeground: string; // cor do texto sobre a cor principal
  secondary: string; // cor secundaria (ex: header, footer)
  secondaryForeground: string;
  accent: string; // cor de apoio (badges, fundo do quiz)
  accentForeground: string;
  font: string; // nome da fonte (Google Fonts)
  radius: string; // arredondamento dos cantos, ex "0.75rem"
}

export interface BrandConfig {
  storeName: string;
  tagline: string;
  logoUrl: string;
}

export interface HeroConfig {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  badge: string; // ex: "Mais vendida da semana", "Novidade"
  link: string;
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  resultTitle: string;
  resultDescription: string;
  resultCtaLabel: string;
}

export interface ContactConfig {
  whatsappNumber: string; // formato internacional, ex: 5511999999999
  whatsappDefaultMessage: string;
  buttonLabel?: string; // texto do botao de contato da loja
  whatsappLink?: string; // link completo do WhatsApp (wa.me, chat.whatsapp, etc)
  instagramUrl: string;
  tiktokUrl: string;
}

export interface FooterConfig {
  copyText: string;
}

export interface HelpLinksConfig {
  supportLabel: string;
  supportUrl: string; // ex: link do WhatsApp ou Direct do Instagram
  returnsLabel: string;
  returnsUrl: string; // ex: link de uma pagina/PDF com a politica de trocas
}

export interface LayoutBlock {
  id: string;
  type: "produtos" | "quiz" | "ajuda" | "botao";
  enabled: boolean;
  label?: string; // usado nos blocos do tipo "botao"
  href?: string; // link do botao personalizado
}

export interface LayoutConfig {
  blocks: LayoutBlock[]; // ordem em que as seções aparecem na loja
}

export interface StoreConfig {
  version: number;
  meta: {
    studentName: string;
    updatedAt: string;
  };
  brand: BrandConfig;
  theme: ThemeConfig;
  layout: LayoutConfig;
  hero: HeroConfig;
  products: Product[];
  quiz: QuizConfig;
  contact: ContactConfig;
  helpLinks: HelpLinksConfig;
  footer: FooterConfig;
}
