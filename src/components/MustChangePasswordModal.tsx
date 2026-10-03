import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { changePassword } from '../lib/auth-service';

interface MustChangePasswordModalProps {
  userEmail: string;
  onSuccess: () => void;
}

export const MustChangePasswordModal: React.FC<MustChangePasswordModalProps> = ({
  userEmail,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('tony2000');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('A nova senha deve possuir no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não coincide com a nova senha.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('A nova senha deve ser diferente da senha temporária (tony2000).');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Falha ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-neutral-900 shadow-2xl p-6 md:p-8 text-neutral-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-50">
              Troca Obrigatória de Senha
            </h2>
            <p className="text-xs text-neutral-400 font-mono">{userEmail}</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 mb-5 text-xs text-amber-200 leading-relaxed">
          <p className="font-semibold text-amber-100 mb-1 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Acesso de Administrador Detectado
          </p>
          Por determinação de segurança, o acesso inicial com a credencial padrão{' '}
          <code className="bg-amber-950/60 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">
            tony2000
          </code>{' '}
          exige a definição imediata de uma nova senha pessoal para liberação do Super Admin.
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Senha Temporária Atual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="tony2000"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Nova Senha (Mínimo 8 caracteres)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha segura"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? (
                'Salvando nova senha...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar Nova Senha & Liberar Plataforma
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
