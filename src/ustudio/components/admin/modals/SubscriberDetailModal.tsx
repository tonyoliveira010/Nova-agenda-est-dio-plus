import React from 'react';
import { ActiveSubscriber, PlatformPlan } from '../adminTypes';
import {
  X,
  Phone,
  MessageCircle,
  Car,
  Scissors,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface SubscriberDetailModalProps {
  subscriber: ActiveSubscriber | null;
  isOpen: boolean;
  onClose: () => void;
  onChargePix: (subscriber: ActiveSubscriber) => void;
  onUpdateStatus: (subscriberId: string, status: ActiveSubscriber['status']) => void;
  plans: PlatformPlan[];
}

export const SubscriberDetailModal: React.FC<SubscriberDetailModalProps> = ({
  subscriber,
  isOpen,
  onClose,
  onChargePix,
  onUpdateStatus,
  plans,
}) => {
  if (!isOpen || !subscriber) return null;

  const isAuto = subscriber.category === 'estetica_automotiva';
  const cleanPhone = subscriber.phone.replace(/\D/g, '');
  const whatsUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá ${subscriber.ownerName}! Sou da equipe Ustudio em Campinas. Passando para acompanhar o uso da sua plataforma no ${subscriber.businessName}.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] dark:bg-[#161616] border border-[#e0e0e0] dark:border-white/10 rounded-[24px] p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0] dark:border-white/10">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f3] dark:bg-white/10 text-[#141414] dark:text-white text-[10px] font-semibold flex items-center gap-1">
                {isAuto ? <Car className="w-3 h-3" /> : <Scissors className="w-3 h-3" />}
                <span>{isAuto ? 'Estética automotiva' : 'Barbearia'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f3] dark:bg-white/10 text-[#707070] dark:text-white/60 text-[10px] font-semibold">
                {subscriber.bairro}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  subscriber.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {subscriber.status === 'active' ? 'Assinatura Ativa' : 'Renovação Pendente'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#141414] dark:text-white tracking-tight">
              {subscriber.businessName}
            </h3>
            <p className="text-xs text-[#707070] dark:text-white/60">
              Titular: <b className="text-[#141414] dark:text-white">{subscriber.ownerName}</b> · {subscriber.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3f3f3] dark:bg-white/10 text-[#707070] dark:text-white/70 hover:text-[#141414] dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha Financeira SyncPay */}
        <div className="p-4 rounded-[20px] bg-[#f8f8f8] dark:bg-white/5 border border-[#e8e8e8] dark:border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8e8e8] dark:border-white/10">
            <span className="text-[#707070] dark:text-white/60">Mensalidade Consolidada:</span>
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#141414] dark:text-white block">
                R$ {subscriber.monthlyAmount.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-[#707070] dark:text-white/50">Cobrança única via Pix SyncPay</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#707070] dark:text-white/60">Plano Base Contratado:</span>
            <b className="text-[#141414] dark:text-white">{subscriber.planName}</b>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#707070] dark:text-white/60">Início da Assinatura:</span>
            <span className="text-[#141414] dark:text-white font-medium">{subscriber.startedAt}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#707070] dark:text-white/60">Próxima Renovação Pix:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{subscriber.nextRenewalAt}</span>
          </div>

          {subscriber.lastPixTransactionId && (
            <div className="pt-1.5 border-t border-[#e8e8e8] dark:border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-[#707070] dark:text-white/60">ID SyncPay:</span>
              <span className="font-mono text-[#141414] dark:text-white/80 font-semibold">
                {subscriber.lastPixTransactionId}
              </span>
            </div>
          )}
        </div>

        {/* Funções Adicionais Ativas Cobradas Junto */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070] dark:text-white/50 block">
            Módulos & Funções Adicionais Ativas
          </span>
          <div className="space-y-1.5">
            {subscriber.activeUpgrades && subscriber.activeUpgrades.length > 0 ? (
              subscriber.activeUpgrades.map((upg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#e5e5e5] dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#0066ff] dark:text-sky-400 shrink-0" />
                    <span className="font-medium text-[#141414] dark:text-white">{upg}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Cobrado Junto
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#707070] dark:text-white/50 italic p-2 rounded-xl bg-white dark:bg-white/5 border border-[#e5e5e5] dark:border-white/10">
                Nenhuma função adicional ativada no momento (apenas o plano base).
              </p>
            )}
          </div>
        </div>

        {/* Status de Assinatura Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] dark:text-white/50 block mb-1.5">
            Status da Assinatura no Painel
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'active', label: 'Ativo' },
              { id: 'pending_renewal', label: 'Pendente' },
              { id: 'paused', label: 'Pausado' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onUpdateStatus(subscriber.id, st.id as any)}
                className={`h-8 rounded-full font-bold transition-all text-[11px] ${
                  subscriber.status === st.id
                    ? 'bg-[#141414] text-white dark:bg-white dark:text-black'
                    : 'bg-[#f3f3f3] text-[#707070] dark:bg-white/5 dark:text-white/60 hover:text-[#141414]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#f0f0f0] dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              onClose();
              onChargePix(subscriber);
            }}
            className="w-full h-11 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-[#00c2ff]" />
            <span>Gerar Cobrança Pix SyncPay (R$ {subscriber.monthlyAmount.toFixed(2).replace('.', ',')})</span>
          </button>

          <a
            href={whatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-full bg-[#f3f3f3] dark:bg-white/10 hover:bg-[#e8e8e8] text-[#141414] dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>Conversar no WhatsApp ({subscriber.phone})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
