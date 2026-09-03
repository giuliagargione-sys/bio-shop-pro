import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React/Router ficam num chunk próprio (cache de longa duração) e
          // o cliente do backend só é baixado por quem abre login/dashboard,
          // nunca pela loja pública — isso tira o JS pesado do link da bio.
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          backend: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
