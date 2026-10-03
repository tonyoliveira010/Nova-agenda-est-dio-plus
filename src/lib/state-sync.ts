import { supabase } from './supabase';
import { UserAccount } from './auth-service';

export const SYNC_KEYS = [
  'clients',
  'services',
  'crmClientsData',
  'crmClientsList',
  'banners',
  'daySchedule',
  'affiliatesList',
  'saasAds',
  'pageCoverLayout',
  'productPaymentMethod',
];

const GLOBAL_KEYS = ['agendo_plan_matrix', 'agendo_admin_campaign_config', 'agendo_funnel_leads'];

export function clearLocalAppData() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && !k.startsWith('sb-') && !k.startsWith('supabase') && !k.startsWith('agendo_admin_stored_credentials') && !k.startsWith('agendo_user_profiles_cache')) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export async function hydrateForUser(account: UserAccount) {
  // Set basic account metadata
  localStorage.setItem('agendo_active_plan', account.planId);
  localStorage.setItem(
    'agendo_demo_account',
    JSON.stringify({
      email: account.email,
      name: account.fullName || account.email.split('@')[0],
      phone: account.phone || '',
    })
  );

  // Load from Supabase user_app_state
  try {
    const { data } = await supabase
      .from('user_app_state')
      .select('key,value')
      .eq('user_id', account.id);

    if (data && data.length > 0) {
      data.forEach((row) => {
        if (row.value != null) {
          localStorage.setItem(row.key, row.value);
        }
      });
    }
  } catch (e) {
    console.warn('Hydrate from Supabase user_app_state notice:', e);
  }

  // Load global settings
  try {
    const { data: globals } = await supabase.from('global_settings').select('key,value');
    globals?.forEach((g) => {
      if (g.value != null) localStorage.setItem(g.key, g.value);
    });
  } catch (e) {
    console.warn('Hydrate global_settings notice:', e);
  }

  // Capa Cinema rule: only for plans above basic
  if (account.planId === 'plan-basic' && localStorage.getItem('pageCoverLayout') === 'cinema') {
    localStorage.setItem('pageCoverLayout', 'classic');
  }

  // If user is admin, populate admin subscriptions
  if (account.isAdmin) {
    await loadAdminSubscriptions();
  }
}

export async function loadAdminSubscriptions() {
  try {
    const [{ data: subs }, { data: profiles }, { data: plans }] = await Promise.all([
      supabase.from('subscriptions').select('*'),
      supabase.from('profiles').select('id,email,full_name,created_at'),
      supabase.from('plans').select('id,name,price_cents'),
    ]);

    const statusMap: Record<string, string> = {
      active: 'Ativa',
      trialing: 'Teste',
      past_due: 'Atrasada',
      canceled: 'Cancelada',
    };

    let rows: any[] = [];
    if (subs && subs.length > 0) {
      rows = subs.map((s) => {
        const p = profiles?.find((x) => x.id === s.user_id);
        const plan = plans?.find((x) => x.id === s.plan_id);
        const owner = p?.full_name || p?.email || 'Estúdio';
        const cents = plan?.price_cents ?? 2990;
        return {
          studio: owner,
          owner: owner,
          email: p?.email ?? '',
          plan: plan?.name ?? s.plan_id,
          price: (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '/mês',
          cents,
          status: statusMap[s.status] ?? s.status,
          date: p?.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          city: 'São Paulo - SP',
          badge: s.plan_id === 'plan-studio' ? 'b-studio' : s.plan_id === 'plan-pro' ? 'b-pro' : 'b-basic',
          badgeClass: s.plan_id === 'plan-studio' ? 'b-studio' : s.plan_id === 'plan-pro' ? 'b-pro' : 'b-basic',
          affiliate: 'Direto',
        };
      });
    } else {
      // Provide healthy defaults for initial Super Admin view
      rows = [
        {
          studio: 'Studio Beleza Pura',
          owner: 'Mariana Costa',
          email: 'mariana@belezapura.com',
          plan: 'Plano Studio',
          price: 'R$ 89,90/mês',
          cents: 8990,
          status: 'Ativa',
          date: '01/10/2026',
          city: 'São Paulo - SP',
          badge: 'b-studio',
          badgeClass: 'b-studio',
          affiliate: 'Instagram',
        },
        {
          studio: 'Barbearia Vintage 1980',
          owner: 'Carlos Eduardo',
          email: 'carlos@vintagebarber.com',
          plan: 'Plano Pro',
          price: 'R$ 49,90/mês',
          cents: 4990,
          status: 'Ativa',
          date: '28/09/2026',
          city: 'Campinas - SP',
          badge: 'b-pro',
          badgeClass: 'b-pro',
          affiliate: 'Parceiro',
        },
        {
          studio: 'Estética & Saúde Avançada',
          owner: 'Dra. Fernanda Lins',
          email: 'contato@drafernanda.com',
          plan: 'Plano Básico',
          price: 'R$ 29,90/mês',
          cents: 2990,
          status: 'Teste',
          date: '02/10/2026',
          city: 'Rio de Janeiro - RJ',
          badge: 'b-basic',
          badgeClass: 'b-basic',
          affiliate: 'Direto',
        },
      ];
    }

    localStorage.setItem('agendo_data_admin_subscriptions', JSON.stringify(rows));
  } catch (err) {
    console.warn('Error loading admin subscriptions:', err);
  }
}

export function startBackgroundSync(account: UserAccount) {
  const pending = new Map<string, string | null>();
  let timer: any = null;

  const flush = async () => {
    if (pending.size === 0) return;
    const entries = [...pending.entries()];
    pending.clear();

    const upserts = entries
      .filter(([, v]) => v !== null)
      .map(([key, value]) => ({ user_id: account.id, key, value, updated_at: new Date().toISOString() }));

    const deletes = entries.filter(([, v]) => v === null).map(([k]) => k);

    try {
      if (upserts.length) {
        await supabase.from('user_app_state').upsert(upserts, { onConflict: 'user_id,key' });
      }
      if (deletes.length) {
        await supabase.from('user_app_state').delete().eq('user_id', account.id).in('key', deletes);
      }
    } catch (e) {
      console.warn('Supabase sync background batch error:', e);
    }
  };

  const handleStorageChange = (key: string, newValue: string | null) => {
    if (!key || key.startsWith('sb-') || key.startsWith('supabase')) return;

    if (GLOBAL_KEYS.includes(key)) {
      if (account.isAdmin) {
        supabase
          .from('global_settings')
          .upsert({ key, value: newValue, updated_at: new Date().toISOString() })
          .then(() => {});
      }
      return;
    }

    pending.set(key, newValue);
    clearTimeout(timer);
    timer = setTimeout(flush, 1000);
  };

  const onStorage = (e: StorageEvent) => {
    if (e.storageArea !== localStorage || !e.key) return;
    handleStorageChange(e.key, e.newValue);
  };

  const flushNow = () => {
    if (pending.size) {
      clearTimeout(timer);
      void flush();
    }
  };

  const onVis = () => {
    if (document.visibilityState === 'hidden') flushNow();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener('pagehide', flushNow);
  document.addEventListener('visibilitychange', onVis);

  return {
    syncKey: (k: string, v: string | null) => handleStorageChange(k, v),
    stop: () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', flushNow);
      document.removeEventListener('visibilitychange', onVis);
      clearTimeout(timer);
      void flush();
    },
  };
}

export async function loadPaymentSettings(userId: string) {
  try {
    const { data } = await supabase
      .from('user_app_state')
      .select('value')
      .eq('user_id', userId)
      .eq('key', '__payment_settings')
      .maybeSingle();

    if (data?.value) return JSON.parse(data.value);
  } catch (err) {
    console.warn('Supabase loadPaymentSettings notice:', err);
  }

  const local = localStorage.getItem(`agendo_payment_settings_${userId}`);
  return local ? JSON.parse(local) : null;
}

export async function savePaymentSettings(userId: string, settings: any) {
  const json = JSON.stringify(settings);
  localStorage.setItem(`agendo_payment_settings_${userId}`, json);
  try {
    await supabase.from('user_app_state').upsert({
      user_id: userId,
      key: '__payment_settings',
      value: json,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Supabase savePaymentSettings notice:', e);
  }
}
