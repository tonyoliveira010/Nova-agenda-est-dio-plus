import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { AdminProspectingMap } from "@/ustudio/components/admin/AdminProspectingMap";

export const Route = createFileRoute("/adm")({
  head: () => ({
    meta: [
      { title: "Painel do Administrador · Mapa de Prospecção Campinas — Ustudio" },
      { name: "description", content: "Mapeamento geoespacial e CRM de prospecção de barbearias e estética automotiva em Campinas (SP)." },
      { property: "og:title", content: "Painel do Administrador · Mapa de Prospecção Campinas" },
      { property: "og:description", content: "Mapeamento e prospecção de usuários e estabelecimentos em Campinas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdmPage,
});

function AdmPage() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#ffffff] flex items-center justify-center text-[#707070] text-xs">Carregando painel administrativo...</div>}>
      <AdminProspectingMap />
    </ClientOnly>
  );
}
