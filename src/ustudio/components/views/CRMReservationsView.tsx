// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { localDate } from '../../utils/availability';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Crown,
  Award,
  Medal,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Users,
  Sparkles,
  Car,
  MessageCircle,
  PlayCircle,
  Check,
  XCircle,
  Layers,
  LayoutList,
} from 'lucide-react';

interface CRMReservationsViewProps {
  onBack?: () => void;
}

const STAGES = [
  { id: 'Novo', label: 'Novo / Pendente', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
  { id: 'Confirmado', label: 'Confirmado', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  { id: 'Em Atendimento', label: 'Em Atendimento', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  { id: 'Concluído', label: 'Concluído', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { id: 'Cancelado', label: 'Cancelado', color: 'border-zinc-700 bg-zinc-800/50 text-zinc-400' },
];

export const CRMReservationsView: React.FC<CRMReservationsViewProps> = ({ onBack }) => {
  const {
    clients,
    updateClient,
    setSelectedClientId,
    setIsManualBookingOpen,
    bookingSettings,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedStage, setSelectedStage] = useState<string>('todos');

  const todayStr = localDate();

  // Helper for initials
  const getInitials = (name: string) => {
    return (name || '')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search text
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        (client.name || '').toLowerCase().includes(search) ||
        (client.phone || '').includes(search) ||
        (client.service || '').toLowerCase().includes(search) ||
        (client.vehicleModel || '').toLowerCase().includes(search);

      // Date filter
      const clientDate = client.date || (client.time && client.time.includes(',') ? client.time.split(',')[0].trim() : todayStr);
      let matchDate = true;
      if (dateFilter === 'hoje') {
        matchDate = clientDate === todayStr || (client.time || '').toLowerCase().includes('hoje');
      } else if (dateFilter === 'semana') {
        // Simple 7-day approximation
        matchDate = true;
      }

      // Stage filter for list view
      let matchStage = true;
      if (selectedStage !== 'todos') {
        const clientStatus = client.status || 'Confirmado';
        matchStage = clientStatus.toLowerCase() === selectedStage.toLowerCase();
      }

      return matchSearch && matchDate && matchStage;
    });
  }, [clients, searchTerm, dateFilter, selectedStage, todayStr]);

  // KPIs
  const totalCount = clients.length;
  const todayCount = clients.filter(
    (c) => (c.date && c.date === todayStr) || (c.time && c.time.toLowerCase().includes('hoje'))
  ).length;
  const vipCount = clients.filter((c) => c.vip || c.tier === 'vip' || c.tier === 'ouro').length;
  const completedCount = clients.filter((c) => (c.status || '').toLowerCase() === 'concluído').length;

  const handleUpdateStatus = (clientId: string, newStatus: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    updateClient({
      ...client,
      status: newStatus as any,
    });
    showToast(`Status de ${client.name} atualizado para ${newStatus}`);
  };

  const getNextStage = (currentStatus?: string) => {
    const status = currentStatus || 'Confirmado';
    if (status === 'Novo' || status === 'Pendente') return 'Confirmado';
    if (status === 'Confirmado') return 'Em Atendimento';
    if (status === 'Em Atendimento') return 'Concluído';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#fafafa] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Reservas & CRM</h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-bold">
                Funil
              </span>
            </div>
            <p className="text-[11px] text-white/50">Gestão e relacionamento de clientes</p>
          </div>
        </div>

        <button
          onClick={() => setIsManualBookingOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Novo</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
            <span className="text-[10px] text-white/50 uppercase font-bold block">Total</span>
            <b className="text-lg font-extrabold text-white">{totalCount}</b>
          </div>
          <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
            <span className="text-[10px] text-sky-400 uppercase font-bold block">Hoje</span>
            <b className="text-lg font-extrabold text-sky-300">{todayCount}</b>
          </div>
          <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">VIP/Ouro</span>
            <b className="text-lg font-extrabold text-amber-300">{vipCount}</b>
          </div>
          <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Concluídos</span>
            <b className="text-lg font-extrabold text-emerald-300">{completedCount}</b>
          </div>
        </div>

        {/* Search & Mode Switcher */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, WhatsApp, serviço..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-white placeholder-white/30 text-xs font-medium focus:outline-none focus:border-sky-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Date filter pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'hoje', label: 'Hoje' },
                { id: 'semana', label: 'Esta Semana' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDateFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                    dateFilter === tab.id
                      ? 'bg-white text-black'
                      : 'bg-[#181818] text-white/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex p-0.5 rounded-full bg-[#181818] border border-white/10 flex-shrink-0">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                title="Modo Funil / Kanban"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                title="Modo Lista"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* KANBAN PIPELINE VIEW */}
        {viewMode === 'kanban' && (
          <div className="space-y-4">
            <p className="text-[11px] text-white/40 flex items-center gap-1.5">
              <span>Etapas do atendimento: use os botões rápidos para avançar clientes pelo funil.</span>
            </p>

            <div className="space-y-4">
              {STAGES.map((stage) => {
                const stageClients = filteredClients.filter((c) => {
                  const s = c.status || 'Confirmado';
                  return s.toLowerCase() === stage.id.toLowerCase();
                });

                return (
                  <div key={stage.id} className="rounded-3xl bg-[#121212] border border-white/10 p-3.5 space-y-3">
                    {/* Stage Header */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[2].replace('text-', 'bg-')}`} />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stage.label}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px]">
                        {stageClients.length}
                      </span>
                    </div>

                    {/* Stage Cards */}
                    {stageClients.length === 0 ? (
                      <div className="py-4 text-center rounded-2xl border border-dashed border-white/5 text-[11px] text-white/30 italic">
                        Nenhum atendimento nesta etapa
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {stageClients.map((client) => {
                          const next = getNextStage(client.status);
                          const cleanPhone = (client.phone || '').replace(/\D/g, '');
                          const waUrl = cleanPhone
                            ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                                `Olá ${client.name}! Entrando em contato sobre seu agendamento no ${client.service || 'estúdio'}.`
                              )}`
                            : null;

                          return (
                            <div
                              key={client.id}
                              className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-sm"
                            >
                              {/* Top row: Avatar + Name + Tier */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                                    {getInitials(client.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <b className="text-xs font-bold text-white truncate block">{client.name}</b>
                                      {/* Tier Badge */}
                                      {(client.tier === 'vip' || client.vip) && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-black text-[9px] font-extrabold uppercase">
                                          <Crown className="w-2.5 h-2.5 fill-black" />
                                          VIP
                                        </span>
                                      )}
                                      {client.tier === 'ouro' && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-yellow-400 text-black text-[9px] font-extrabold uppercase">
                                          <Award className="w-2.5 h-2.5 fill-black" />
                                          OURO
                                        </span>
                                      )}
                                      {client.tier === 'bronze' && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[9px] font-extrabold uppercase">
                                          <Medal className="w-2.5 h-2.5 fill-white" />
                                          BRONZE
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-white/50 block truncate">
                                      {client.service} · {client.duration || '45 min'}
                                    </span>
                                  </div>
                                </div>

                                <span className="px-2 py-0.5 rounded-full bg-black/40 text-sky-300 font-bold text-xs border border-sky-500/20 flex-shrink-0">
                                  {client.price}
                                </span>
                              </div>

                              {/* Middle: Date, Time & Vehicle/Notes */}
                              <div className="flex items-center justify-between text-[11px] text-white/60 bg-black/30 p-2 rounded-xl">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-white/40" />
                                  <span>{client.time}</span>
                                </span>

                                {client.vehicleModel ? (
                                  <span className="flex items-center gap-1 text-sky-400">
                                    <Car className="w-3 h-3" />
                                    <span>{client.vehicleModel}</span>
                                  </span>
                                ) : (
                                  <span className="text-white/40">Cliente agendado</span>
                                )}
                              </div>

                              {/* Actions row */}
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                  {waUrl && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                                      title="Abrir WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  <button
                                    onClick={() => setSelectedClientId(client.id)}
                                    className="px-2.5 py-1 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-white/70 hover:text-white text-[11px] font-semibold transition-colors"
                                  >
                                    Ver ficha
                                  </button>
                                </div>

                                {/* Advance stage button */}
                                {next && (
                                  <button
                                    onClick={() => handleUpdateStatus(client.id, next)}
                                    className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <span>{next}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {client.status === 'Concluído' && (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    Finalizado
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {/* Stage filter pills for list view */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedStage('todos')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  selectedStage === 'todos' ? 'bg-white text-black' : 'bg-[#141414] text-white/50'
                }`}
              >
                Todas etapas ({filteredClients.length})
              </button>
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStage(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                    selectedStage === s.id ? 'bg-white text-black' : 'bg-[#141414] text-white/50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#141414] border border-white/5 text-white/40">
                Nenhum atendimento encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => {
                  const status = client.status || 'Confirmado';
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 hover:bg-[#1a1a1a] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#242424] border border-white/10 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <b className="text-xs font-bold text-white truncate block">{client.name}</b>
                            {client.vip && (
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase">
                                VIP
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-white/50 block truncate">
                            {client.service} · {client.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-[#202020] text-xs font-bold text-white">
                          {status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
