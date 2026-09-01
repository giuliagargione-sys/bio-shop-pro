import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Cores neutras fixas (nao editaveis pela aluna) — definidas como
        // valores literais para que os modificadores de opacidade do
        // Tailwind (ex: bg-background/90) funcionem corretamente.
        border: "#e5e5e5",
        background: "#ffffff",
        foreground: "#1a1a1a",
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        // Cores de marca — controladas pela dashboard de personalizacao via
        // variaveis CSS (ver ConfigContext). Nao usar modificadores de
        // opacidade (ex: bg-primary/40) nestas, pois var() resolve para um
        // hex completo e o Tailwind nao consegue aplicar alpha sobre isso.
        primary: {
          DEFAULT: "var(--brand-primary)",
          foreground: "var(--brand-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--brand-secondary)",
          foreground: "var(--brand-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--brand-accent)",
          foreground: "var(--brand-accent-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        brand: ["var(--brand-font)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
