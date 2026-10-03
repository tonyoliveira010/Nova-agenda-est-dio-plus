import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  DollarSign,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { supabase, PlanRow } from '../lib/supabase';
import { fetchPlans, updatePlan } from '../lib/plans-service';

interface AdminManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminManagerModal: React.FC<AdminManagerModalProps> = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const p = await fetchPlans();
      setPlans(p);

      // Load users & subscriptions
      const [{ data: profs }, { data: subs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*'),
      ]);

      const combined = (profs || []).map((u) => {
        const sub = subs?.find((s) => s.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone,
          createdAt: u.created_at,
          planId: sub?.plan_id || 'plan-basic',
          planStatus: sub?.status || 'trialing',
          periodEnd: sub?.current_period_end,
        };
      });

      // Include admin if not present
      if (!combined.some((x) => x.email === 'tonyoliveira800@gmail.com')) {
        combined.unshift({
          id: 'admin_tony_oliveira',
          email: 'tonyoliveira800@gmail.com',
          fullName: 'Tony Oliveira (Super Admin)',
          phone: '(11) 98765-4321',
          createdAt: new Date().toISOString(),
          planId: 'plan-studio',
          planStatus: 'active',
          periodEnd: new Date(Date.now() + 365 * 864e5).toISOString(),
        });
      }

      setUsersList(combined);
    } catch (err: any) {
      console.warn('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePlan = async (p: PlanRow) => {
    setSavingPlanId(p.id);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updatePlan(p);
      setSuccessMsg(`Plano "${p.name}" atualizado com sucesso no Supabase!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao salvar plano.');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleUpdateUserPlan = async (userId: string, newPlanId: string, newStatus: string) => {
    try {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_id: newPlanId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, planId: newPlanId, planStatus: newStatus } : u))
      );
      setSuccessMsg('Assinatura do usuário atualizada com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  // KPIs calculation
  const totalUsers = usersList.length;
  const activeSubs = usersList.filter((u) => u.planStatus === 'active').length;
  const mrrTotal = usersList
    .filter((u) => u.planStatus === 'active')
    .reduce((acc, u) => {
      const pl = plans.find((p) => p.id === u.planId);
      return acc + (pl ? pl.price_cents : 2990);
    }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 md:p-8 text-neutral-100 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Central de Gestão Super Admin</h2>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Database className="h-3 w-3" /> Supabase Live
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Gerencie planos, preços, assinaturas e usuários em produção.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('plans')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'plans'
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Planos & Preços
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Usuários Cadastrados ({totalUsers})
            </button>
            <button
              onClick={loadData}
              title="Recarregar"
              className="rounded-xl border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time SaaS KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <span className="text-xs font-medium text-neutral-400">MRR Mensal Estimado</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {(mrrTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <span className="text-xs font-medium text-neutral-400">Estúdios Ativos</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{activeSubs}</span>
              <span className="text-xs text-neutral-400">assinantes pagos</span>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <span className="text-xs font-medium text-neutral-400">Cadastros Totais</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">{totalUsers}</span>
              <span className="text-xs text-neutral-400">contas registradas</span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: PLANS MANAGEMENT */}
        {activeTab === 'plans' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <p className="text-xs text-neutral-400">
              Edite diretamente os preços e descrições dos planos. Qualquer alteração é gravada no
              Supabase e atualizada imediatamente para todos os visitantes e checkout Pix.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-3"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Nome do Plano
                    </label>
                    <input
                      value={p.name}
                      onChange={(e) =>
                        setPlans((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, name: e.target.value } : item))
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Preço Mensal (R$)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={(p.price_cents / 100).toFixed(2)}
                        onChange={(e) => {
                          const val = Math.round(parseFloat(e.target.value || '0') * 100);
                          setPlans((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, price_cents: val } : item))
                          );
                        }}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none font-semibold text-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Descrição Resumida
                    </label>
                    <textarea
                      rows={2}
                      value={p.description || ''}
                      onChange={(e) =>
                        setPlans((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, description: e.target.value } : item
                          )
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 focus:border-rose-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.active}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, active: e.target.checked } : item
                            )
                          )
                        }
                        className="rounded border-neutral-700 text-rose-500 focus:ring-rose-500"
                      />
                      <span>Visível no site</span>
                    </label>

                    <button
                      type="button"
                      disabled={savingPlanId === p.id}
                      onClick={() => handleSavePlan(p)}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                    >
                      <Save className="h-3 w-3" />
                      {savingPlanId === p.id ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Estúdio / Usuário</th>
                    <th className="py-2.5 px-3">WhatsApp</th>
                    <th className="py-2.5 px-3">Cadastro</th>
                    <th className="py-2.5 px-3">Plano</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{user.fullName || 'Sem nome'}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-3 px-3 text-neutral-300">{user.phone || '—'}</td>
                      <td className="py-3 px-3 text-neutral-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={user.planId}
                          onChange={(e) =>
                            handleUpdateUserPlan(user.id, e.target.value, user.planStatus)
                          }
                          className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-200 focus:border-rose-500"
                        >
                          <option value="plan-basic">Plano Básico</option>
                          <option value="plan-pro">Plano Pro</option>
                          <option value="plan-studio">Plano Studio</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={user.planStatus}
                          onChange={(e) =>
                            handleUpdateUserPlan(user.id, user.planId, e.target.value)
                          }
                          className={`rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs font-medium ${
                            user.planStatus === 'active'
                              ? 'text-emerald-400'
                              : user.planStatus === 'trialing'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          <option value="active">Ativo (Pago)</option>
                          <option value="trialing">Em Teste (Degustação)</option>
                          <option value="past_due">Pendente</option>
                          <option value="canceled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
