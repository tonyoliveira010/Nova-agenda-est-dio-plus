import { supabase, ProfileRow, SubscriptionRow } from './supabase';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isAdmin: boolean;
  mustChangePassword: boolean;
  planId: string;
  planStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  periodEnd: string | null;
}

const ADMIN_EMAIL = 'tonyoliveira800@gmail.com';
const ADMIN_INITIAL_PASSWORD = 'tony2000';
const LOCAL_SESSION_KEY = 'agendo_live_session';
const ADMIN_CREDENTIALS_KEY = 'agendo_admin_stored_credentials';
const USER_PROFILES_KEY = 'agendo_user_profiles_cache';

// Helper to get stored admin credential or default
function getAdminStoredPassword(): string {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.password) return parsed.password;
    }
  } catch (e) {
    console.warn('Error reading admin credentials', e);
  }
  return ADMIN_INITIAL_PASSWORD;
}

function hasAdminChangedPassword(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.passwordChanged);
    }
  } catch (e) {
    console.warn('Error reading admin credentials', e);
  }
  return false;
}

// Get cached profiles
function getStoredProfiles(): Record<string, { password: string; profile: UserAccount }> {
  try {
    const raw = localStorage.getItem(USER_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredProfiles(profiles: Record<string, { password: string; profile: UserAccount }>) {
  try {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('Error saving stored profiles', e);
  }
}

export async function getCurrentUser(): Promise<UserAccount | null> {
  // Check Supabase session first
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const u = data.session.user;
      const isAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // Fetch profile from supabase if available
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle();

      const account: UserAccount = {
        id: u.id,
        email: u.email || '',
        fullName: prof?.full_name || u.user_metadata?.full_name || (isAdmin ? 'Tony Oliveira' : 'Usuário'),
        phone: prof?.phone || u.user_metadata?.phone || null,
        isAdmin,
        mustChangePassword: prof ? prof.must_change_password : (isAdmin && !hasAdminChangedPassword()),
        planId: sub?.plan_id || (isAdmin ? 'plan-studio' : 'plan-basic'),
        planStatus: sub?.status || 'active',
        periodEnd: sub?.current_period_end || new Date(Date.now() + 30 * 864e5).toISOString(),
      };
      
      return account;
    }
  } catch (err) {
    console.warn('Supabase auth session check notice:', err);
  }

  // Fallback to local live session
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) {
      const session: UserAccount = JSON.parse(raw);
      if (session?.email) {
        if (session.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          session.isAdmin = true;
          session.mustChangePassword = !hasAdminChangedPassword();
          session.planId = 'plan-studio';
          session.planStatus = 'active';
        }
        return session;
      }
    }
  } catch (e) {
    console.warn('Local session error', e);
  }

  return null;
}

export async function signIn(emailInput: string, passwordInput: string): Promise<UserAccount> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !email.includes('@')) {
    throw new Error('Por favor, informe um endereço de e-mail válido.');
  }
  if (!password) {
    throw new Error('Informe sua senha de acesso.');
  }

  // 1. Check if this is the Admin account (Tony Oliveira)
  if (email === ADMIN_EMAIL.toLowerCase()) {
    const currentAdminPassword = getAdminStoredPassword();
    const isUsingInitialDefault = password === ADMIN_INITIAL_PASSWORD;
    const isUsingChangedPassword = password === currentAdminPassword;

    if (!isUsingInitialDefault && !isUsingChangedPassword) {
      throw new Error('Senha incorreta para a conta de administrador.');
    }

    const changed = hasAdminChangedPassword();
    // If the admin uses the initial default password "tony2000", they MUST change password immediately!
    const mustChange = isUsingInitialDefault || !changed;

    const adminAccount: UserAccount = {
      id: 'admin_tony_oliveira',
      email: ADMIN_EMAIL,
      fullName: 'Tony Oliveira (Super Admin)',
      phone: '(11) 98765-4321',
      isAdmin: true,
      mustChangePassword: mustChange,
      planId: 'plan-studio',
      planStatus: 'active',
      periodEnd: new Date(Date.now() + 365 * 864e5).toISOString(),
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminAccount));
    localStorage.setItem('agendo_active_plan', 'plan-studio');
    localStorage.setItem('agendo_demo_account', JSON.stringify({ email: adminAccount.email, name: adminAccount.fullName }));

    // Also sync admin profile to Supabase if connected
    try {
      await supabase.from('profiles').upsert({
        id: adminAccount.id,
        email: adminAccount.email,
        full_name: adminAccount.fullName,
        phone: adminAccount.phone,
        must_change_password: mustChange,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      await supabase.from('subscriptions').upsert({
        user_id: adminAccount.id,
        plan_id: 'plan-studio',
        status: 'active',
        current_period_end: adminAccount.periodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('Notice: profile sync to Supabase table:', e);
    }

    return adminAccount;
  }

  // 2. Try Supabase Auth for standard users
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const u = data.user;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', u.id).maybeSingle();

      const userAccount: UserAccount = {
        id: u.id,
        email: u.email || email,
        fullName: prof?.full_name || u.user_metadata?.full_name || email.split('@')[0],
        phone: prof?.phone || u.user_metadata?.phone || null,
        isAdmin: false,
        mustChangePassword: Boolean(prof?.must_change_password),
        planId: sub?.plan_id || 'plan-basic',
        planStatus: sub?.status || 'trialing',
        periodEnd: sub?.current_period_end || new Date(Date.now() + 7 * 864e5).toISOString(),
      };

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userAccount));
      localStorage.setItem('agendo_active_plan', userAccount.planId);
      localStorage.setItem('agendo_demo_account', JSON.stringify({ email: userAccount.email, name: userAccount.fullName }));
      return userAccount;
    }
  } catch {
    // If Supabase direct auth fails or requires email confirmation, fallback to cached accounts
  }

  // 3. Fallback to cached registered users
  const profiles = getStoredProfiles();
  const existing = profiles[email];
  if (existing) {
    if (existing.password !== password) {
      throw new Error('E-mail ou senha incorretos.');
    }
    const acc = existing.profile;
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(acc));
    localStorage.setItem('agendo_active_plan', acc.planId);
    localStorage.setItem('agendo_demo_account', JSON.stringify({ email: acc.email, name: acc.fullName }));
    return acc;
  }

  throw new Error('Usuário não encontrado ou senha incorreta.');
}

export async function signUp(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserAccount> {
  const email = data.email.trim().toLowerCase();
  const password = data.password.trim();
  const fullName = data.fullName.trim();
  const phone = data.phone.trim();

  if (!fullName) throw new Error('Por favor, informe seu nome completo.');
  if (!email || !email.includes('@')) throw new Error('Por favor, informe um e-mail válido.');
  if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

  // Try creating in Supabase
  let supabaseUserId = '';
  try {
    const { data: suData, error: suError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    if (!suError && suData.user) {
      supabaseUserId = suData.user.id;
    }
  } catch (err) {
    console.warn('Supabase auth signup attempt:', err);
  }

  const userId = supabaseUserId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const trialEnd = new Date(Date.now() + 7 * 864e5).toISOString();

  const newAccount: UserAccount = {
    id: userId,
    email,
    fullName,
    phone,
    isAdmin: email === ADMIN_EMAIL.toLowerCase(),
    mustChangePassword: false,
    planId: 'plan-basic',
    planStatus: 'trialing',
    periodEnd: trialEnd,
  };

  // Cache in stored profiles
  const profiles = getStoredProfiles();
  profiles[email] = {
    password,
    profile: newAccount,
  };
  saveStoredProfiles(profiles);

  // Set active session
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newAccount));
  localStorage.setItem('agendo_active_plan', 'plan-basic');
  localStorage.setItem('agendo_demo_account', JSON.stringify({ email: newAccount.email, name: newAccount.fullName }));

  // Try persisting to Supabase tables
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      phone,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_id: 'plan-basic',
      status: 'trialing',
      current_period_end: trialEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.warn('Notice writing to Supabase tables:', e);
  }

  return newAccount;
}

export async function changePassword(currentPass: string, newPass: string): Promise<void> {
  const current = await getCurrentUser();
  if (!current) throw new Error('Nenhum usuário autenticado.');

  if (newPass.length < 8) {
    throw new Error('A nova senha deve ter no mínimo 8 caracteres.');
  }
  if (currentPass === newPass) {
    throw new Error('A nova senha deve ser diferente da senha atual.');
  }

  if (current.isAdmin || current.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    const stored = getAdminStoredPassword();
    if (currentPass !== stored && currentPass !== ADMIN_INITIAL_PASSWORD) {
      throw new Error('A senha atual informada está incorreta.');
    }

    // Save newly updated permanent password
    localStorage.setItem(
      ADMIN_CREDENTIALS_KEY,
      JSON.stringify({
        password: newPass,
        passwordChanged: true,
        updatedAt: new Date().toISOString(),
      })
    );

    // Update active session
    current.mustChangePassword = false;
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(current));

    // Try Supabase profile update
    try {
      await supabase
        .from('profiles')
        .update({ must_change_password: false, updated_at: new Date().toISOString() })
        .eq('id', current.id);
    } catch (e) {
      console.warn('Supabase update notice', e);
    }

    return;
  }

  // Standard user password change
  const profiles = getStoredProfiles();
  const entry = profiles[current.email.toLowerCase()];
  if (entry && entry.password !== currentPass) {
    throw new Error('A senha atual informada está incorreta.');
  }

  if (entry) {
    entry.password = newPass;
    entry.profile.mustChangePassword = false;
    profiles[current.email.toLowerCase()] = entry;
    saveStoredProfiles(profiles);
  }

  current.mustChangePassword = false;
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(current));

  try {
    await supabase.auth.updateUser({ password: newPass });
    await supabase
      .from('profiles')
      .update({ must_change_password: false, updated_at: new Date().toISOString() })
      .eq('id', current.id);
  } catch (e) {
    console.warn('Supabase password change notice:', e);
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase signOut notice', e);
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem('agendo_demo_account');
}

export async function resetPassword(email: string): Promise<void> {
  if (!email || !email.includes('@')) throw new Error('Informe um e-mail válido.');
  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  } catch {
    // Graceful acknowledgement
  }
}
