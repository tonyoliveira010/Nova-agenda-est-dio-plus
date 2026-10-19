// @ts-nocheck -- ported as-is from the original AI Studio project
import { localDate, availableSlots } from '../../utils/availability';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Crown,
  Award,
  Medal,
  Lock,
  Unlock,
  UserPlus,
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const {
    daySchedule, bookingSettings,
    clients,
    workingHours, saveWorkingHours,
    setSelectedClientId,
    setIsHoursConfigOpen,
    setIsManualBookingOpen,
    blockSlot,
    unblockSlot,
  } = useApp();

  const [agendaMode, setAgendaMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(new Date().getDate());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const daysLabelsMap: Record<string, string> = {
    seg: 'Seg',
    ter: 'Ter',
    qua: 'Qua',
    qui: 'Qui',
    sex: 'Sex',
    sab: 'Sáb',
    dom: 'Dom',
  };

  const formattedWorkingDays = workingHours.days
    .map((d) => daysLabelsMap[d] || d)
    .join(', ');

  const month = new Date();
  const totalDays = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const leadingOffset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const dateForDay = (day) => localDate(new Date(month.getFullYear(), month.getMonth(), day));
  const selectedDate = dateForDay(selectedDayNumber);
  const currentSchedule = [...daySchedule.filter(s => (s.date || localDate()) === selectedDate && s.type !== 'free'), ...availableSlots(selectedDate, 30, workingHours, bookingSettings, daySchedule).map(time => ({time, date:selectedDate, type:'free'}))].sort((a,b) => a.time.localeCompare(b.time));
  const daysWithAppointments = clients.filter(c => (c.date || localDate()).slice(0,7) === localDate().slice(0,7)).map(c => Number((c.date || localDate()).slice(8)));
  const weekColumns = Array.from({length:7}, (_, i) => {const date = new Date();date.setDate(date.getDate()+i);const key=localDate(date);return {dow:date.toLocaleDateString('pt-BR',{weekday:'short'}),day:date.getDate(),items:[...clients.filter(c => (c.date || localDate()) === key).map(c => ({time:c.time.split(', ').pop(),text:c.name+' · '+c.service})),...availableSlots(key,30,workingHours,bookingSettings,daySchedule).slice(0,4).map(time=>({time,text:time+' livre',free:true}))]};});
  return (
    <div className="px-5 space-y-4">
      {/* Header */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Agenda</h2>
          <button
            onClick={() => setIsHoursConfigOpen(true)}
            className="w-9 h-9 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#1e1e1e] transition-colors"
            title="Configurar horários de atendimento"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* View Segmented Control */}
        <div className="inline-flex p-1 bg-[#161616] border border-white/10 rounded-full w-full max-w-[280px]">
          <button
            onClick={() => setAgendaMode('dia')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              agendaMode === 'dia' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setAgendaMode('semana')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              agendaMode === 'semana' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setAgendaMode('mes')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              agendaMode === 'mes' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Mês
          </button>
        </div>

        {/* Hours Summary Notice */}
        <p className="text-xs text-white/45 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>
            {formattedWorkingDays} · {workingHours.start} às {workingHours.end}
          </span>
        </p>
      </div>

      {/* DIA VIEW */}
      {agendaMode === 'dia' && (
        <div className="space-y-3">
          {/* Day Navigator */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#161616] border border-white/10">
            <button
              onClick={() => setSelectedDayNumber((prev) => Math.max(1, prev - 1))}
              className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-white hover:bg-[#262626] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-sm font-bold text-white block">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {weekday:'long'})}
              </span>
              <span className="text-xs text-white/50">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>

            <button
              onClick={() => setSelectedDayNumber((prev) => Math.min(totalDays, prev + 1))}
              className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-white hover:bg-[#262626] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule Slots */}
          <div className="space-y-2.5">
            {workingHours.blockedDates?.includes(selectedDate) && <p className="py-4 text-center text-sm text-muted-foreground">Dia bloqueado para agendamentos</p>}
            {currentSchedule.map((slot) => {
              if (slot.type === 'client') {
                const client = clients.find((c) => c.id === slot.id);
                if (!client) return null;

                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedClientId(client.id)}
                    className="w-full p-4 rounded-2xl bg-[#161616] border border-white/10 hover:bg-[#1e1e1e] hover:border-white/20 transition-all flex flex-col gap-2.5 text-left group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                            {client.name}
                          </span>
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
                        <span className="text-xs text-white/50 block truncate">{client.phone}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#262626] text-xs font-bold text-white flex-shrink-0">
                        {slot.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                      <div className="text-white/60">
                        <b className="text-white font-medium">{client.service}</b>
                        <span className="text-white/40 block mt-0.5">
                          {client.duration} · {client.price}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                        {client.status}
                      </span>
                    </div>
                  </button>
                );
              }

              if (slot.type === 'blocked') {
                return (
                  <div
                    key={slot.time}
                    className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white/35 w-12">{slot.time}</span>
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <Lock className="w-3.5 h-3.5 text-amber-500/60" />
                        <span>Horário bloqueado</span>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockSlot(slot.time, selectedDate)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-xs font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Desbloquear</span>
                    </button>
                  </div>
                );
              }

              // Free slot
              return (
                <div
                  key={slot.time}
                  className="p-3 rounded-2xl border border-dashed border-white/15 hover:border-white/30 transition-all flex items-center justify-between bg-black/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/40 w-12">{slot.time}</span>
                    <span className="text-xs text-white/50 font-medium">Disponível</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsManualBookingOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161616] border border-white/10 hover:bg-[#222] text-xs font-semibold text-white/80 hover:text-white transition-colors"
                      title="Encaixar cliente neste horário"
                    >
                      <UserPlus className="w-3 h-3 text-[#2f7dff]" />
                      <span>Encaixar</span>
                    </button>
                    <button
                      onClick={() => blockSlot(slot.time, selectedDate)}
                      className="px-2.5 py-1 rounded-full bg-[#161616] border border-white/10 hover:bg-[#222] text-xs font-semibold text-white/50 hover:text-white transition-colors"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEMANA VIEW */}
      {agendaMode === 'semana' && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 px-1">
            Arraste para visualizar todos os dias da semana:
          </p>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {weekColumns.map((col) => {
              const isToday = col.day === new Date().getDate();
              return (
                <div
                  key={col.day}
                  className={`flex-shrink-0 w-36 p-3 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-[#1a1a1a] border-white/25 shadow-md shadow-black'
                      : 'bg-[#161616] border-white/10'
                  }`}
                >
                  <div className="text-center pb-2.5 mb-2.5 border-b border-white/10">
                    <span className="text-xs font-semibold text-white/50 block">{col.dow}</span>
                    <b
                      className={`text-lg leading-none ${
                        isToday ? 'text-white font-extrabold' : 'text-white/85'
                      }`}
                    >
                      {col.day}
                    </b>
                  </div>

                  <div className="space-y-1.5">
                    {col.items.map((it, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-[11px] font-semibold leading-tight ${
                          it.free
                            ? 'border border-dashed border-white/15 text-white/35 bg-transparent'
                            : 'bg-[#262626] text-white/90 border border-white/5'
                        }`}
                      >
                        {it.text}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MÊS VIEW */}
      {agendaMode === 'mes' && (
        <div className="p-4 rounded-3xl bg-[#161616] border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-sm font-bold text-white">{month.toLocaleDateString('pt-BR', {month:'long',year:'numeric'})}</span>
            <span className="text-xs text-white/50">
              {daysWithAppointments.length} dias com atendimentos
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dow, i) => (
              <span key={i} className="text-[11px] font-bold text-white/35 py-1">
                {dow}
              </span>
            ))}

            {/* Leading empty cells */}
            {Array.from({ length: leadingOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="aspect-square" />
            ))}

            {/* Days 1 to 30 */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate();
              const hasAppt = daysWithAppointments.includes(day);

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDayNumber(day);
                    setAgendaMode('dia');
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all relative ${
                    isToday
                      ? 'bg-white text-black font-extrabold shadow-md'
                      : 'text-white/80 hover:bg-[#262626]'
                  }`}
                >
                  <span>{day}</span>
                  {hasAppt && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isToday ? 'bg-black' : 'bg-[#2f7dff]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
