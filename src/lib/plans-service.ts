import { supabase, PlanRow } from './supabase';
import { UserAccount } from './auth-service';

export const DEFAULT_PLANS: PlanRow[] = [
  {
    id: 'plan-basic',
    name: 'Plano Inicial',
    price_cents: 1990,
    description: 'Acesso essencial para conhecer a plataforma com agendamento online 24h e catálogo de serviços.',
    active: true,
    sort_order: 1,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-premium',
    name: 'Plano Premium',
    price_cents: 7990,
    description: 'Acesso total: Capa Cinema, CRM avançado 30/60/90, split Pix 3%, múltiplos profissionais e relatórios.',
    active: true,
    sort_order: 2,
    updated_at: new Date().toISOString(),
  },
];

export interface PlanStrategyConfig {
  mode: 'trial_1990' | 'premium_7990' | 'hybrid_1990_to_7990' | 'custom';
  trialDays: number;
  initialPrice: number;
  renewalPrice: number;
  description: string;
}

export const PRESET_STRATEGIES: Record<string, PlanStrategyConfig> = {
  trial_1990: {
    mode: 'trial_1990',
    trialDays: 3, // pode ser 3 ou 7
    initialPrice: 19.90,
    renewalPrice: 19.90,
    description: 'Conhecer a plataforma por até 7 dias (ex: 3 dias grátis) e depois R$ 19,90/mês.',
  },
  premium_7990: {
    mode: 'premium_7990',
    trialDays: 14, // 7 ou 14 dias
    initialPrice: 79.90,
    renewalPrice: 79.90,
    description: 'Plano Premium de R$ 79,90/mês com até 7 ou 14 dias gratuitos de degustação completa.',
  },
  hybrid_1990_to_7990: {
    mode: 'hybrid_1990_to_7990',
    trialDays: 14,
    initialPrice: 19.90,
    renewalPrice: 79.90,
    description: 'Pagar apenas R$ 19,90 para usar tudo por 14 dias e depois atualizar automaticamente para R$ 79,90.',
  },
};

// Unified Synic Webhook Processor
export interface SynicWebhookPayload {
  event?: string;
  status?: string;
  transaction_id?: string;
  payment_id?: string;
  amount_cents?: number;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  metadata?: {
    user_id?: string;
    plan_id?: string;
    funnel?: boolean;
    strategy?: string;
  };
}

export function handleSynicWebhook(payload: SynicWebhookPayload): {
  success: boolean;
  status: 'aprovado' | 'aguardando' | 'lead_capturado';
  message: string;
} {
  const rawStatus = (payload.status || payload.event || '').toLowerCase();
  
  if (
    rawStatus.includes('aprovado') ||
    rawStatus.includes('liquidado') ||
    rawStatus.includes('paid') ||
    rawStatus.includes('approved')
  ) {
    if (payload.metadata?.user_id && payload.metadata?.plan_id) {
      confirmPlanSubscription(payload.metadata.user_id, payload.metadata.plan_id);
    }
    return {
      success: true,
      status: 'aprovado',
      message: 'Pagamento liquidado com sucesso via Webhook Synic (aprovado).',
    };
  }

  if (
    rawStatus.includes('aguardando') ||
    rawStatus.includes('pix_gerado') ||
    rawStatus.includes('pending') ||
    rawStatus.includes('waiting')
  ) {
    return {
      success: true,
      status: 'aguardando',
      message: 'Cobrança Pix Synic gerada, aguardando liquidação.',
    };
  }

  return {
    success: true,
    status: 'lead_capturado',
    message: 'Lead capturado no sistema com sucesso.',
  };
}

export async function fetchPlans(): Promise<PlanRow[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetchPlans error:', err);
  }

  // Fallback to local default plans
  return DEFAULT_PLANS;
}

export async function updatePlan(plan: PlanRow): Promise<void> {
  try {
    const { error } = await supabase
      .from('plans')
      .update({
        name: plan.name,
        price_cents: plan.price_cents,
        description: plan.description,
        active: plan.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', plan.id);

    if (error) throw error;
  } catch (err) {
    console.warn('Update plan Supabase fallback:', err);
  }
}

export interface PixCharge {
  paymentId: string;
  pixCode: string;
  qrCodeUrl: string;
  amountCents: number;
  expiresAt: string;
}

// Generates an authentic EMV Pix payload for Brazilian Central Bank standard
export function generatePixCopiaECola(params: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txId: string;
}): string {
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const merchantAccount = formatField('00', 'BR.GOV.BCB.PIX') + formatField('01', params.key);
  const additionalData = formatField('05', params.txId);

  let raw =
    formatField('00', '01') + // Format indicator
    formatField('26', merchantAccount) +
    formatField('52', '0000') + // Merchant category
    formatField('53', '986') + // Currency: BRL
    formatField('54', params.amount.toFixed(2)) +
    formatField('58', 'BR') + // Country
    formatField('59', params.name.substring(0, 25)) +
    formatField('60', params.city.substring(0, 15)) +
    formatField('62', additionalData) +
    '6304'; // CRC16 placeholder

  // CRC-16-CCITT calculation
  let crc = 0xffff;
  for (let i = 0; i < raw.length; i++) {
    crc ^= raw.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return raw + crcHex;
}

export async function createPixForPlan(
  user: UserAccount,
  plan: PlanRow,
  clientDetails: { name: string; cpf: string; phone: string }
): Promise<PixCharge> {
  const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const txId = `AGENDO${Date.now().toString().slice(-8)}`;
  const pixKey = 'tonyoliveira800@gmail.com'; // Real pix receiver for the SaaS owner

  const pixCode = generatePixCopiaECola({
    key: pixKey,
    name: 'AGENDO SAAS HUB',
    city: 'SAO PAULO',
    amount: plan.price_cents / 100,
    txId: txId,
  });

  // Try storing in plan_payments table
  try {
    await supabase.from('plan_payments').insert({
      id: paymentId,
      user_id: user.id,
      plan_id: plan.id,
      amount_cents: plan.price_cents,
      pix_code: pixCode,
      identifier: txId,
      status: 'pending',
    });
  } catch (e) {
    console.warn('Notice writing to plan_payments:', e);
  }

  return {
    paymentId,
    pixCode,
    qrCodeUrl: pixCode,
    amountCents: plan.price_cents,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

export async function confirmPlanSubscription(
  userId: string,
  planId: string
): Promise<void> {
  const newPeriodEnd = new Date(Date.now() + 30 * 864e5).toISOString();

  localStorage.setItem('agendo_active_plan', planId);

  try {
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      current_period_end: newPeriodEnd,
      provider: 'pix_direct',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('Supabase subscription upsert notice:', err);
  }
}
