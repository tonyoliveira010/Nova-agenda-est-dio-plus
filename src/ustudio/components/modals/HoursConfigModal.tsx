// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, CalendarX, Plus, Lock } from 'lucide-react';

const WEEKDAYS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
];

export const HoursConfigModal: React.FC = () => {
  const { isHoursConfigOpen, setIsHoursConfigOpen, workingHours, saveWorkingHours, showToast } = useApp();

  const [selectedDays, setSelectedDays] = useState<string[]>(workingHours.days);
  const [startTime, setStartTime] = useState(workingHours.start);
  const [endTime, setEndTime] = useState(workingHours.end);

  const [overrides, setOverrides] = useState(workingHours.overrides || {});
  const [blockedDates, setBlockedDates] = useState(workingHours.blockedDates || []);
  const [blockedDate, setBlockedDate] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'manual' | 'picker'>('manual');

  if (!isHoursConfigOpen) return null;

  const toggleDay = (key: string) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const parseToIsoDate = (input: string): string | null => {
    const raw = (input || '').trim();
    if (!raw) return null;

    // Format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    // Format: DD/MM/YYYY or DD-MM-YYYY
    const dmyFull = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyFull) {
      const day = dmyFull[1].padStart(2, '0');
      const month = dmyFull[2].padStart(2, '0');
      const year = dmyFull[3];
      return `${year}-${month}-${day}`;
    }

    // Format: DD/MM/YY
    const dmyShort = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
    if (dmyShort) {
      const day = dmyShort[1].padStart(2, '0');
      const month = dmyShort[2].padStart(2, '0');
      const year = `20${dmyShort[3]}`;
      return `${year}-${month}-${day}`;
    }

    // Format: DD/MM (assume current year)
    const dm = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})$/);
    if (dm) {
      const day = dm[1].padStart(2, '0');
      const month = dm[2].padStart(2, '0');
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }

    return null;
  };

  const handleCommitBlockDate = (candidate: string) => {
    const isoDate = parseToIsoDate(candidate);
    if (!isoDate) {
      showToast('Digite uma data válida (ex: 25/12/2026, 15/11 ou escolha no calendário)');
      return;
    }

    // Verify valid calendar day
    const [y, m, d] = isoDate.split('-').map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      showToast('Data com dia ou mês inválido.');
      return;
    }

    if (blockedDates.includes(isoDate)) {
      showToast('Esta data já está bloqueada!');
      return;
    }

    const nextBlocked = [...blockedDates, isoDate];
    setBlockedDates(nextBlocked);
    setBlockedDate('');
    setManualInput('');

    saveWorkingHours({
      overrides,
      blockedDates: nextBlocked,
      days: selectedDays,
      start: startTime,
      end: endTime,
    });

    const [py, pm, pd] = isoDate.split('-');
    showToast(`Data ${pd}/${pm}/${py} bloqueada com sucesso!`);
  };

  const handleSave = () => {
    if (startTime >= endTime || Object.values(overrides).some(w => w.start >= w.end)) return showToast("O fechamento deve ser após a abertura.");
    saveWorkingHours({
      overrides, blockedDates,
      days: selectedDays,
      start: startTime,
      end: endTime,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsHoursConfigOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] overflow-y-auto bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2f7dff]" />
            <h3 className="text-base font-bold text-white">Horário de atendimento</h3>
          </div>
          <button
            onClick={() => setIsHoursConfigOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
              Dias de funcionamento
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {WEEKDAYS.map((d) => {
                const isActive = selectedDays.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={`flex-1 py-2.5 rounded-2xl font-bold transition-all text-center ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#1e1e1e] border border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Abertura
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-bold focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Fechamento
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-bold focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>

        <section className="mt-4 space-y-3 text-xs"><h4 className="font-semibold text-foreground">Horários especiais por dia</h4>{WEEKDAYS.filter(day => selectedDays.includes(day.key)).map(day => <div key={day.key} className="space-y-2"><label className="flex items-center gap-2"><input type="checkbox" checked={!!overrides[day.key]} onChange={e => setOverrides(prev => { const next = {...prev}; if (e.target.checked) next[day.key] = {start: startTime, end: endTime}; else delete next[day.key]; return next; })} />{day.label} · horário especial</label>{overrides[day.key] && <div className="grid grid-cols-2 gap-2">{['start', 'end'].map(field => <input key={field} aria-label={`${day.label} ${field === 'start' ? 'abertura' : 'fechamento'}`} type="time" value={overrides[day.key][field]} onChange={e => setOverrides(prev => ({...prev, [day.key]: {...prev[day.key], [field]: e.target.value}}))} className="rounded-xl border border-border bg-secondary p-2 text-foreground" />)}</div>}</div>)}</section>
        {/* Seção Bloquear Data com suporte completo a Manual e Calendário */}
        <section className="mt-5 space-y-3 text-xs border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CalendarX className="w-3.5 h-3.5 text-amber-400" />
              <span>Bloquear uma data (Datas indisponíveis)</span>
            </h4>
            <span className="text-[10px] text-white/40">Feriados ou folgas</span>
          </div>

          <p className="text-[11px] text-white/50 leading-relaxed">
            Selecione no calendário ou digite manualmente a data para impedir novos agendamentos no painel e na página pública.
          </p>

          {/* Atalhos Rápidos */}
          <div className="flex gap-1.5 items-center flex-wrap pt-0.5">
            <span className="text-[10px] text-white/40 font-semibold mr-1">Atalhos rápidos:</span>
            {[
              {
                label: 'Hoje',
                getDate: () => {
                  const d = new Date();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${y}-${m}-${day}`;
                },
              },
              {
                label: 'Amanhã',
                getDate: () => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${y}-${m}-${day}`;
                },
              },
              {
                label: 'Depois de amanhã',
                getDate: () => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${y}-${m}-${day}`;
                },
              },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const iso = preset.getDate();
                  setBlockedDate(iso);
                  const [y, m, d] = iso.split('-');
                  setManualInput(`${d}/${m}/${y}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#222] hover:bg-[#2e2e2e] text-white/70 hover:text-white text-[10px] font-semibold transition-colors border border-white/5 active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Modo de Bloqueio: Manual vs Calendário */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#121212] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'manual'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Digitar manualmente
              </button>
              <button
                type="button"
                onClick={() => setInputMode('picker')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'picker'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Escolher no calendário
              </button>
            </div>

            {inputMode === 'manual' ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                  Digite a data (DD/MM/AAAA ou DD/MM)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 25/12/2026 ou 15/11"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCommitBlockDate(manualInput);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-[#1e1e1e] p-2.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => handleCommitBlockDate(manualInput)}
                    className="px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Bloquear</span>
                  </button>
                </div>
                <span className="text-[10px] text-white/40 block mt-1">
                  Pressione <b>Enter</b> ou toque em <b>Bloquear</b> para salvar.
                </span>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                  Selecione o dia no calendário
                </label>
                <div className="flex gap-2">
                  <input
                    aria-label="Data para bloquear no calendário"
                    type="date"
                    value={blockedDate}
                    onChange={(e) => {
                      setBlockedDate(e.target.value);
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        setManualInput(`${d}/${m}/${y}`);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-[#1e1e1e] p-2.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCommitBlockDate(blockedDate)}
                    disabled={!blockedDate}
                    className="px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Bloquear</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Datas Bloqueadas */}
          {blockedDates.length === 0 ? (
            <p className="text-[11px] text-white/40 italic py-1">
              Nenhuma data bloqueada no momento.
            </p>
          ) : (
            <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto no-scrollbar">
              {blockedDates.map((date) => {
                let dateDisplay = date;
                try {
                  const [y, m, d] = date.split('-').map(Number);
                  const parsed = new Date(y, m - 1, d);
                  dateDisplay = `${parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} (${parsed.toLocaleDateString('pt-BR', { weekday: 'short' })})`;
                } catch {}

                return (
                  <div
                    key={date}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#1e1e1e] border border-white/5 text-xs"
                  >
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-400" />
                      {dateDisplay}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = blockedDates.filter((item) => item !== date);
                        setBlockedDates(next);
                        saveWorkingHours({
                          overrides,
                          blockedDates: next,
                          days: selectedDays,
                          start: startTime,
                          end: endTime,
                        });
                        showToast('Data desbloqueada.');
                      }}
                      className="text-white/40 hover:text-red-400 transition-colors px-2 py-0.5 rounded-lg hover:bg-white/5 font-semibold text-[11px]"
                    >
                      Desbloquear
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <div className="flex gap-2 pt-5 border-t border-white/10 mt-5">
          <button
            type="button"
            onClick={() => setIsHoursConfigOpen(false)}
            className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors"
          >
            Salvar horários
          </button>
        </div>
      </div>
    </div>
  );
};
