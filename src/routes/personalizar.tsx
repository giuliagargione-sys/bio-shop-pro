import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/personalizar")({
  head: () => ({
    meta: [
      { title: "Personalizar loja — Link Na Bio Que Vende" },
      { name: "description", content: "Edite cores, fontes e produtos da sua loja no link da bio." },
      { property: "og:title", content: "Personalizar loja — Link Na Bio Que Vende" },
      { property: "og:description", content: "Edite cores, fontes e produtos da sua loja no link da bio." },
    ],
  }),
  component: () => <Placeholder title="Personalizar" subtitle="Em construção" />,
});
