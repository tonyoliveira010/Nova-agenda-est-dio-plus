import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import App from "@/ustudio/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ustudio Barbearia — Gestão e Agenda" },
      { name: "description", content: "Agenda, serviços, clientes e pagamentos da Ustudio Barbearia em um só lugar." },
      { property: "og:title", content: "Ustudio Barbearia — Gestão e Agenda" },
      { property: "og:description", content: "Agenda, serviços, clientes e pagamentos da Ustudio Barbearia em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <App />
    </ClientOnly>
  );
}
