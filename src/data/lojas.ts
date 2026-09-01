import type { CSSProperties } from "react";

import heroAna from "@/assets/loja/hero.jpg";
import anaP1 from "@/assets/loja/p1.jpg";
import anaP2 from "@/assets/loja/p2.jpg";
import anaP3 from "@/assets/loja/p3.jpg";
import anaP4 from "@/assets/loja/p4.jpg";
import anaP5 from "@/assets/loja/p5.jpg";
import anaP6 from "@/assets/loja/p6.jpg";

export interface Produto {
  img: string;
  nome: string;
  preco: string;
  selo: string | null;
}

export interface Loja {
  slug: string;
  nome: string;
  frase: string;
  heroTag: string;
  hero: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  trocas: string;
  selecaoTitulo: string;
  produtos: Produto[];
  tema: CSSProperties;
}

export const lojas: Record<string, Loja> = {
  "atelie-da-ana": {
    slug: "atelie-da-ana",
    nome: "Ateliê da Ana",
    frase: "Moda que combina com você",
    heroTag: "Coleção nova toda semana",
    hero: heroAna,
    instagram: "https://instagram.com/ateliedaana",
    tiktok: "https://tiktok.com/@ateliedaana",
    whatsapp: "https://wa.me/5511999999999",
    trocas: "https://wa.me/5511999999999?text=Quero%20falar%20sobre%20trocas",
    selecaoTitulo: "Seleção da Ana",
    produtos: [
      { img: anaP1, nome: "Vestido Floral Midi", preco: "R$ 189,90", selo: "Mais vendido" },
      { img: anaP2, nome: "Blazer Alfaiataria Cru", preco: "R$ 259,90", selo: null },
      { img: anaP3, nome: "Calça Wide Leg Jeans", preco: "R$ 219,90", selo: "Últimas peças" },
      { img: anaP4, nome: "Blusa de Cetim Rosé", preco: "R$ 139,90", selo: null },
      { img: anaP5, nome: "Cardigã Tricot Caramelo", preco: "R$ 179,90", selo: "Mais vendido" },
      { img: anaP6, nome: "Saia Plissada Rosé", preco: "R$ 199,90", selo: null },
    ],
    tema: {
      "--loja-primary": "#E8869C",
      "--loja-secondary": "#C4536B",
      "--loja-accent": "#D4A24C",
      "--loja-bg": "#FBF3EE",
      "--loja-ink": "#3A2A2E",
      "--loja-font": "'Poppins', 'Inter', sans-serif",
    } as CSSProperties,
  },

  "use-lari": {
    slug: "use-lari",
    nome: "Use Lari",
    frase: "Streetwear autoral, feito pra durar",
    heroTag: "Drop novo toda sexta",
    hero: anaP2,
    instagram: "https://instagram.com/uselari",
    tiktok: "https://tiktok.com/@uselari",
    whatsapp: "https://wa.me/5521988888888",
    trocas: "https://wa.me/5521988888888?text=Quero%20falar%20sobre%20trocas",
    selecaoTitulo: "Favoritos da Lari",
    produtos: [
      { img: anaP3, nome: "Calça Cargo Preta", preco: "R$ 229,90", selo: "Drop novo" },
      { img: anaP6, nome: "Saia Midi Reta", preco: "R$ 159,90", selo: null },
      { img: anaP2, nome: "Blazer Oversized Grafite", preco: "R$ 289,90", selo: "Últimas peças" },
      { img: anaP4, nome: "Cropped Canelado Off", preco: "R$ 99,90", selo: null },
      { img: anaP5, nome: "Tricot Gola Alta", preco: "R$ 189,90", selo: "Mais vendido" },
      { img: anaP1, nome: "Vestido Tubo Preto", preco: "R$ 209,90", selo: null },
    ],
    tema: {
      "--loja-primary": "#7C6FF0",
      "--loja-secondary": "#5B4FD0",
      "--loja-accent": "#F0C86F",
      "--loja-bg": "#F4F3FB",
      "--loja-ink": "#23202E",
      "--loja-font": "'Poppins', 'Inter', sans-serif",
    } as CSSProperties,
  },

  "boho-marie": {
    slug: "boho-marie",
    nome: "Boho Marie",
    frase: "Peças leves pra viver o sol",
    heroTag: "Coleção verão no ar",
    hero: anaP5,
    instagram: "https://instagram.com/bohomarie",
    tiktok: "https://tiktok.com/@bohomarie",
    whatsapp: "https://wa.me/5531977777777",
    trocas: "https://wa.me/5531977777777?text=Quero%20falar%20sobre%20trocas",
    selecaoTitulo: "Escolhas da Marie",
    produtos: [
      { img: anaP1, nome: "Vestido Longo Estampado", preco: "R$ 219,90", selo: "Mais vendido" },
      { img: anaP4, nome: "Blusa Cropped de Linho", preco: "R$ 119,90", selo: null },
      { img: anaP6, nome: "Saia Plissada Terracota", preco: "R$ 179,90", selo: null },
      { img: anaP5, nome: "Kimono Tricot Cru", preco: "R$ 199,90", selo: "Novo" },
      { img: anaP3, nome: "Pantalona Pantalona Areia", preco: "R$ 189,90", selo: null },
      { img: anaP2, nome: "Colete Alfaiataria Natural", preco: "R$ 169,90", selo: "Últimas peças" },
    ],
    tema: {
      "--loja-primary": "#D18A5A",
      "--loja-secondary": "#A9663C",
      "--loja-accent": "#7C9A6D",
      "--loja-bg": "#FAF5EC",
      "--loja-ink": "#3B2F24",
      "--loja-font": "'Poppins', 'Inter', sans-serif",
    } as CSSProperties,
  },
};

export function getLoja(slug: string): Loja | undefined {
  return lojas[slug];
}
