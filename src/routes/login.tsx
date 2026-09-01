import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Link Na Bio Que Vende" },
      { name: "description", content: "Acesse sua dashboard do Link Na Bio Que Vende." },
      { property: "og:title", content: "Entrar — Link Na Bio Que Vende" },
      { property: "og:description", content: "Acesse sua dashboard do Link Na Bio Que Vende." },
    ],
  }),
  component: () => <Placeholder title="Entrar" subtitle="Em construção" />,
});
