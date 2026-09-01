import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/loja/$slug")({
  head: () => ({
    meta: [
      { title: "Loja — Link Na Bio Que Vende" },
      { name: "description", content: "Loja criada com o Link Na Bio Que Vende." },
      { property: "og:title", content: "Loja — Link Na Bio Que Vende" },
      { property: "og:description", content: "Loja criada com o Link Na Bio Que Vende." },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  const { slug } = Route.useParams();
  return <Placeholder title={`Loja /${slug}`} subtitle="Em construção" />;
}
