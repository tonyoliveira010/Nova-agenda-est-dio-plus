import { createFileRoute } from '@tanstack/react-router';
import { PlatformOnboarding } from '@/ustudio/components/home/PlatformOnboarding';
export const Route = createFileRoute('/onboarding')({
  head: () => ({ meta: [
    { title: 'Conheça a Ustudio — Sua barbearia, seu próximo nível' },
    { name: 'description', content: 'Descubra sua vitrine digital, agenda inteligente, catálogo e financeiro para barbearias.' },
    { property: 'og:title', content: 'Conheça a Ustudio — Sua barbearia, seu próximo nível' },
    { property: 'og:description', content: 'Uma apresentação da plataforma para valorizar seu trabalho e organizar sua barbearia.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PlatformOnboarding,
});