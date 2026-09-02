import type { StoreConfig } from "@/types/config";
import { defaultConfig } from "./defaultConfig";

// Lojas de EXEMPLO (dados fixos no código, sem banco).
// Enquanto o Supabase não estiver conectado, a rota /loja/:slug carrega
// automaticamente a identidade, produtos e cores da loja correspondente
// ao slug. Slug desconhecido => "essa loja não existe (ainda)".

function demo(partial: {
  brand: StoreConfig["brand"];
  theme: StoreConfig["theme"];
  hero: Partial<StoreConfig["hero"]>;
  products: StoreConfig["products"];
  quiz?: Partial<StoreConfig["quiz"]>;
  contact: StoreConfig["contact"];
  helpLinks: StoreConfig["helpLinks"];
  footer: StoreConfig["footer"];
  studentName: string;
}): StoreConfig {
  return {
    ...defaultConfig,
    meta: { studentName: partial.studentName, updatedAt: new Date().toISOString() },
    brand: partial.brand,
    theme: partial.theme,
    hero: { ...defaultConfig.hero, ...partial.hero },
    products: partial.products,
    quiz: { ...defaultConfig.quiz, ...partial.quiz },
    contact: partial.contact,
    helpLinks: partial.helpLinks,
    footer: partial.footer,
  };
}

const ateliedaana = demo({
  studentName: "Ana Beatriz",
  brand: {
    storeName: "Ateliê da Ana",
    tagline: "Moda que combina com você",
    logoUrl: "",
  },
  theme: {
    primary: "#e8869c",
    primaryForeground: "#ffffff",
    secondary: "#3a2a2e",
    secondaryForeground: "#ffffff",
    accent: "#fbf3ee",
    accentForeground: "#3a2a2e",
    font: "Poppins",
    radius: "0.75rem",
  },
  hero: {
    headline: "Descubra seu estilo em 1 minuto",
    subheadline: "Peças novas toda semana, escolhidas a dedo pra combinar com você.",
    primaryCtaLabel: "Descobrir meu estilo",
  },
  products: [
    {
      id: "ana-1",
      name: "Vestido Floral Midi",
      imageUrl: "/loja-demo/p1.jpg",
      badge: "Mais vendido",
      link: "https://wa.me/5511999999999?text=Quero%20o%20Vestido%20Floral%20Midi",
    },
    {
      id: "ana-2",
      name: "Blazer Alfaiataria Cru",
      imageUrl: "/loja-demo/p2.jpg",
      badge: "Novidade",
      link: "https://wa.me/5511999999999?text=Quero%20o%20Blazer%20Alfaiataria",
    },
    {
      id: "ana-3",
      name: "Blusa de Cetim Rosé",
      imageUrl: "/loja-demo/p4.jpg",
      badge: "Favorito das clientes",
      link: "https://wa.me/5511999999999?text=Quero%20a%20Blusa%20de%20Cetim",
    },
  ],
  quiz: {
    title: "Descubra seu estilo",
    subtitle: "3 perguntinhas e eu monto uma seleção só pra você.",
  },
  contact: {
    whatsappNumber: "5511999999999",
    buttonLabel: "Falar com a Ana no WhatsApp",
    whatsappLink: "",
    whatsappDefaultMessage: "Oi Ana! Fiz o quiz e quero ver minha seleção 💕",
    instagramUrl: "https://instagram.com/ateliedaana",
    tiktokUrl: "https://tiktok.com/@ateliedaana",
  },
  helpLinks: {
    supportLabel: "Dúvidas? Fale com a gente",
    supportUrl: "https://wa.me/5511999999999",
    returnsLabel: "Trocas e devoluções",
    returnsUrl: "https://wa.me/5511999999999?text=Quero%20falar%20sobre%20trocas",
  },
  footer: { copyText: `© ${new Date().getFullYear()} Ateliê da Ana — todos os direitos reservados` },
});

const useLari = demo({
  studentName: "Larissa Souza",
  brand: {
    storeName: "Use Lari",
    tagline: "Streetwear autoral, feito pra durar",
    logoUrl: "",
  },
  theme: {
    primary: "#7c6ff0",
    primaryForeground: "#ffffff",
    secondary: "#23202e",
    secondaryForeground: "#ffffff",
    accent: "#f4f3fb",
    accentForeground: "#23202e",
    font: "Montserrat",
    radius: "0.25rem",
  },
  hero: {
    headline: "Drop novo toda sexta",
    subheadline: "Peças de rua com caimento certo — produção pequena, nada de repetido.",
    primaryCtaLabel: "Achar meu drop",
  },
  products: [
    {
      id: "lari-1",
      name: "Calça Cargo Preta",
      imageUrl: "/loja-demo/p3.jpg",
      badge: "Drop da semana",
      link: "https://wa.me/5521988888888?text=Quero%20a%20Calça%20Cargo",
    },
    {
      id: "lari-2",
      name: "Blazer Oversized Grafite",
      imageUrl: "/loja-demo/p2.jpg",
      badge: "Últimas peças",
      link: "https://wa.me/5521988888888?text=Quero%20o%20Blazer%20Oversized",
    },
    {
      id: "lari-3",
      name: "Tricot Gola Alta",
      imageUrl: "/loja-demo/p5.jpg",
      badge: "Mais vendido",
      link: "https://wa.me/5521988888888?text=Quero%20o%20Tricot%20Gola%20Alta",
    },
  ],
  quiz: {
    title: "Qual drop é a sua cara?",
    subtitle: "Responda rapidinho que eu te mando as peças certas.",
  },
  contact: {
    whatsappNumber: "5521988888888",
    buttonLabel: "Falar com a Lari no WhatsApp",
    whatsappLink: "",
    whatsappDefaultMessage: "Oi Lari! Fiz o quiz e quero ver as peças 🖤",
    instagramUrl: "https://instagram.com/uselari",
    tiktokUrl: "https://tiktok.com/@uselari",
  },
  helpLinks: {
    supportLabel: "Falar com a Lari",
    supportUrl: "https://wa.me/5521988888888",
    returnsLabel: "Trocas e devoluções",
    returnsUrl: "https://wa.me/5521988888888?text=Quero%20falar%20sobre%20trocas",
  },
  footer: { copyText: `© ${new Date().getFullYear()} Use Lari` },
});

const bohoMarie = demo({
  studentName: "Marie Lopes",
  brand: {
    storeName: "Boho Marie",
    tagline: "Peças leves pra viver o sol",
    logoUrl: "",
  },
  theme: {
    primary: "#d18a5a",
    primaryForeground: "#ffffff",
    secondary: "#3b2f24",
    secondaryForeground: "#ffffff",
    accent: "#faf5ec",
    accentForeground: "#3b2f24",
    font: "Playfair Display",
    radius: "1.25rem",
  },
  hero: {
    headline: "Coleção verão no ar",
    subheadline: "Linho, algodão e tons de terra pra usar do café da manhã ao pôr do sol.",
    primaryCtaLabel: "Montar meu look de verão",
  },
  products: [
    {
      id: "marie-1",
      name: "Vestido Longo Estampado",
      imageUrl: "/loja-demo/p1.jpg",
      badge: "Mais vendido",
      link: "https://wa.me/5531977777777?text=Quero%20o%20Vestido%20Longo",
    },
    {
      id: "marie-2",
      name: "Kimono Tricot Cru",
      imageUrl: "/loja-demo/p5.jpg",
      badge: "Chegou agora",
      link: "https://wa.me/5531977777777?text=Quero%20o%20Kimono",
    },
    {
      id: "marie-3",
      name: "Saia Plissada Terracota",
      imageUrl: "/loja-demo/p6.jpg",
      badge: "Favorito das clientes",
      link: "https://wa.me/5531977777777?text=Quero%20a%20Saia%20Plissada",
    },
  ],
  quiz: {
    title: "Qual look de verão é o seu?",
    subtitle: "3 perguntas e eu separo as peças com você em mente.",
  },
  contact: {
    whatsappNumber: "5531977777777",
    buttonLabel: "Falar com a Marie no WhatsApp",
    whatsappLink: "",
    whatsappDefaultMessage: "Oi Marie! Fiz o quiz e quero ver meu look ☀️",
    instagramUrl: "https://instagram.com/bohomarie",
    tiktokUrl: "https://tiktok.com/@bohomarie",
  },
  helpLinks: {
    supportLabel: "Dúvidas? Chama no WhatsApp",
    supportUrl: "https://wa.me/5531977777777",
    returnsLabel: "Trocas e devoluções",
    returnsUrl: "https://wa.me/5531977777777?text=Quero%20falar%20sobre%20trocas",
  },
  footer: { copyText: `© ${new Date().getFullYear()} Boho Marie` },
});

export const demoStores: Record<string, StoreConfig> = {
  "atelie-da-ana": ateliedaana,
  "use-lari": useLari,
  "boho-marie": bohoMarie,
};

export const demoStoreSlugs = Object.keys(demoStores);

export function getDemoStore(slug: string | undefined): StoreConfig | null {
  if (!slug) return null;
  return demoStores[slug.toLowerCase()] ?? null;
}
