// @ts-nocheck -- ported as-is from the original AI Studio project
import { localDate, availableSlots, durationMinutes } from '../../utils/availability';
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Crown, Award, Medal, UserCheck, Sparkles, Car, Check } from 'lucide-react';

export const ManualBookingModal: React.FC = () => {
  const {
    isManualBookingOpen,
    setIsManualBookingOpen,
    services,
    clients,
    addClientBooking,
    workingHours,
    bookingSettings,
    daySchedule,
    openCongratulations,
    showToast,
  } = useApp();

  const [date, setDate] = useState(localDate());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('10:00');
  const [serviceName, setServiceName] = useState('');
  const [tier, setTier] = useState<'padrao' | 'bronze' | 'ouro' | 'vip'>('padrao');
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(true);
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');

  const activeServices = services.filter((s) => s.type === 'servico');
  const defaultService = activeServices[0]?.name || 'Corte e Alinhamento';
  const selectedService = serviceName || defaultService;
  const currentServiceObj = activeServices.find((s) => s.name === selectedService) || activeServices[0];

  const slots = availableSlots(
    date,
    durationMinutes(currentServiceObj?.duration),
    workingHours,
    bookingSettings,
    daySchedule
  );

  // Check client history based on loyaltyMatchMode
  const clientHistoryCount = useMemo(() => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanName = (name || '').trim().toLowerCase();
    const matchMode = bookingSettings?.loyaltyMatchMode || 'both';

    if (!cleanPhone && (!cleanName || cleanName.length < 3)) return 0;

    const matched = clients.filter((c) => {
      const cPhone = (c.phone || '').replace(/\D/g, '');
      const cName = (c.name || '').trim().toLowerCase();

      const phoneMatch = cleanPhone.length >= 8 && cPhone.length >= 8 && (cPhone === cleanPhone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone));
      const nameMatch = cleanName.length >= 3 && cName.length >= 3 && (cName === cleanName || cName.includes(cleanName) || cleanName.includes(cName));

      if (matchMode === 'phone') return phoneMatch;
      if (matchMode === 'name') return nameMatch;
      return phoneMatch || nameMatch;
    });

    return matched.length;
  }, [name, phone, clients, bookingSettings]);

  const minRequired = bookingSettings?.loyaltyMinBookings ?? 5;
  const discountPercent = bookingSettings?.loyaltyDiscountPercent ?? 10;
  const isEligibleForLoyalty = !!bookingSettings?.loyaltyDiscountEnabled && clientHistoryCount >= minRequired;

  // Auto-upgrade tier suggestion based on history
  const suggestedTier = useMemo(() => {
    if (clientHistoryCount >= minRequired * 2) return 'vip';
    if (clientHistoryCount >= minRequired) return 'ouro';
    if (clientHistoryCount >= 2) return 'bronze';
    return 'padrao';
  }, [clientHistoryCount, minRequired]);

  // Price calculations
  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const num = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const basePrice = parsePrice(currentServiceObj?.price || 'R$ 80');
  const discountAmount = isEligibleForLoyalty && applyLoyaltyDiscount ? (basePrice * discountPercent) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  if (!isManualBookingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (
      !availableSlots(
        date,
        durationMinutes(currentServiceObj?.duration),
        workingHours,
        bookingSettings,
        daySchedule
      ).includes(time)
    ) {
      showToast('Escolha um horário disponível.');
      return;
    }

    const priceFormatted = discountAmount > 0 ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : currentServiceObj?.price || 'R$ 80';

    const booked = addClientBooking({
      date,
      name: name.trim(),
      phone: phone.trim(),
      time: time || '10:00',
      serviceName: selectedService,
      vip: tier === 'vip',
      tier: tier !== 'padrao' ? tier : suggestedTier !== 'padrao' ? suggestedTier : 'padrao',
      price: priceFormatted,
      vehicleModel: vehicleModel.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (booked === false) return;

    // Trigger Congratulations Modal with Confetti
    openCongratulations({
      name: name.trim(),
      phone: phone.trim(),
      service: selectedService,
      time: `${date}, ${time || '10:00'}`,
      price: currentServiceObj?.price || 'R$ 80,00',
      tier: tier !== 'padrao' ? tier : suggestedTier,
      discountAmount,
      finalPrice,
      isEligible: isEligibleForLoyalty && applyLoyaltyDiscount,
      isPreview: false,
    });

    setName('');
    setPhone('');
    setVehicleModel('');
    setNotes('');
    setTier('padrao');
    setIsManualBookingOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsManualBookingOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] overflow-y-auto bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Agendamento manual</h3>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-bold">
              Agenda
            </span>
          </div>
          <button
            onClick={() => setIsManualBookingOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Data do atendimento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1e1e1e] text-white font-semibold focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Nome do cliente
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Eduardo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-500/50 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 90000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Horário
              </label>
              <select
                aria-label="Horário disponível"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-sky-500/50 font-bold"
              >
                <option value="">Escolha um horário</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Serviço desejado
            </label>
            <select
              value={selectedService}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-sky-500/50 font-medium"
            >
              {activeServices.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.duration} · {s.price})
                </option>
              ))}
            </select>
          </div>

          {/* Opcional para estética automotiva */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-sky-400" />
              <span>Veículo / Observação Automotiva (opcional)</span>
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="Ex: Honda Civic Preto · Placa ABC-1234"
              className="w-full px-3.5 py-2 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* COMPONENTE DE NÍVEL DE FIDELIDADE */}
          <div className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Nível de Fidelidade</span>
              </span>

              {clientHistoryCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                  {clientHistoryCount} agendamentos no histórico
                </span>
              )}
            </div>

            {/* Tier Buttons Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'padrao', label: 'Padrão', icon: null, color: 'text-white/60' },
                { id: 'bronze', label: 'Bronze', icon: Medal, color: 'text-amber-600' },
                { id: 'ouro', label: 'Ouro', icon: Award, color: 'text-yellow-400' },
                { id: 'vip', label: 'VIP', icon: Crown, color: 'text-amber-300' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = tier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id as any)}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-[#222] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {Icon ? <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : t.color}`} /> : <UserCheck className="w-3.5 h-3.5 opacity-50" />}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Recurrence Rule Activated Notice */}
            {isEligibleForLoyalty ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Meta de Fidelidade Atingida!</span>
                  </span>
                  <span>{discountPercent}% OFF</span>
                </div>
                <p className="text-[10px] text-emerald-200/80 leading-relaxed">
                  O cliente atingiu <b>{clientHistoryCount} atendimentos cadastrados</b> (meta de {minRequired}).
                </p>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-emerald-500/20">
                  <input
                    type="checkbox"
                    checked={applyLoyaltyDiscount}
                    onChange={(e) => setApplyLoyaltyDiscount(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-[11px] font-semibold text-white">
                    Aplicar desconto automático de {discountPercent}% neste agendamento
                  </span>
                </label>

                {applyLoyaltyDiscount && (
                  <div className="flex items-center justify-between text-[11px] font-mono bg-black/40 p-2 rounded-lg text-white/80">
                    <span className="line-through text-white/40">{currentServiceObj?.price}</span>
                    <span className="text-emerald-300 font-bold">
                      Desconto -R$ {discountAmount.toFixed(2).replace('.', ',')} → Total R$ {finalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
            ) : clientHistoryCount > 0 ? (
              <div className="p-2 rounded-xl bg-[#222] border border-white/5 text-[10px] text-white/60 flex items-center justify-between">
                <span>Progresso para desconto:</span>
                <b className="text-sky-400">
                  {clientHistoryCount} de {minRequired} agendamentos
                </b>
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Preferência de acabamento, detalhes do serviço"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsManualBookingOpen(false)}
              className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              Confirmar agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
