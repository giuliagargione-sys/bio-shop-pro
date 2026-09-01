import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Link Na Bio Que Vende" },
      { name: "description", content: "Painel administrativo do Link Na Bio Que Vende." },
      { property: "og:title", content: "Admin — Link Na Bio Que Vende" },
      { property: "og:description", content: "Painel administrativo do Link Na Bio Que Vende." },
    ],
  }),
  component: () => <Placeholder title="Admin" subtitle="Em construção" />,
});
