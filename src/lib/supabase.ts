import { createClient } from '@supabase/supabase-js';

// Configuration from environment variables
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://htyecexmajvalbxexoif.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_z6U4v2UtorhU6UL6op-rtQ_FIl-nBpb';

export interface PlanRow {
  id: string;
  name: string;
  price_cents: number;
  description: string | null;
  active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  provider: string | null;
  provider_ref: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export interface UserAppStateRow {
  user_id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface GlobalSettingRow {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface UserRoleRow {
  id?: string;
  user_id: string;
  role: 'admin' | 'user';
}

export interface PlanPaymentRow {
  id?: string;
  user_id: string;
  plan_id: string;
  amount_cents: number;
  pix_code: string | null;
  identifier: string | null;
  status: string;
  paid_at: string | null;
  created_at?: string;
}

// Initializing Supabase client with localStorage session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});
