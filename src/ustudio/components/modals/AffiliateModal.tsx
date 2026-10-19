import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  DollarSign,
  Share2,
  Copy,
  Check,
  Gift,
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';

export const AffiliateModal: React.FC = () => {
  const { isAffiliateModalOpen, setIsAffiliateModalOpen, showToast, profile } = useApp();

  const [copied, setCopied] = useState(false);
  const [pixKey, setPixKey] = useState(profile.pixKey || '');
  const [pixName, setPixName] = useState(profile.pixName || profile.name || '');
  const [isRegistered, setIsRegistered] = useState(false);

  if (!isAffiliateModalOpen) return null;

  const referralLink = `https://ustudio.app/convite?ref=${(profile.handle || 'afiliado').replace('@', '')}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    showToast('Link de afiliado copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim()) {
      showToast('Informe sua chave Pix para receber as comissões');
      return;
    }
    setIsRegistered(true);
    showToast('Inscrição confirmada! Seu código de afiliado já está ativo.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsAffiliateModalOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[88vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center text-xs font-bold">
              ★
            </span>
            <h3 className="text-base font-bold text-white">Programa de Afiliados</h3>
          </div>
          <button
            onClick={() => setIsAffiliateModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0066ff]/15 via-[#1a1a1a] to-[#141414] border border-[#0066ff]/30 mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#0066ff] text-white text-[10px] font-extrabold uppercase tracking-wide">
              Ganhe Dinheiro
            </span>
            <span className="text-xs text-white/70 font-semibold">
              R$ 250 por indicação
            </span>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">
            Indique estabelecimentos e fature alto todo mês
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">
            Você ganha até R$ 250 na ativação da assinatura + 20% de comissão
            recorrente em cada mensalidade paga pelo parceiro indicado.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="p-3 rounded-xl bg-[#202020] border border-white/5 space-y-1">
            <span className="text-[10px] text-white/40 uppercase font-bold block">
              Comissão Direta
            </span>
            <span className="text-base font-extrabold text-[#00c2ff]">
              Até R$ 250,00
            </span>
            <span className="text-[10px] text-white/50 block">por loja que assinar</span>
          </div>
          <div className="p-3 rounded-xl bg-[#202020] border border-white/5 space-y-1">
            <span className="text-[10px] text-white/40 uppercase font-bold block">
              Recorrência Mensal
            </span>
            <span className="text-base font-extrabold text-emerald-400">
              20% ao mês
            </span>
            <span className="text-[10px] text-white/50 block">renda passiva no Pix</span>
          </div>
        </div>

        {/* Registration Form / Active Link */}
        {isRegistered ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <b className="text-xs font-bold text-white block">
                  Inscrição Ativa com Sucesso!
                </b>
                <span className="text-[11px] text-white/60 block">
                  Chave Pix cadastrada: {pixKey}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/70 block">
                Seu link de indicação personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3 py-2 bg-[#202020] border border-white/10 rounded-xl text-xs text-white/80 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/40 leading-relaxed text-center">
              Compartilhe no WhatsApp ou redes sociais. Cada estabelecimento que se
              cadastrar pelo seu link gerará comissões automáticas para sua conta.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/70 block">
                Nome completo para cadastro
              </label>
              <input
                type="text"
                required
                value={pixName}
                onChange={(e) => setPixName(e.target.value)}
                placeholder="Ex: Antonio Oliveira"
                className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#0066ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/70 block">
                Chave Pix para recebimento das comissões
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#0066ff]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#202020] border border-white/5 space-y-1.5 text-[11px] text-white/60">
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pagamento garantido e seguro</span>
              </div>
              <p className="leading-relaxed">
                As comissões são liquidadas diretamente na sua chave Pix toda
                semana via API de pagamentos. Sem burocracia.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#0066ff] hover:bg-[#0055dd] text-white font-bold text-xs active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Confirmar Inscrição no Programa</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
