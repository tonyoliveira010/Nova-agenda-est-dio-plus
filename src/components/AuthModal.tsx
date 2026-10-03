import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { signIn, signUp, resetPassword, UserAccount } from '../lib/auth-service';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (account: UserAccount) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!isOpen) return null;

  const handleAdminQuickFill = () => {
    setEmail('tonyoliveira800@gmail.com');
    setPassword('tony2000');
    setMode('login');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const account = await signIn(email, password);
        onAuthSuccess(account);
        onClose();
      } else if (mode === 'signup') {
        const account = await signUp({
          fullName,
          email,
          phone,
          password,
        });
        onAuthSuccess(account);
        onClose();
      } else {
        await resetPassword(email);
        setNotice('Instruções de redefinição de senha enviadas para o e-mail informado.');
      }
    } catch (err: any) {
      setError(err?.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 md:p-8 text-neutral-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold shadow-md">
            M
          </div>
          <span className="text-lg font-bold tracking-tight text-white">agendo</span>
          <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            SaaS Live
          </span>
        </div>

        <h3 className="text-xl font-bold text-neutral-50 mb-1">
          {mode === 'login' && 'Entrar na Plataforma'}
          {mode === 'signup' && 'Criar Conta — 7 Dias Grátis'}
          {mode === 'forgot' && 'Recuperar Acesso'}
        </h3>
        <p className="text-xs text-neutral-400 mb-5">
          {mode === 'login' && 'Acesse seus agendamentos, clientes e configurações do estúdio.'}
          {mode === 'signup' && 'Teste completo sem compromisso. Comece em menos de 1 minuto.'}
          {mode === 'forgot' && 'Informe seu e-mail cadastrado para redefinir sua senha.'}
        </p>

        {/* Quick Admin Access Hint Box */}
        {mode === 'login' && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>Login Adm:</strong> tonyoliveira800@gmail.com
              </span>
            </div>
            <button
              type="button"
              onClick={handleAdminQuickFill}
              className="rounded-lg bg-rose-600/80 hover:bg-rose-500 px-2 py-1 text-[11px] font-medium text-white transition active:scale-95"
            >
              Preencher
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome do Estúdio / Profissional
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Studio Bella Donna"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 pl-9 pr-3.5 py-2.5 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  WhatsApp com DDD
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 pl-9 pr-3.5 py-2.5 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 pl-9 pr-3.5 py-2.5 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 pl-9 pr-10 py-2.5 text-sm text-neutral-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 mt-2"
          >
            {loading ? (
              'Processando...'
            ) : mode === 'login' ? (
              <>
                Acessar Plataforma <ArrowRight className="h-4 w-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <Sparkles className="h-4 w-4" /> Criar Minha Conta Grátis
              </>
            ) : (
              'Enviar Link de Recuperação'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          {mode === 'login' ? (
            <>
              <span>Ainda não possui conta?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="font-semibold text-rose-400 hover:text-rose-300"
              >
                Cadastre-se grátis
              </button>
            </>
          ) : (
            <>
              <span>Já tem uma conta cadastrada?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-semibold text-rose-400 hover:text-rose-300"
              >
                Fazer login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
