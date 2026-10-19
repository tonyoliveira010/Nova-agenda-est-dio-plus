// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, MessageSquare, Tag, DollarSign, Percent, Sparkles } from 'lucide-react';

export const BookingConfigModal: React.FC = () => {
  const { isBookingRulesOpen, setIsBookingRulesOpen, bookingSettings, saveBookingSettings, openCongratulations } = useApp();

  const [activeTab, setActiveTab] = useState<'agenda' | 'fidelidade' | 'contato' | 'pagamento'>('agenda');

  const [minAdvanceHours, setMinAdvanceHours] = useState(bookingSettings.minAdvanceHours);
  const [bufferMinutes, setBufferMinutes] = useState(bookingSettings.bufferMinutes);
  const [freeCancellationHours, setFreeCancellationHours] = useState(bookingSettings.freeCancellationHours);
  const [requireWhatsapp, setRequireWhatsapp] = useState(bookingSettings.requireWhatsapp);
  const [autoWhatsappNotification, setAutoWhatsappNotification] = useState(bookingSettings.autoWhatsappNotification);
  const [firstVisitDiscount, setFirstVisitDiscount] = useState(bookingSettings.firstVisitDiscount);
  const [activeCoupon, setActiveCoupon] = useState(bookingSettings.activeCoupon);
  const [requireDeposit, setRequireDeposit] = useState(bookingSettings.requireDeposit);
  const [depositPercent, setDepositPercent] = useState(bookingSettings.depositPercent);
  const [allowPayOnSite, setAllowPayOnSite] = useState(bookingSettings.allowPayOnSite);

  // Regra de desconto por agendamentos cadastrados (fidelidade)
  const [loyaltyDiscountEnabled, setLoyaltyDiscountEnabled] = useState(bookingSettings.loyaltyDiscountEnabled ?? true);
  const [loyaltyMinBookings, setLoyaltyMinBookings] = useState(bookingSettings.loyaltyMinBookings ?? 5);
  const [loyaltyDiscountPercent, setLoyaltyDiscountPercent] = useState(bookingSettings.loyaltyDiscountPercent ?? 10);
  const [loyaltyMatchMode, setLoyaltyMatchMode] = useState<'both' | 'phone' | 'name'>(bookingSettings.loyaltyMatchMode || 'both');
  const [clientCardFormat, setClientCardFormat] = useState<'barbearia' | 'automotiva' | 'completa' | 'rapida'>(bookingSettings.clientCardFormat || 'completa');

  if (!isBookingRulesOpen) return null;

  const handleSave = () => {
    saveBookingSettings({
      minAdvanceHours,
      bufferMinutes,
      freeCancellationHours,
      requireWhatsapp,
      autoWhatsappNotification: false,
      firstVisitDiscount: 0,
      activeCoupon: '',
      requireDeposit: false,
      depositPercent,
      allowPayOnSite,
      loyaltyDiscountEnabled,
      loyaltyMinBookings,
      loyaltyDiscountPercent,
      loyaltyMatchMode,
      clientCardFormat,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsBookingRulesOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">Modal de agendamento do cliente</h3>
          <button
            onClick={() => setIsBookingRulesOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#1e1e1e] rounded-full mb-4">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'agenda' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('contato')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'contato' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Contato
          </button>
          <button
            onClick={() => setActiveTab('fidelidade')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'fidelidade' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Fidelidade
          </button>
          <button
            onClick={() => setActiveTab('pagamento')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'pagamento' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Pagamento
          </button>
        </div>

        {/* Tab 1: Agenda */}
        {activeTab === 'agenda' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#1e1e1e] space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Antecedência mínima para agendar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={minAdvanceHours}
                  onChange={(e) => setMinAdvanceHours(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl bg-[#262626] border border-white/10 text-white font-bold"
                />
                <span className="text-white/60">horas antes do horário</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1e1e1e] space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Intervalo de respiro entre atendimentos
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl bg-[#262626] border border-white/10 text-white font-bold"
                />
                <span className="text-white/60">minutos (limpeza/preparação da sala)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1e1e1e] space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Cancelamento gratuito permitido até
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={freeCancellationHours}
                  onChange={(e) => setFreeCancellationHours(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl bg-[#262626] border border-white/10 text-white font-bold"
                />
                <span className="text-white/60">horas antes da sessão</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contato */}
        {activeTab === 'contato' && (
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e1e] cursor-pointer">
              <div>
                <span className="font-bold text-white block">Exigir WhatsApp no agendamento</span>
                <span className="text-[11px] text-white/50 block mt-0.5">
                  Garante canal direto para envio de confirmação e ficha
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireWhatsapp}
                onChange={(e) => setRequireWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
            </label>
          </div>
        )}

        {/* Tab 3: Fidelidade & Descontos */}
        {activeTab === 'fidelidade' && (
          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Desconto automático por recorrência</span>
                <span className="text-[11px] text-white/50 block mt-0.5">
                  Concede desconto quando o cliente acumula agendamentos cadastrados
                </span>
              </div>
              <input
                type="checkbox"
                checked={loyaltyDiscountEnabled}
                onChange={(e) => setLoyaltyDiscountEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
            </label>

            {loyaltyDiscountEnabled && (
              <>
                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Meta de agendamentos cadastrados
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={loyaltyMinBookings}
                      onChange={(e) => setLoyaltyMinBookings(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-2 rounded-xl bg-[#262626] border border-white/10 text-white font-bold text-sm"
                    />
                    <span className="text-white/60">agendamentos para ativar o desconto</span>
                  </div>
                  <span className="text-[11px] text-white/40 block">
                    Ao atingir essa quantidade de agendamentos, o cliente recebe o desconto automaticamente no agendamento.
                  </span>
                </div>

                {/* Comparação de Telefone e Nome para ativar a meta */}
                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Identificação para contagem da meta
                  </label>
                  <span className="text-[11px] text-white/50 block">
                    Como o sistema busca o histórico de agendamentos cadastrados:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {[
                      {
                        key: 'both',
                        title: 'Telefone OU Nome (Recomendado)',
                        desc: 'Compara pelo número do WhatsApp ou pelo nome para identificar o cliente fiel',
                      },
                      {
                        key: 'phone',
                        title: 'Apenas Número de WhatsApp / Telefone',
                        desc: 'Localiza o histórico exclusivamente pelo número de telefone',
                      },
                      {
                        key: 'name',
                        title: 'Apenas Nome Completo',
                        desc: 'Localiza o histórico pelo nome do cliente cadastrado',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          loyaltyMatchMode === opt.key
                            ? 'bg-sky-500/10 border-sky-500/40 text-white'
                            : 'bg-[#242424] border-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="loyaltyMatchMode"
                          checked={loyaltyMatchMode === opt.key}
                          onChange={() => setLoyaltyMatchMode(opt.key as any)}
                          className="mt-0.5 accent-sky-400"
                        />
                        <div className="min-w-0">
                          <b className="text-xs font-semibold block text-white">{opt.title}</b>
                          <span className="text-[10px] text-white/50 block leading-tight">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Formato do tipo de ficha */}
                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Formato do tipo de ficha do cliente
                  </label>
                  <span className="text-[11px] text-white/50 block">
                    Escolha como a ficha e os dados de fidelidade são apresentados:
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      {
                        id: 'barbearia',
                        name: 'Barbearia Clássica',
                        desc: 'Histórico de corte, barba e estilo',
                      },
                      {
                        id: 'automotiva',
                        name: 'Estética Automotiva',
                        desc: 'Modelo do carro, placa e polimentos',
                      },
                      {
                        id: 'completa',
                        name: 'Cartão VIP & Selos',
                        desc: 'Cartão Black digital com progresso',
                      },
                      {
                        id: 'rapida',
                        name: 'Ficha Rápida',
                        desc: 'Visual enxuto e direto ao ponto',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setClientCardFormat(item.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          clientCardFormat === item.id
                            ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-sm'
                            : 'bg-[#242424] border-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        <b className="text-xs font-bold text-white block">{item.name}</b>
                        <span className="text-[10px] text-white/50 block mt-0.5 leading-tight">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Porcentagem de desconto (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={loyaltyDiscountPercent}
                      onChange={(e) => setLoyaltyDiscountPercent(Math.min(90, Math.max(1, Number(e.target.value))))}
                      className="w-24 px-3 py-2 rounded-xl bg-[#262626] border border-white/10 text-white font-bold text-sm"
                    />
                    <span className="text-white/60">% de desconto no valor do serviço</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {[5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setLoyaltyDiscountPercent(pct)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          loyaltyDiscountPercent === pct
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-[#262626] border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exemplo prático da regra */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exemplo prático da regra</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    Clientes com <b>{loyaltyMinBookings} ou mais agendamentos</b> recebem <b>{loyaltyDiscountPercent}% de desconto</b> automático.
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 text-[11px] flex items-center justify-between font-mono">
                    <span className="text-white/60">Serviço de R$ 100,00</span>
                    <span className="text-emerald-300 font-bold">
                      Desconto: R$ {(100 * loyaltyDiscountPercent / 100).toFixed(2).replace('.', ',')} → Total R$ {(100 - (100 * loyaltyDiscountPercent / 100)).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Pré-visualização do Modal de Parabéns com Confetes (Abaixo do card de exemplo prático) */}
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Modal de Parabéns com Confetes</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                      Pós-agendamento
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed">
                    Ao concluir qualquer agendamento, este modal é acionado com efeito festivo de confetes caindo, dados da reserva, selo VIP/Ouro e WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      openCongratulations({
                        name: 'Carlos Oliveira',
                        phone: '(11) 98877-6655',
                        service: 'Polimento Técnico & Proteção',
                        time: 'Hoje, 14:30',
                        price: 'R$ 150,00',
                        tier: 'vip',
                        discountAmount: (150 * loyaltyDiscountPercent) / 100,
                        finalPrice: 150 - (150 * loyaltyDiscountPercent) / 100,
                        isEligible: true,
                        isPreview: true,
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-950/40 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ver pré-visualização do modal de parabéns</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'pagamento' && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <b className="text-foreground">Em breve</b>
            <p className="mt-2">Sinal antecipado e pagamentos por cartão integrados ficam disponíveis nas próximas versões.</p>
          </div>
        )}
        {/* Tab 4: Pagamento */}
        {false && activeTab === 'pagamento' && (
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e1e] cursor-pointer">
              <div>
                <span className="font-bold text-white block">Exigir sinal / caução de reserva</span>
                <span className="text-[11px] text-white/50 block mt-0.5">
                  Evita faltas ("no-show") exigindo pagamento prévio
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireDeposit}
                onChange={(e) => setRequireDeposit(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
            </label>

            {requireDeposit && (
              <div className="p-3.5 rounded-2xl bg-[#1e1e1e] space-y-1.5 ml-3 border-l-2 border-[#00c2ff]">
                <label className="text-xs font-bold text-white block">
                  Porcentagem do sinal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-xl bg-[#262626] border border-white/10 text-white font-bold"
                  />
                  <span className="text-white/60">% do valor total do procedimento</span>
                </div>
              </div>
            )}

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e1e] cursor-pointer">
              <div>
                <span className="font-bold text-white block">Permitir pagamento no local</span>
                <span className="text-[11px] text-white/50 block mt-0.5">
                  Cliente pode quitar o saldo restante na hora do atendimento
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowPayOnSite}
                onChange={(e) => setAllowPayOnSite(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
            </label>
          </div>
        )}

        <div className="flex gap-2 pt-5 border-t border-white/10 mt-5">
          <button
            type="button"
            onClick={() => setIsBookingRulesOpen(false)}
            className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors"
          >
            Salvar regras
          </button>
        </div>
      </div>
    </div>
  );
};
