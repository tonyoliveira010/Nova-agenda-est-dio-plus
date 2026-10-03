import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Copy,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  fetchPlans,
  createPixForPlan,
  confirmPlanSubscription,
  PixCharge,
} from '../lib/plans-service';
import { PlanRow } from '../lib/supabase';
import { UserAccount } from '../lib/auth-service';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onPlanActivated: (planId: string) => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onPlanActivated,
}) => {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.fullName || '',
    cpf: '',
    phone: currentUser?.phone || '',
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null);
      setPixCharge(null);
      setPixPaid(false);
      return;
    }
    setLoading(true);
    fetchPlans()
      .then((data) => {
        setPlans(data.filter((p) => p.active));
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PlanRow) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedPlan(plan);
    setForm({
      name: currentUser.fullName || '',
      cpf: '',
      phone: currentUser.phone || '',
    });
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPlan) return;
    setGenerating(true);
    try {
      const charge = await createPixForPlan(currentUser, selectedPlan, form);
      setPixCharge(charge);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixCharge) return;
    navigator.clipboard.writeText(pixCharge.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    if (!currentUser || !selectedPlan) return;
    setPixPaid(true);
    await confirmPlanSubscription(currentUser.id, selectedPlan.id);
    onPlanActivated(selectedPlan.id);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 md:p-8 text-neutral-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 mb-3">
            <Zap className="h-3.5 w-3.5" /> Planos Oficiais da Plataforma
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Escolha o plano ideal para o seu estúdio
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Conectado em tempo real com o banco de dados Supabase e split integrado de pagamentos.
          </p>
        </div>

        {/* PIX CHECKOUT MODAL OVERLAY */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-neutral-100 shadow-2xl relative">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setPixCharge(null);
                  setPixPaid(false);
                }}
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                Assinar {selectedPlan.name}
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Valor:{' '}
                <span className="font-semibold text-emerald-400">
                  {(selectedPlan.price_cents / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  /mês
                </span>{' '}
                · Liberação instantânea via Pix
              </p>

              {pixPaid ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-300">Pagamento Confirmado!</h4>
                  <p className="text-xs text-neutral-300">
                    Seu estúdio foi atualizado com sucesso para o plano {selectedPlan.name}. Todos os
                    recursos já estão liberados!
                  </p>
                </div>
              ) : pixCharge ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-lg">
                    <QRCodeSVG value={pixCharge.pixCode} size={190} level="M" />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-neutral-400">Código Pix Copia e Cola:</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={pixCharge.pixCode}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-300 truncate"
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="flex items-center gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-xs font-medium text-white transition shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-xs text-neutral-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                    <span>Aguardando liquidação automática do Pix...</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:opacity-95 transition"
                  >
                    Confirmar Pagamento Realizado ✓
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGeneratePix} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nome Completo do Titular
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nome impresso no documento"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      CPF (apenas dígitos)
                    </label>
                    <input
                      required
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, '') })}
                      maxLength={11}
                      placeholder="12345678900"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      WhatsApp para comprovante
                    </label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95 transition disabled:opacity-50 mt-2"
                  >
                    {generating ? (
                      'Gerando Pix...'
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" /> Gerar QR Code Pix
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PLAN CARDS */}
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            Carregando tabela de planos do Supabase...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = currentUser?.planId === p.id;
              const isStudio = p.id === 'plan-studio';
              const isPro = p.id === 'plan-pro';

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                    isCurrent
                      ? 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/40'
                      : isPro
                      ? 'border-rose-500/50 bg-neutral-950 shadow-xl shadow-rose-950/20'
                      : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white shadow-md">
                      Mais Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                        {isStudio && <Crown className="h-4 w-4 text-amber-400" />}
                        {p.name}
                      </h3>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                          Seu Plano
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 min-h-[36px]">{p.description}</p>

                    <div className="mt-5 mb-6 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        {(p.price_cents / 100).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      <span className="text-xs text-neutral-400">/mês</span>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2.5 text-xs text-neutral-300 border-t border-neutral-800/80 pt-4">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Agendamentos ilimitados</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Catálogo de serviços online</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Notificações via WhatsApp</span>
                      </div>
                      {(isPro || isStudio) && (
                        <>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>Capa Cinema com foto e vídeo</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>CRM de retenção 30/60/90 dias</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>Split de cobrança automático 3%</span>
                          </div>
                        </>
                      )}
                      {isStudio && (
                        <>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>Múltiplos profissionais & cadeiras</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>Rede de afiliados e comissões</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-400 cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Plano Ativo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(p)}
                        className={`w-full rounded-xl py-2.5 text-xs font-semibold text-white shadow-md transition active:scale-[0.98] ${
                          isPro
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95'
                            : 'bg-neutral-800 hover:bg-neutral-700'
                        }`}
                      >
                        Assinar {p.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
