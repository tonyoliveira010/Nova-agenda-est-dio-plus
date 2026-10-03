import React, { useState, useEffect } from 'react';
import {
  Check,
  Zap,
  Crown,
  ShieldCheck,
  QrCode,
  Copy,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Lock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchPlans, createPixForPlan, confirmPlanSubscription, PixCharge } from '../lib/plans-service';
import { getCurrentUser, UserAccount } from '../lib/auth-service';

export interface PlanItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  price_cents: number;
  trialDays: number;
  description: string;
  isPopular?: boolean;
  unlockedFeatures: string[];
  lockedFeatures: { title: string; note: string }[];
}

export const PlanosPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        setCustomerName(u.fullName || '');
        setCustomerPhone(u.phone || '');
      }
    });

    // Lê configurações de estratégia do Admin salvas no localStorage
    try {
      const globalDays = parseInt(localStorage.getItem('agendo_global_trial_days') || '3', 10);
      const strategyMode = localStorage.getItem('agendo_active_strategy_mode') || 'trial_1990';
      const rawMatrix = localStorage.getItem('agendo_plan_matrix');

      let basicTrial = globalDays; // 3 ou 7 dias
      let premiumTrial = 14; // 7 ou 14 dias
      let basicPrice = 19.90;
      let premiumPrice = 79.90;

      if (strategyMode === 'hybrid_1990_to_7990') {
        basicPrice = 19.90;
        premiumPrice = 79.90;
      }

      const defaultTwoPlans: PlanItem[] = [
        {
          id: 'plan-basic',
          name: 'Plano Inicial',
          price: basicPrice,
          originalPrice: 29.90,
          price_cents: Math.round(basicPrice * 100),
          trialDays: basicTrial,
          description: 'Ideal para conhecer a plataforma com agendamento online completo e catálogo de serviços.',
          isPopular: false,
          unlockedFeatures: [
            'Link exclusivo para agendamento online 24h',
            'Catálogo completo de procedimentos e fotos',
            'Confirmação e notificações no WhatsApp do cliente',
            'Agenda digital e controle diário de atendimentos',
            'Controle financeiro essencial de receitas',
          ],
          lockedFeatures: [
            { title: 'Capa Cinema com fotos e vídeos', note: 'Exclusivo no Plano Premium' },
            { title: 'CRM de retenção de clientes 30/60/90 dias', note: 'Exclusivo no Plano Premium' },
            { title: 'Split automático de 3% via Pix', note: 'Exclusivo no Plano Premium' },
            { title: 'Multi-profissionais e gestão de cadeiras', note: 'Exclusivo no Plano Premium' },
            { title: 'Banners de anúncios e programa de afiliados', note: 'Em breve · Estratégia de Antecipação' },
          ],
        },
        {
          id: 'plan-premium',
          name: 'Plano Premium',
          price: premiumPrice,
          originalPrice: 99.90,
          price_cents: Math.round(premiumPrice * 100),
          trialDays: premiumTrial,
          description: 'Acesso total e irrestrito: Capa Cinema, CRM avançado, múltiplos profissionais e split Pix.',
          isPopular: true,
          unlockedFeatures: [
            'Tudo incluso do Plano Inicial',
            'Capa Cinema estilizada com fotos e vídeos',
            'CRM de retenção de clientes 30/60/90 dias e LTV',
            'Split automático de 3% via Pix na liquidação',
            'Múltiplos profissionais e gestão de cadeiras do estúdio',
            'Relatórios avançados de faturamento e afiliados',
            'Suporte prioritário VIP direto no WhatsApp',
          ],
          lockedFeatures: [
            { title: 'IA Preditiva de Agendamentos', note: 'Em breve para assinantes Premium' },
          ],
        },
      ];

      setPlans(defaultTwoPlans);
      setLoading(false);
    } catch (e) {
      console.warn('Erro ao carregar planos:', e);
      setLoading(false);
    }
  }, []);

  const handleSelectPlan = async (plan: PlanItem) => {
    setSelectedPlan(plan);
    setPixCharge(null);
    setPixPaid(false);
    setGenerating(true);

    const currentUser = user || {
      id: `anon_${Date.now()}`,
      email: `${customerPhone.replace(/\D/g, '') || 'estudio'}@agendo.app`,
      fullName: customerName || 'Profissional agendo',
      phone: customerPhone || '(11) 98765-4321',
      isAdmin: false,
      mustChangePassword: false,
      planId: plan.id,
      planStatus: 'active' as const,
      periodEnd: new Date(Date.now() + 30 * 864e5).toISOString(),
    };

    try {
      const charge = await createPixForPlan(
        currentUser,
        {
          id: plan.id,
          name: plan.name,
          price_cents: plan.price_cents,
          description: plan.description,
          active: true,
          sort_order: 1,
          updated_at: new Date().toISOString(),
        },
        {
          name: currentUser.fullName || 'Profissional agendo',
          cpf: '00000000000',
          phone: currentUser.phone || '(11) 98765-4321',
        }
      );
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

  const handleConfirmPaid = async () => {
    if (!selectedPlan) return;
    setPixPaid(true);
    localStorage.setItem('agendo_active_plan', selectedPlan.id);
    if (user) {
      await confirmPlanSubscription(user.id, selectedPlan.id);
    }
    setTimeout(() => {
      window.location.href = '/painel-agenda';
    }, 1800);
  };

  const faqs = [
    {
      q: 'Como funciona o Plano Inicial de R$ 19,90?',
      a: 'O Plano Inicial foi desenhado para você conhecer a plataforma sem riscos. Você pode testar nos primeiros dias gratuitos configurados e depois continuar aproveitando seu catálogo completo e agendamento online 24h por apenas R$ 19,90 por mês.',
    },
    {
      q: 'Como funciona o Plano Premium de R$ 79,90?',
      a: 'O Plano Premium libera 100% dos recursos do ecossistema: Capa Cinema com vídeo/foto, CRM automático para trazer clientes de volta após 30/60/90 dias, divisão de comissão (split Pix), equipe e suporte VIP.',
    },
    {
      q: 'Posso começar no Inicial e depois migrar para o Premium?',
      a: 'Com certeza! Você pode começar pagando apenas R$ 19,90 para conhecer tudo e realizar o upgrade para o Plano Premium quando seu estúdio estiver escalando e precisar de múltiplos profissionais ou Capa Cinema.',
    },
    {
      q: 'Preciso cadastrar cartão de crédito para começar?',
      a: 'Não! Você não precisa cadastrar nenhum cartão. O pagamento é via Pix seguro e instantâneo sem surpresas nem cobranças indevidas.',
    },
    {
      q: 'Como meus clientes agendam com facilidade?',
      a: 'Você recebe um link exclusivo do seu estúdio para colocar na bio do Instagram ou enviar pelo WhatsApp. O cliente clica, escolhe o serviço, seleciona a data/hora e já recebe confirmação imediata.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* NAVBAR */}
      <header className="h-16 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-8">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
          <a href="/landingpage" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black shadow-md">
              a
            </div>
            <span className="text-lg font-bold text-white">agendo<span className="text-rose-500">.</span></span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/painel-agenda"
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Minha Agenda</span>
            </a>
            {user?.isAdmin && (
              <a
                href="/adm"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:opacity-90 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Super Admin</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-12 sm:py-16 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/25 px-4 py-1 text-xs font-semibold text-rose-400 mb-4">
          <Zap className="h-3.5 w-3.5" /> Planos Oficiais & Estrutura de Escala
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Escolha o plano perfeito para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">crescimento do seu estúdio.</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Sem contratos de fidelidade ou taxas ocultas. Comece a receber agendamentos automáticos direto no seu WhatsApp hoje mesmo.
        </p>
      </section>

      {/* PLANS GRID (TWO OFFICIAL PLANS) */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full flex-1">
        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            Carregando planos da plataforma...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.map((p) => {
              const isPremium = p.isPopular;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between relative transition-all ${
                    isPremium
                      ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/20 via-neutral-900 to-neutral-900 shadow-2xl shadow-rose-950/20 ring-1 ring-rose-500/40'
                      : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-700 shadow-lg'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-4 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Mais Escolhido · Acesso Total
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {isPremium ? <Crown className="h-5 w-5 text-amber-400" /> : <Zap className="h-4 w-4 text-rose-400" />}
                        {p.name}
                      </h3>
                      {p.trialDays > 0 && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                          {p.trialDays} Dias de Degustação
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 min-h-[38px] leading-relaxed">{p.description}</p>

                    <div className="my-6">
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm line-through text-neutral-500 font-semibold">
                            {p.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="rounded-full bg-rose-500/20 text-rose-400 px-2 py-0.5 text-[10px] font-bold">
                            Oferta Ativa
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-white">
                          {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">/mês</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-3 text-xs text-neutral-300 border-t border-neutral-800 pt-5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Funções Disponíveis:
                      </div>
                      {p.unlockedFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}

                      {/* Locked Features / Anticipation Strategy */}
                      {p.lockedFeatures && p.lockedFeatures.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-neutral-800/80 space-y-2.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                            Estratégia de Antecipação & Upgrade:
                          </div>
                          {p.lockedFeatures.map((lfeat, i) => (
                            <div key={i} className="flex items-start justify-between gap-2 text-neutral-400">
                              <div className="flex items-start gap-2">
                                <Lock className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
                                <span className="line-through decoration-neutral-600">{lfeat.title}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 shrink-0">
                                {lfeat.note}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(p)}
                      className={`w-full rounded-xl py-3.5 text-xs font-bold text-white shadow-lg transition active:scale-[0.98] ${
                        isPremium
                          ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 shadow-rose-900/40 text-sm'
                          : 'bg-neutral-800 hover:bg-neutral-700'
                      }`}
                    >
                      {isPremium
                        ? `Ativar ${p.name} (R$ 79,90) ➔`
                        : `Começar no ${p.name} (R$ 19,90) ➔`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INSTANT PIX CHECKOUT MODAL (SEM FORMULÁRIOS DE CADASTRO OU LOGIN) */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-neutral-100 shadow-2xl relative">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setPixCharge(null);
                  setPixPaid(false);
                }}
                className="absolute right-4 top-4 text-neutral-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Checkout Seguro
                </span>
                <span className="text-xs text-neutral-400">Pix Instantâneo Synic</span>
              </div>
              <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Valor:{' '}
                <strong className="text-emerald-400 text-sm">
                  {selectedPlan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  /mês
                </strong>{' '}
                {selectedPlan.trialDays > 0 && `(Degustação de ${selectedPlan.trialDays} dias)`}
              </p>

              {pixPaid ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-300">Pagamento Confirmado!</h4>
                  <p className="text-xs text-neutral-300">
                    Seu estúdio foi ativado no plano {selectedPlan.name}. Redirecionando para o seu painel de agenda...
                  </p>
                </div>
              ) : generating ? (
                <div className="py-12 text-center text-sm text-neutral-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                  <span>Gerando código Pix e chave de acesso...</span>
                </div>
              ) : pixCharge ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-lg">
                    <QRCodeSVG value={pixCharge.pixCode} size={190} level="M" />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-neutral-400">Pix Copia e Cola:</label>
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
                    <span>Aguardando liquidação Synic Pix... Liberação imediata.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPaid}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-semibold text-white hover:opacity-95 transition shadow-lg"
                  >
                    Já realizei o pagamento via Pix ✓
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>

      {/* FAQ SECTION */}
      <section className="bg-neutral-900/50 border-t border-neutral-800 py-14 sm:py-18 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Perguntas Frequentes</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Dúvidas sobre os Planos</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Tudo o que você precisa saber sobre a regra de R$ 19,90 e R$ 79,90 e a garantia de cancelamento.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-white hover:bg-neutral-800/40 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180 text-rose-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
