// @ts-nocheck -- ported as-is from the original AI Studio project
import { localDate, availableSlots, durationMinutes } from '../../utils/availability';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar } from 'lucide-react';

export const RescheduleModal: React.FC = () => {
  const {
    reschedulingClientId,
    setReschedulingClientId,
    clients,
    daySchedule, workingHours, bookingSettings,
    rescheduleAppointment,
  } = useApp();

  const reschedDays = Array.from({length:30}, (_, i) => { const date = new Date(); date.setDate(date.getDate()+i); const key = localDate(date); return { key, full:key, label:date.toLocaleDateString('pt-BR',{weekday:'short'}), num:String(date.getDate()) }; });

  const [selectedDayKey, setSelectedDayKey] = useState<string>(localDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!reschedulingClientId) return null;

  const client = clients.find((c) => c.id === reschedulingClientId);
  if (!client) return null;

  const currentDayObj = reschedDays.find((d) => d.key === selectedDayKey) || reschedDays[0];

  const reschedHours = availableSlots(currentDayObj.key, durationMinutes(client.duration), workingHours, bookingSettings, daySchedule.filter(s => s.id !== client.id));
  const handleConfirm = () => {
    if (!selectedTime) return;
    rescheduleAppointment(client.id, currentDayObj.full, selectedTime);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setReschedulingClientId(null)}
    >
      <div
        className="w-full max-w-[430px] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Reagendar atendimento</h3>
            <span className="text-xs text-white/50 block mt-0.5">{client.name}</span>
          </div>
          <button
            onClick={() => setReschedulingClientId(null)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day Strip */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
            1. Escolha a nova data
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {reschedDays.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  setSelectedDayKey(d.key);
                  setSelectedTime(null);
                }}
                className={`flex-shrink-0 w-12 py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  selectedDayKey === d.key
                    ? 'bg-white text-black font-extrabold shadow-md'
                    : 'bg-[#1e1e1e] border border-white/10 text-white/70 hover:text-white hover:bg-[#262626]'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold">{d.label}</span>
                <span className="text-sm font-bold mt-0.5">{d.num}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Pills Grid */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
            2. Escolha o novo horário
          </label>
          <div className="grid grid-cols-3 gap-2">
            {reschedHours.length === 0 && <p className="col-span-3 py-4 text-center text-xs text-muted-foreground">Sem horários disponíveis neste dia</p>}
            {reschedHours.map((t) => {
              const isTaken = false;
              const isSelected = selectedTime === t;

              return (
                <button
                  key={t}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2.5 rounded-full text-xs font-bold transition-all ${
                    isTaken
                      ? 'opacity-30 line-through bg-[#1a1a1a] text-white/30 cursor-not-allowed'
                      : isSelected
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#1e1e1e] border border-white/10 text-white/80 hover:bg-[#262626]'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setReschedulingClientId(null)}
            className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedTime}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors disabled:opacity-50"
          >
            Confirmar novo horário
          </button>
        </div>
      </div>
    </div>
  );
};
