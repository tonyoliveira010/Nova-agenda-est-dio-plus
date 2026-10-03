import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, UserAccount } from './lib/auth-service';
import { hydrateForUser, startBackgroundSync } from './lib/state-sync';
import { MustChangePasswordModal } from './components/MustChangePasswordModal';
import { PlanosPage } from './components/PlanosPage';

type AppRoute = 'landingpage' | 'painel-agenda' | 'adm' | 'planos' | 'funil' | 'app-cliente';

function getRouteFromLocation(): AppRoute {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase();

  if (
    path === '/app-cliente' ||
    path === '/app cliente' ||
    path === '/cliente' ||
    path === '/clientapp' ||
    path === '/portal' ||
    hash.includes('app-cliente') ||
    hash.includes('clientapp') ||
    hash.includes('cliente')
  ) {
    return 'app-cliente';
  }
  if (path === '/planos' || hash.includes('planos')) {
    return 'planos';
  }
  if (path === '/adm' || path === '/admin' || hash.includes('adm')) {
    return 'adm';
  }
  if (
    path === '/painel-agenda' ||
    path === '/painel agenda' ||
    path === '/agenda' ||
    path === '/app' ||
    hash.includes('agenda')
  ) {
    return 'painel-agenda';
  }
  if (path === '/funil' || hash.includes('funil')) {
    return 'funil';
  }
  // Default to landingpage
  return 'landingpage';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromLocation);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRouteFromLocation());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Navigate helper
  const navigateTo = useCallback((newRoute: AppRoute) => {
    setRoute(newRoute);
    const targetPath = newRoute === 'landingpage' ? '/landingpage' : `/${newRoute}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  // Load user
  const loadUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const u = await getCurrentUser();
      setCurrentUser(u);
      if (u) {
        if (u.mustChangePassword && u.isAdmin) {
          setShowAdminPasswordModal(true);
        }
        await hydrateForUser(u);
        startBackgroundSync(u);
      }
    } catch (e) {
      console.warn('Error loading user session', e);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen to postMessage from embedded native HTML pages
  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data || {};

      // 1. Navigation requests
      if (data.type === 'agendo:go' && typeof data.path === 'string') {
        const p = data.path.toLowerCase();
        if (p.includes('planos')) {
          navigateTo('planos');
        } else if (p.includes('adm')) {
          navigateTo('adm');
        } else if (p.includes('app-cliente') || p.includes('cliente') || p.includes('client')) {
          navigateTo('app-cliente');
        } else if (p.includes('painel-agenda') || p.includes('agenda')) {
          navigateTo('painel-agenda');
        } else if (p.includes('landing') || p.includes('inicio')) {
          navigateTo('landingpage');
        }
      }

      if (data.type === 'agendo:navigate') {
        const r = String(data.route || data.payload || '').toLowerCase();
        if (r.includes('adm')) navigateTo('adm');
        else if (r.includes('app-cliente') || r.includes('cliente') || r.includes('client')) navigateTo('app-cliente');
        else if (r.includes('agenda')) navigateTo('painel-agenda');
        else if (r.includes('planos')) navigateTo('planos');
        else if (r.includes('inicio') || r.includes('landing')) navigateTo('landingpage');
      }

      // 2. Authentication updates from native landingpage modals
      if (data.type === 'payment:login') {
        await loadUser();
        if (data.email && data.email.toLowerCase() === 'tonyoliveira800@gmail.com') {
          navigateTo('adm');
        } else {
          navigateTo('painel-agenda');
        }
      }

      if (data.type === 'onboarding:skip_to_auth') {
        // Redireciona para o cadastro da landing page
        navigateTo('landingpage');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [loadUser, navigateTo]);

  // Check admin security on /adm
  useEffect(() => {
    if (route === 'adm' && currentUser?.isAdmin && currentUser.mustChangePassword) {
      setShowAdminPasswordModal(true);
    }
  }, [route, currentUser]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative font-sans">
      {/* MANDATORY PASSWORD CHANGE MODAL (EXCLUSIVO PARA O ADMIN NA PRIMEIRA ENTRADA) */}
      {showAdminPasswordModal && currentUser?.isAdmin && (
        <MustChangePasswordModal
          userEmail={currentUser.email}
          onSuccess={() => {
            setShowAdminPasswordModal(false);
            currentUser.mustChangePassword = false;
            setCurrentUser({ ...currentUser });
          }}
        />
      )}

      {/* 1. PÁGINA DE PLANOS [/planos] */}
      {route === 'planos' && (
        <div className="h-full w-full overflow-y-auto">
          <PlanosPage />
        </div>
      )}

      {/* 2. LANDING PAGE [/landingpage] */}
      {route === 'landingpage' && (
        <div className="h-full w-full">
          <iframe
            src="/landing.html"
            title="Landing Page agendo"
            className="block h-full w-full border-0 bg-neutral-950"
          />
        </div>
      )}

      {/* 3. PAINEL DA AGENDA DO USUÁRIO [/painel-agenda, /cliente, /agenda] */}
      {route === 'painel-agenda' && (
        <div className="h-full w-full">
          <iframe
            src={
              window.location.pathname.includes('cliente') ||
              window.location.pathname.includes('client') ||
              window.location.hash.includes('clientapp') ||
              window.location.hash.includes('cliente') ||
              window.location.hash.includes('client')
                ? '/agenda.html#clientapp'
                : `/agenda.html${window.location.hash || ''}`
            }
            title="Painel Agenda & App do Usuário"
            className="block h-full w-full border-0 bg-neutral-950"
          />
        </div>
      )}

      {/* 4. SUPER ADMIN [/adm] */}
      {route === 'adm' && (
        <div className="h-full w-full">
          <iframe
            src="/adm.html"
            title="Super Admin SaaS"
            className="block h-full w-full border-0 bg-neutral-950"
          />
        </div>
      )}

      {/* 5. FUNIL DE VENDAS & QUIZ [/funil] */}
      {route === 'funil' && (
        <div className="h-full w-full">
          <iframe
            src="/funil.html"
            title="Funil de Conversão e Quiz agendo"
            className="block h-full w-full border-0 bg-neutral-950"
          />
        </div>
      )}

      {/* 6. APP DO CLIENTE [/app-cliente] */}
      {route === 'app-cliente' && (
        <div className="h-full w-full">
          <iframe
            src="/app-cliente.html"
            title="App do Cliente — Portal VIP"
            className="block h-full w-full border-0 bg-neutral-950"
          />
        </div>
      )}
    </div>
  );
}
