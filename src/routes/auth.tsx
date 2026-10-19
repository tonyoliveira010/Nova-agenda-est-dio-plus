import { createFileRoute, ClientOnly, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Entrar ou criar conta — Ustudio' },
    { name: 'description', content: 'Crie sua conta profissional e organize a sua barbearia com Ustudio.' },
    { property: 'og:title', content: 'Sua conta profissional — Ustudio' },
    { property: 'og:description', content: 'Acesse sua conta ou comece a organizar sua barbearia.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ClientOnly><AuthPage /></ClientOnly>,
});
function AuthPage() {
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => setSignedIn(!!data?.session));
    const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSignedIn(!!session));
    return () => data?.subscription?.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = signup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else if (result.data.session) await navigate({ to: '/' });
      else setMessage('Confira seu e-mail para confirmar o cadastro antes de entrar.');
    } catch { setMessage('Não foi possível conectar. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <main className="studio-theme flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
    <div className="w-full max-w-sm space-y-6">
      <Link to="/onboarding" className="text-sm text-muted-foreground">← Conhecer a plataforma</Link>
      <h1 className="text-3xl font-bold">Ustudio</h1>
      {signedIn ? <><h2 className="text-xl">Sua conta está conectada</h2><Button asChild className="w-full"><Link to="/">Abrir painel</Link></Button><Button variant="outline" className="w-full" onClick={async () => { await supabase.auth.signOut(); setSignedIn(false); }}>Sair da conta</Button></> : <>
        <h2 className="text-xl font-semibold">{signup ? 'Crie sua conta profissional' : 'Bem-vindo de volta'}</h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">E-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-secondary p-3" /></label>
          <label className="block text-sm">Senha<input required type="password" minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-secondary p-3" /></label>
          <Button disabled={busy} type="submit" className="w-full">{busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</Button>
        </form>
        <Button variant="outline" disabled={busy} className="w-full" onClick={async () => { setBusy(true); try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth` }); if (result.error) setMessage(result.error.message); else if (!result.redirected) await navigate({ to: '/' }); } catch { setMessage('Não foi possível entrar com Google.'); } finally { setBusy(false); } }}>Continuar com Google</Button>
        <Button variant="link" onClick={() => { setSignup(!signup); setMessage(''); }}>{signup ? 'Já tenho conta · Entrar' : 'Não tenho conta · Cadastrar'}</Button>
      </>}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </div>
  </main>;
}