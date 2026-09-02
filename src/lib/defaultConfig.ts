import { uid } from "./utils";
import { defaultLayoutBlocks } from "./layout";
import type { StoreConfig } from "@/types/config";

// Config inicial, inspirada na estrutura da giustore.netlify.app.
// Cada aluna comeca com isso e personaliza tudo pela dashboard.
export const defaultConfig: StoreConfig = {
  version: 1,
  meta: {
    studentName: "",
    updatedAt: new Date().toISOString(),
  },
  brand: {
    storeName: "Sua Loja",
    tagline: "Moda que combina com o seu estilo",
    logoUrl: "",
  },
  theme: {
    primary: "#6b1b2b",
    primaryForeground: "#fffdf9",
    secondary: "#0b0b0b",
    secondaryForeground: "#fffdf9",
    accent: "#e3ded6",
    accentForeground: "#0b0b0b",
    font: "Epilogue",
    radius: "0.5rem",
  },

  layout: {
    blocks: defaultLayoutBlocks(),
  },
  hero: {
    headline: "Descubra o look ideal para você",
    subheadline: "Peças selecionadas toda semana, feitas pra combinar com o seu jeitão.",
    primaryCtaLabel: "Descobrir meu look",
    primaryCtaHref: "#quiz",
    secondaryCtaLabel: "Ver mais vendidos",
    secondaryCtaHref: "#produtos",
  },
  productsTitle: "Peças em destaque",
  products: [
    {
      id: uid("prod"),
      name: "Conjunto Essencial",
      imageUrl: "",
      badge: "Mais vendido da semana",
      link: "#",
    },
    {
      id: uid("prod"),
      name: "Vestido Novidade",
      imageUrl: "",
      badge: "Chegou agora",
      link: "#",
    },
    {
      id: uid("prod"),
      name: "Look Preferido das Clientes",
      imageUrl: "",
      badge: "Favorito das clientes",
      link: "#",
    },
  ],
  quiz: {
    enabled: true,
    title: "Descubra seu look ideal",
    subtitle: "Responda 3 perguntas rápidas e receba uma sugestão no seu WhatsApp",
    questions: [
      {
        id: uid("q"),
        question: "Para qual ocasião é o seu look?",
        options: [
          { id: uid("opt"), label: "Balada / Sair à noite" },
          { id: uid("opt"), label: "Trabalho / Dia a dia" },
          { id: uid("opt"), label: "Ainda não sei" },
        ],
      },
      {
        id: uid("q"),
        question: "O que mais importa pra você num look?",
        options: [
          { id: uid("opt"), label: "Conforto" },
          { id: uid("opt"), label: "Autoconfiança" },
          { id: uid("opt"), label: "Praticidade" },
        ],
      },
      {
        id: uid("q"),
        question: "Qual o seu tamanho?",
        options: [
          { id: uid("opt"), label: "PP" },
          { id: uid("opt"), label: "P" },
          { id: uid("opt"), label: "M" },
          { id: uid("opt"), label: "G" },
          { id: uid("opt"), label: "GG" },
        ],
      },
    ],
    resultTitle: "Seu look ideal está pronto! ✨",
    resultDescription: "Toca no botão abaixo pra receber a sugestão completa no WhatsApp.",
    resultCtaLabel: "Ver meu look",
  },
  contact: {
    whatsappNumber: "5511999999999",
    whatsappDefaultMessage: "Oi! Acabei de responder o quiz de estilo e quero ver meu look 💕",
    buttonLabel: "Falar no WhatsApp",
    whatsappLink: "",
    instagramUrl: "",
    tiktokUrl: "",
  },
  helpLinks: {
    supportLabel: "Dúvidas? Fale com a gente",
    supportUrl: "",
    returnsLabel: "Trocas e devoluções",
    returnsUrl: "",
  },
  footer: {
    copyText: `© ${new Date().getFullYear()} — feito com carinho`,
  },
};
