// @ts-nocheck -- ported as-is from the original AI Studio project
import React from 'react';
import { useApp } from '../../context/AppContext';

import {
  ExternalLink,
  MapPin,
  ChevronRight,
  Crown,
  Award,
  Medal,
  Calendar,
  Sparkles,
  TrendingUp,
  CreditCard,
  Globe,
  Clock,
  SlidersHorizontal,
  Users,
  Compass,
  ShoppingBag,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    clients,
    profile,
    productReservations,
    saveProfile,
    showToast,
    setActiveTab,
    setIsStorefrontOpen,
    setIsPaymentConfigOpen,
    setIsHoursConfigOpen,
    setIsBookingRulesOpen,
    setSelectedClientId,
  } = useApp();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Platform Functional Category Blocks (Clean Icons, size 70px)
  const platformFunctions = [
    {
      id: 'agenda',
      label: 'Agenda',
      icon: <Calendar className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setActiveTab('agenda'),
    },
    {
      id: 'servicos',
      label: 'Catálogo',
      icon: <Sparkles className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setActiveTab('services'),
    },
    {
      id: 'dashboard',
      label: 'Financeiro',
      icon: <TrendingUp className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setActiveTab('dashboard'),
    },
    {
      id: 'pagamento',
      label: 'Pagamentos',
      icon: <CreditCard className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setIsPaymentConfigOpen(true),
    },
    {
      id: 'horarios',
      label: 'Horários',
      icon: <Clock className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setIsHoursConfigOpen(true),
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: <SlidersHorizontal className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setIsBookingRulesOpen(true),
    },
    {
      id: 'storefront',
      label: 'Site público',
      icon: <Globe className="w-6 h-6 stroke-[1.8] text-white" />,
      action: () => setIsStorefrontOpen(true),
    },
    {
      id: 'adm_map',
      label: 'Mapa ADM',
      icon: <Compass className="w-6 h-6 stroke-[1.8] text-sky-400" />,
      action: () => {
        window.location.href = '/adm';
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Subheader Meta */}
      <div className="flex items-center justify-between px-5 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <MapPin className="w-3.5 h-3.5 text-[#2f7dff]" />
          <span>São Paulo · Studio Ativo</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161616] border border-white/10 text-xs font-medium text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2f7dff] animate-pulse" />
          <span>Agenda aberta</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 p-6 sm:p-7 rounded-[24px] bg-gradient-to-br from-[#00c2ff] via-[#0284c7] to-[#0f172a] text-white relative overflow-hidden shadow-xl shadow-sky-950/40">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold text-white/85 uppercase tracking-wider mb-2.5">
            Seu perfil está no ar
          </p>
          <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight mb-2 max-w-[18ch]">
            Um link só, com todos os seus serviços.
          </h2>
          <p className="text-sm font-normal text-white/90 leading-relaxed mb-5 max-w-[32ch]">
            Monte seu catálogo, compartilhe o link e organize agendamentos e reservas para pagar no ato.
          </p>
          <button
            onClick={() => setIsStorefrontOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-md"
          >
            <span>Ver meu site público</span>
            <ExternalLink className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      <section className="px-5 space-y-3">
        <button onClick={() => setActiveTab('dashboard')} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary p-4 text-left"><TrendingUp className="h-5 w-5" /><span><b className="block text-sm">Dashboard financeiro</b><span className="text-xs text-muted-foreground">Faturamento, previsão e ticket médio</span></span><ChevronRight className="ml-auto h-4 w-4" /></button>
        <button onClick={() => setIsPaymentConfigOpen(true)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary p-4 text-left"><CreditCard className="h-5 w-5" /><span><b className="block text-sm">Configurar pagamentos · Em breve</b><span className="text-xs text-muted-foreground">InfinitePay e Pix via API</span></span><ChevronRight className="ml-auto h-4 w-4" /></button>

        {/* Página de Reservas dos Produtos (Disponível com Catálogo de Produtos) */}
        {profile.catalogDemo ? (
          <button
            onClick={() => setActiveTab('product-reservations')}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/30 via-[#161616] to-[#121212] p-4 text-left hover:border-emerald-500/50 hover:bg-[#1a1a1a] transition-all group shadow-lg shadow-emerald-950/20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b className="text-sm font-bold text-white block">Reservas de Produtos</b>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                  {productReservations.filter((r) => r.status !== 'Entregue' && r.status !== 'Cancelado').length} Pendentes
                </span>
              </div>
              <span className="text-xs text-white/50 block truncate mt-0.5">
                Pedidos reservados no catálogo para retirada e pagamento no balcão
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        ) : (
          <div className="flex w-full items-center gap-3.5 rounded-2xl border border-white/10 bg-[#141414] p-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 flex-shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b className="text-sm font-semibold text-white/60 block">Reservas de Produtos</b>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-[10px] font-bold">
                  Requer Catálogo
                </span>
              </div>
              <span className="text-xs text-white/40 block truncate mt-0.5">
                Disponível ao ativar o Catálogo de Produtos da loja
              </span>
            </div>
            <button
              onClick={() => {
                saveProfile({ catalogDemo: true });
                showToast('Catálogo de produtos ativado!');
              }}
              className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-sm flex-shrink-0"
            >
              Ativar
            </button>
          </div>
        )}
      </section>

      {/* Categorias / Funções da Plataforma (Ícone clean tamanho 70px) */}
      <section className="px-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-base font-bold text-white tracking-tight">Categorias & Funções</h3>
          <span className="text-xs text-white/45">Atalhos da plataforma</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {platformFunctions.map((fn) => (
            <button
              key={fn.id}
              onClick={fn.action}
              className="flex-shrink-0 flex flex-col items-center group transition-transform active:scale-95"
            >
              <div className="w-[70px] h-[70px] rounded-2xl bg-[#161616] border border-white/10 group-hover:bg-[#1e1e1e] group-hover:border-white/25 flex items-center justify-center transition-all shadow-sm">
                {fn.icon}
              </div>
              <span className="text-[11.5px] font-semibold text-white/75 group-hover:text-white mt-1.5 transition-colors text-center truncate max-w-[76px]">
                {fn.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="px-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Próximos agendamentos</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e1e1e] text-white/60">
              {clients.length} hoje
            </span>
          </div>
          <button
            onClick={() => setActiveTab('agenda')}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-2.5">
          {clients.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#161616] border border-white/10 text-center">
              <p className="text-sm text-white/60">Nenhum atendimento na fila hoje.</p>
              <button
                onClick={() => setActiveTab('agenda')}
                className="mt-3 text-xs font-semibold text-[#2f7dff] hover:underline"
              >
                Abrir agenda para agendar
              </button>
            </div>
          ) : (
            clients.map((client) => {
              const timeDisplay = client.time.includes(',')
                ? client.time.split(',')[1].trim().split('—')[0].trim()
                : client.time;

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full p-3.5 rounded-2xl bg-[#161616] border border-white/10 hover:bg-[#1e1e1e] hover:border-white/20 transition-all flex items-center gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center font-bold text-sm text-white flex-shrink-0 border border-white/10">
                    {getInitials(client.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{client.name}</span>
                      {(client.tier === 'vip' || (client.vip && !client.tier)) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#ffb020] text-black text-[10px] font-extrabold uppercase tracking-wider">
                          <Crown className="w-2.5 h-2.5 fill-black" />
                          VIP
                        </span>
                      )}
                      {client.tier === 'ouro' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-extrabold uppercase tracking-wider">
                          <Award className="w-2.5 h-2.5 fill-black" />
                          OURO
                        </span>
                      )}
                      {client.tier === 'bronze' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          <Medal className="w-2.5 h-2.5 fill-white" />
                          BRONZE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/55 truncate mt-0.5">
                      {client.service} · {client.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#262626] text-xs font-semibold text-white/90">
                      {timeDisplay}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
