// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Crown,
  Calendar,
  MessageCircle,
  Clock,
  DollarSign,
  Trash2,
  CheckCircle2,
  Award,
  Medal,
  Shield,
  Sparkles,
  Percent,
} from 'lucide-react';

const TIERS = [
  { id: 'padrao', label: 'Padrão', desc: 'Sem selo', color: 'bg-white/10 text-white/70 border-white/10' },
  { id: 'bronze', label: 'Bronze', desc: 'Bronze', color: 'bg-amber-900/40 text-amber-300 border-amber-600/40' },
  { id: 'ouro', label: 'Ouro', desc: 'Ouro', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'vip', label: 'VIP', desc: 'VIP', color: 'bg-[#ffb020]/25 text-[#ffb020] border-[#ffb020]/50' },
];

export const ClientModal: React.FC = () => {
  const {
    selectedClientId,
    setSelectedClientId,
    clients,
    updateClient,
    cancelAppointment,
    setReschedulingClientId,
    updateClientNotes,
    bookingSettings,
  } = useApp();

  const client = clients.find((c) => c.id === selectedClientId);

  const [notes, setNotes] = useState(client?.notes || '');

  useEffect(() => {
    if (client) {
      setNotes(client.notes || '');
    }
  }, [client]);

  if (!selectedClientId || !client) return null;

  const currentTier = client.tier || (client.vip ? 'vip' : 'padrao');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleStartReschedule = () => {
    setReschedulingClientId(client.id);
    setSelectedClientId(null);
  };

  const handleSaveNotes = () => {
    updateClientNotes(client.id, notes.trim());
  };

  const digits = client.phone.replace(/\D/g, '');
  const cleanPhone = digits.length <= 11 ? `55${digits}` : digits;
  const whatsappMessage = encodeURIComponent(
    `Olá ${client.name.split(' ')[0]}! Tudo bem? Aqui é da Barbearia. Confirmando seu atendimento de ${client.service} para ${client.time}. Qualquer dúvida estamos à disposição!`
  );
  const whatsappUrl = digits ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}` : '#';

  // Loyalty calculations
  const parsePrice = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const minRequired = bookingSettings?.loyaltyMinBookings ?? 5;
  const discountPercent = bookingSettings?.loyaltyDiscountPercent ?? 10;
  const appointmentsCount = client.appointmentsCount ?? (clients.filter((c) => c.phone && c.phone === client.phone).length || 1);
  const isEligible = !!bookingSettings?.loyaltyDiscountEnabled && appointmentsCount >= minRequired;
  const basePrice = parsePrice(client.price);
  const discountAmount = isEligible ? (basePrice * discountPercent) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setSelectedClientId(null)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-base text-white flex-shrink-0 shadow-md">
              {getInitials(client.name)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-white">{client.name}</h3>

                {/* Tier Badge */}
                {currentTier === 'vip' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-black text-[10px] font-extrabold uppercase shadow-sm">
                    <Crown className="w-2.5 h-2.5 fill-black" />
                    VIP
                  </span>
                )}
                {currentTier === 'ouro' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-extrabold uppercase shadow-sm">
                    <Award className="w-2.5 h-2.5 fill-black" />
                    OURO
                  </span>
                )}
                {currentTier === 'bronze' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-extrabold uppercase shadow-sm">
                    <Medal className="w-2.5 h-2.5 fill-white" />
                    BRONZE
                  </span>
                )}
                {currentTier === 'padrao' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-semibold">
                    PADRÃO
                  </span>
                )}
              </div>
              <span className="text-xs text-white/55 block mt-0.5">{client.service}</span>
            </div>
          </div>

          <button
            onClick={() => setSelectedClientId(null)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 text-xs">
          {/* Seletor de Categoria de Cliente: VIP, Ouro, Bronze, Padrão */}
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                Nível de fidelidade do cliente
              </span>
              <span className="text-[10px] text-white/50">Toque para selecionar</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {TIERS.map((t) => {
                const active = currentTier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      updateClient({
                        ...client,
                        tier: t.id,
                        vip: t.id === 'vip',
                      });
                    }}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      active
                        ? `${t.color} font-bold ring-2 ring-white/20 shadow-md scale-[1.02]`
                        : 'bg-[#262626] border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {t.id === 'vip' && <Crown className="w-3.5 h-3.5 text-[#ffb020] fill-[#ffb020]" />}
                      {t.id === 'ouro' && <Award className="w-3.5 h-3.5 text-yellow-400" />}
                      {t.id === 'bronze' && <Medal className="w-3.5 h-3.5 text-amber-500" />}
                      {t.id === 'padrao' && <Shield className="w-3.5 h-3.5 text-white/40" />}
                    </div>
                    <span className="text-[11px] block font-semibold leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regra de Desconto por Fidelidade */}
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Desconto por Agendamentos
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#262626] px-2 py-0.5 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => updateClient({ ...client, appointmentsCount: Math.max(0, appointmentsCount - 1) })}
                  className="w-4 h-4 text-white/60 hover:text-white flex items-center justify-center font-bold"
                  title="Diminuir agendamentos"
                >
                  -
                </button>
                <span className="text-[11px] font-bold text-white px-1">
                  {appointmentsCount} {appointmentsCount === 1 ? 'agendamento' : 'agendamentos'}
                </span>
                <button
                  type="button"
                  onClick={() => updateClient({ ...client, appointmentsCount: appointmentsCount + 1 })}
                  className="w-4 h-4 text-white/60 hover:text-white flex items-center justify-center font-bold"
                  title="Aumentar agendamentos"
                >
                  +
                </button>
              </div>
            </div>

            {bookingSettings?.loyaltyDiscountEnabled ? (
              isEligible ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Desconto de {discountPercent}% aplicado!
                    </span>
                    <span className="text-xs font-extrabold text-emerald-300">
                      -R$ {discountAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-tight">
                    Cliente atingiu a regra de {minRequired} agendamentos cadastrados.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-emerald-500/20">
                    <span className="text-white/60 line-through">{client.price}</span>
                    <span className="text-sm font-extrabold text-white">
                      R$ {finalPrice.toFixed(2).replace('.', ',')} com desconto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#262626] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60">
                      Meta para {discountPercent}% de desconto:
                    </span>
                    <span className="font-bold text-white">
                      {appointmentsCount} de {minRequired} agendamentos
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#2f7dff] rounded-full transition-all"
                      style={{ width: `${Math.min(100, (appointmentsCount / minRequired) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40 block">
                    Faltam {Math.max(0, minRequired - appointmentsCount)} agendamento(s) para liberar o desconto automático.
                  </span>
                </div>
              )
            ) : (
              <div className="p-2.5 rounded-xl bg-[#262626] border border-white/5 text-[11px] text-white/50">
                Regra de desconto por recorrência desativada nas configurações.
              </div>
            )}
          </div>

          {/* Dados do Agendamento */}
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
              Dados do agendamento
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#262626]">
                <span className="text-[10px] text-white/40 block">Data & Horário</span>
                <span className="text-xs font-bold text-white block mt-0.5">{client.time}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#262626]">
                <span className="text-[10px] text-white/40 block">Duração & Valor</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {client.duration} · {isEligible ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : client.price}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#262626]">
                <span className="text-[10px] text-white/40 block">Telefone</span>
                <span className="text-xs font-bold text-white block mt-0.5">{client.phone}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#262626]">
                <span className="text-[10px] text-white/40 block">Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{client.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Botão de WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Conversar no WhatsApp com {client.name.split(' ')[0]}</span>
          </a>

          {/* Observações */}
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Observações do atendimento
              </span>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="text-[11px] font-bold text-[#2f7dff] hover:underline"
              >
                Salvar notas
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências do cliente, histórico de cortes, produtos ou cuidados da sessão..."
              rows={3}
              className="w-full p-2.5 rounded-xl bg-[#262626] border border-white/10 text-white placeholder-white/30 text-xs leading-relaxed focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => cancelAppointment(client.id)}
              className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancelar agendamento</span>
            </button>
            <button
              onClick={handleStartReschedule}
              className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reagendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
