// @ts-nocheck -- ported app uses browser-only state
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, CreditCard, Gift, Package, Scissors, Store, TrendingUp } from 'lucide-react';

const steps = [
  {
    kicker: 'Comece por aqui',
    title: 'Sua barbearia em um só lugar',
    text: 'Organize a vitrine, a agenda e o movimento do dia direto pelo celular.',
    icon: Scissors,
    points: ['Apresente cortes, barba e produtos', 'Receba pedidos de horário pelo seu link'],
  },
  {
    kicker: 'Vitrine pública',
    title: 'Mostre seu trabalho',
    text: 'Monte uma página clara para o cliente conhecer seus serviços antes de agendar.',
    icon: Store,
    points: ['Escolha o formato dos serviços', 'Personalize capa, contatos e localização'],
  },
  {
    kicker: 'Serviços e produtos',
    title: 'Organize seu catálogo',
    text: 'Cadastre cortes, barba, combos e produtos com preço, duração, foto e descrição.',
    icon: Package,
    points: ['Separe serviços e produtos', 'Edite preços sempre que precisar'],
  },
  {
    kicker: 'Agendamento online',
    title: 'Transforme visitas em horários',
    text: 'Cada serviço da sua vitrine abre um fluxo simples para o cliente escolher dia e hora.',
    icon: CalendarDays,
    points: ['Defina antecedência e intervalos', 'Receba os dados do cliente organizados'],
  },
  {
    kicker: 'Agenda do dia',
    title: 'Tenha o dia sob controle',
    text: 'Acompanhe clientes, horários livres e detalhes de cada atendimento em uma única visão.',
    icon: CalendarDays,
    points: ['Reagende com poucos toques', 'Bloqueie horários quando precisar'],
  },
  {
    kicker: 'Financeiro',
    title: 'Acompanhe cada resultado',
    text: 'Veja faturamento, atendimentos e ticket médio em períodos diferentes.',
    icon: CreditCard,
    points: ['Compare o movimento da barbearia', 'Identifique os serviços mais procurados'],
  },
  {
    kicker: 'Indicações',
    title: 'Cresça com sua rede',
    text: 'Prepare sua presença digital para compartilhar a barbearia e conquistar novos clientes.',
    icon: Gift,
    points: ['Compartilhe seu link público', 'Divulgue promoções e novidades'],
  },
];

export const PlatformOnboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const current = steps[step] || steps[0];
  const Icon = current.icon;
  return <main className="studio-theme min-h-screen bg-background text-foreground">
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between"><b className="text-xl">Ustudio<span className="text-primary">.</span></b></header>
      <div className="mt-6 flex gap-2" aria-label={`Etapa ${step + 1} de 7`}>{steps.map((_, i) => <button key={i} onClick={() => setStep(i)} aria-label={`Ir para etapa ${i + 1}`} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />)}</div>
      <section className="flex flex-1 flex-col justify-center py-8">
        <div className="mb-6 flex h-24 items-center text-primary"><Icon className="h-20 w-20 stroke-[1.25]" /></div>
        <span className="text-xs font-semibold uppercase text-primary">{current.kicker} · {step + 1}/7</span>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{current.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{current.text}</p>
        <div className="mt-6 space-y-3">{current.points.map(point => <p key={point} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 flex-none text-primary" />{point}</p>)}</div>
        {step === 2 && <p className="mt-4 text-xs text-muted-foreground">Catálogo: R$ 12,90/mês para até 10 produtos · reserva e pagamento no ato.</p>}
        {step === 6 && <div className="mt-6 border-t border-border pt-4"><h2 className="font-semibold">Seu próximo passo</h2>{['Criar sua conta', 'Valorizar seu perfil com fotos', 'Cadastrar cortes, barba e combos', 'Definir atendimento e compartilhar seu link'].map(item => <p key={item} className="mt-2 flex gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4" />{item}</p>)}<p className="mt-3 text-xs text-muted-foreground">Banners promocionais: R$ 4,90/mês. Assinaturas e integrações de pagamento em breve.</p></div>}
      </section>
      <footer className="space-y-4 pb-4"><div className="flex gap-3">{step > 0 && <Button variant="outline" size="icon" aria-label="Voltar" onClick={() => setStep(step - 1)}><ChevronLeft /></Button>}{step < 6 ? <Button className="flex-1" onClick={() => setStep(step + 1)}>Continuar<ChevronRight /></Button> : <Button className="flex-1" asChild><Link to="/auth">Começar agora</Link></Button>}</div><p className="text-center text-xs text-muted-foreground">Mais presença. Mais organização. Mais tempo para seu talento.</p></footer>
    </div>
  </main>;
};
