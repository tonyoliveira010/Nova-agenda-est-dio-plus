// @ts-nocheck
import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Sparkles, MessageCircle, Crown, Award, Medal, Calendar, Clock, DollarSign, X } from 'lucide-react';

export const CongratulationsModal: React.FC = () => {
  const { isCongratulationsOpen, congratulationsData, closeCongratulations, bookingSettings } = useApp();

  if (!isCongratulationsOpen) return null;

  const data = congratulationsData || {
    name: 'Carlos Oliveira',
    phone: '(11) 98877-6655',
    service: 'Polimento Técnico & Proteção',
    time: 'Hoje, 14:30',
    price: 'R$ 250,00',
    tier: 'vip',
    discountAmount: 25,
    finalPrice: 225,
    isEligible: true,
    isPreview: true,
  };

  const discountPercent = bookingSettings?.loyaltyDiscountPercent ?? 10;
  const digits = (data.phone || '').replace(/\D/g, '');
  const cleanPhone = digits.length <= 11 ? `55${digits}` : digits;
  const whatsappMsg = encodeURIComponent(
    `Olá ${data.name}! Seu agendamento de ${data.service} para ${data.time} foi confirmado com sucesso!`
  );
  const whatsappUrl = digits ? `https://wa.me/${cleanPhone}?text=${whatsappMsg}` : '#';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
      onClick={closeCongratulations}
    >
      {/* Confetti Falling Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => {
          const left = (i * 2.85 + Math.random() * 2) % 100;
          const delay = (i * 0.12) % 3;
          const duration = 2.5 + (i % 5) * 0.4;
          const colors = [
            '#2563eb', // Electric blue
            '#4f46e5', // Royal indigo
            '#38bdf8', // Cyan
            '#84cc16', // Neon lime
            '#fbbf24', // Gold
            '#a855f7', // Purple
          ];
          const color = colors[i % colors.length];
          const size = 6 + (i % 4) * 3;
          const isCircle = i % 3 === 0;

          return (
            <div
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${left}%`,
                top: '-20px',
                width: `${size}px`,
                height: isCircle ? `${size}px` : `${size * 1.5}px`,
                backgroundColor: color,
                borderRadius: isCircle ? '50%' : '2px',
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                animationIterationCount: 'infinite',
                transform: `rotate(${i * 25}deg)`,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[420px] bg-[#0c1222] border-2 border-blue-500/30 rounded-3xl p-6 shadow-2xl shadow-blue-900/40 animate-in fade-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeCongratulations}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge and Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
          <div className="w-full h-full rounded-full bg-[#0c1222] flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-blue-400 stroke-[2.5]" />
          </div>
        </div>

        {data.isPreview && (
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-500/30">
            Modo Pré-visualização
          </span>
        )}

        <h3 className="text-xl font-black text-white tracking-tight">
          🎉 Parabéns! Agendamento Confirmado!
        </h3>
        <p className="text-xs text-white/60 mt-1 leading-relaxed">
          Tudo pronto! Seu atendimento foi registrado com sucesso na agenda.
        </p>

        {/* Details Card */}
        <div className="mt-4 p-4 rounded-2xl bg-[#141d33] border border-blue-500/20 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase text-white/40 block">Cliente</span>
              <span className="text-sm font-bold text-white">{data.name}</span>
            </div>
            {/* Loyalty Tier Badge */}
            {data.tier === 'vip' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffb020] text-black text-[10px] font-extrabold uppercase shadow-sm">
                <Crown className="w-2.5 h-2.5 fill-black" />
                VIP
              </span>
            )}
            {data.tier === 'ouro' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-extrabold uppercase shadow-sm">
                <Award className="w-2.5 h-2.5 fill-black" />
                OURO
              </span>
            )}
            {data.tier === 'bronze' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-extrabold uppercase shadow-sm">
                <Medal className="w-2.5 h-2.5 fill-white" />
                BRONZE
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div>
              <span className="text-[10px] text-white/40 block">Serviço</span>
              <span className="font-semibold text-white truncate block">{data.service}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Data & Horário</span>
              <span className="font-semibold text-white">{data.time}</span>
            </div>
          </div>

          {/* Loyalty Discount applied banner */}
          {data.discountAmount > 0 ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Desconto Fidelidade ({discountPercent}%)</span>
              </div>
              <span className="text-emerald-300 font-extrabold text-xs">
                -R$ {Number(data.discountAmount).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ) : null}

          <div className="pt-1 flex items-center justify-between text-xs font-bold border-t border-white/5">
            <span className="text-white/60">Valor do atendimento:</span>
            <span className="text-sm font-black text-white">
              {data.finalPrice ? `R$ ${Number(data.finalPrice).toFixed(2).replace('.', ',')}` : data.price}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          {digits && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Enviar confirmação no WhatsApp</span>
            </a>
          )}

          <button
            onClick={closeCongratulations}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Concluir e fechar
          </button>
        </div>
      </div>
    </div>
  );
};
