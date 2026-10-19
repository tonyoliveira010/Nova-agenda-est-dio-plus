export interface ProspectLead {
  id: string;
  name: string;
  category: 'barbearia' | 'estetica_automotiva';
  contactPerson: string;
  phone: string;
  bairro: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  status: 'novo' | 'em_contato' | 'apresentacao' | 'proposta' | 'convertido';
  potential: string;
  notes?: string;
  isSubscriber?: boolean; // Assinante ativo da plataforma
  planName?: string;
}

export interface ActiveSubscriber {
  id: string;
  businessName: string;
  category: 'barbearia' | 'estetica_automotiva';
  ownerName: string;
  phone: string;
  bairro: string;
  planId: string;
  planName: string;
  monthlyAmount: number;
  paymentMethod: 'pix_syncpay';
  status: 'active' | 'pending_renewal' | 'paused';
  startedAt: string;
  nextRenewalAt: string;
  lastPixTransactionId?: string;
  activeUpgrades: string[];
}

export interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  linkedFunctions?: string[];
}

export interface PlatformUpgrade {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  isActiveDefault?: boolean;
}

export interface SyncPayConfig {
  baseUrl: string;
  apiKey: string;
  clientSecret: string;
  pixKey: string;
  webhookUrl: string;
  autoActivateOnWebhook: boolean;
  isSandbox: boolean;
}

export interface SyncPayTransaction {
  identifier: string;
  payerName: string;
  payerPhone: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  pixKey: string;
  createdAt: string;
  planOrItem: string;
}

export const AVAILABLE_PLAN_FUNCTIONS = [
  { id: 'fn_catalog', label: 'Catálogo de Produtos para Venda & Reserva', icon: 'ShoppingBag' },
  { id: 'fn_whatsapp', label: 'Notificações & Lembretes Automáticos WhatsApp', icon: 'MessageCircle' },
  { id: 'fn_blocking', label: 'Bloqueio de Horários e Datas na Agenda', icon: 'Clock' },
  { id: 'fn_loyalty', label: 'Programa de Fidelidade VIP / Ouro / Bronze', icon: 'Award' },
  { id: 'fn_pix_syncpay', label: 'Integração API Pix SyncPay com Webhook', icon: 'Zap' },
  { id: 'fn_multistaff', label: 'Múltiplos Profissionais & Barbeiros', icon: 'Users' },
  { id: 'fn_deposit', label: 'Cobrança de Sinal / Caução Antecipado', icon: 'ShieldCheck' },
  { id: 'fn_neon_dashboard', label: 'Dashboard Financeiro com Gráfico Neon', icon: 'TrendingUp' },
  { id: 'fn_gallery', label: 'Tab de Galeria no Perfil Público (Grid 3x9)', icon: 'Image' },
  { id: 'fn_vip_support', label: 'Suporte VIP & Atendimento Prioritário', icon: 'Sparkles' },
];

export const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidG9ueW9saXZlaXJhMjAyNiIsImEiOiJjdXN0b20ifQ.placeholder';
export const MAPBOX_STYLE = (import.meta as any).env?.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/dark-v11';
export const CAMPINAS_CENTER: [number, number] = [-47.0626, -22.9099]; // [lng, lat]

export const INITIAL_PROSPECTS: ProspectLead[] = [
  {
    id: 'camp_1',
    name: 'Barbearia Dom Cambuí',
    category: 'barbearia',
    contactPerson: 'Marcelo Ramos',
    phone: '(19) 99876-5432',
    bairro: 'Cambuí',
    address: 'Rua Coronel Quirino, 1420 - Cambuí, Campinas - SP',
    coordinates: [-47.0512, -22.8985],
    status: 'novo',
    potential: 'Grande fluxo de executivos no bairro, 4 barbeiros, procurando agendamento mobile sem filas.',
    notes: 'Priorizar demonstração de fidelidade VIP e catálogo de corte e barba.',
    isSubscriber: false,
  },
  {
    id: 'camp_2',
    name: 'Custom Detailing Campinas',
    category: 'estetica_automotiva',
    contactPerson: 'Carlos Eduardo (Cadu)',
    phone: '(19) 99123-8899',
    bairro: 'Vila Itapura / Cambuí',
    address: 'Av. Orosimbo Maia, 1650 - Cambuí, Campinas - SP',
    coordinates: [-47.058, -22.901],
    status: 'apresentacao',
    potential: 'Estética automotiva premium, polimento cerâmico e vitrificação. Alto volume de agendamentos.',
    notes: 'Agendou demonstração. Apresentar ficha automotiva com modelo do carro e placa.',
    isSubscriber: false,
  },
  {
    id: 'camp_3',
    name: 'Black Diamond Barbearia & Club',
    category: 'barbearia',
    contactPerson: 'Rodrigo Toledo',
    phone: '(19) 99765-4321',
    bairro: 'Jardim Guanabara',
    address: 'Av. Barão de Itapura, 2180 - Jd. Guanabara, Campinas - SP',
    coordinates: [-47.0678, -22.892],
    status: 'em_contato',
    potential: 'Espaço com sinuca e bar. Interesse evidente no formato Cinema 9:16 e pagamento Pix.',
    notes: 'Solicitou o link demonstrativo da vitrine pública de clientes.',
    isSubscriber: false,
  },
  {
    id: 'camp_4',
    name: 'Speed Garage Auto Spa Taquaral',
    category: 'estetica_automotiva',
    contactPerson: 'Felipe Nogueira',
    phone: '(19) 98834-5511',
    bairro: 'Taquaral',
    address: 'Av. Heitor Penteado, 890 - Taquaral, Campinas - SP',
    coordinates: [-47.052, -22.8765],
    status: 'proposta',
    potential: 'Localização nobre ao lado da Lagoa do Taquaral. Atende mais de 120 veículos esportivos por mês.',
    notes: 'Proposta encaminhada para plano anual com carrossel de vídeos verticais.',
    isSubscriber: false,
  },
  {
    id: 'camp_5',
    name: 'Navalha de Ouro Barão Geraldo',
    category: 'barbearia',
    contactPerson: 'Gabriel Santos',
    phone: '(19) 99654-7722',
    bairro: 'Barão Geraldo',
    address: 'Rua Albino J. B. de Oliveira, 1120 - Barão Geraldo, Campinas - SP',
    coordinates: [-47.0862, -22.825],
    status: 'novo',
    potential: 'Público universitário da Unicamp e moradores locais. Alta demanda por agendamento mobile sem espera.',
    notes: 'Contato inicial agendado pelo WhatsApp comercial.',
    isSubscriber: false,
  },
  {
    id: 'camp_6',
    name: 'Vip Clean Detail Castelo',
    category: 'estetica_automotiva',
    contactPerson: 'André Vasconcelos',
    phone: '(19) 99234-9001',
    bairro: 'Castelo',
    address: 'Av. Alberto Sarmento, 640 - Castelo, Campinas - SP',
    coordinates: [-47.078, -22.898],
    status: 'convertido',
    potential: 'Cliente ativo na plataforma. Utilizando catálogo de serviços, bloqueio de datas e CRM completo.',
    notes: 'Case de sucesso em Campinas com taxa de fidelização elevada.',
    isSubscriber: true,
    planName: 'Plano Pro Studio',
  },
  {
    id: 'camp_7',
    name: 'Studio Barba & Estilo Nova Campinas',
    category: 'barbearia',
    contactPerson: 'Thiago Meirelles',
    phone: '(19) 98455-1234',
    bairro: 'Nova Campinas',
    address: 'Av. Dr. Jesuíno Marcondes Machado, 910 - Nova Campinas, Campinas - SP',
    coordinates: [-47.042, -22.906],
    status: 'convertido',
    potential: 'Bairro nobre tradicional com ticket médio alto. Assinante ativo do plano Black Studio.',
    notes: 'Assinatura ativa vinculada via Pix SyncPay.',
    isSubscriber: true,
    planName: 'Plano Black Studio',
  },
  {
    id: 'camp_8',
    name: 'Elite Car Care Swift',
    category: 'estetica_automotiva',
    contactPerson: 'Bruno Henrique',
    phone: '(19) 99341-2288',
    bairro: 'Swift',
    address: 'Rua da Abolição, 2040 - Swift, Campinas - SP',
    coordinates: [-47.0435, -22.932],
    status: 'em_contato',
    potential: 'Próximo às universidades São Francisco e Unip. Deseja organizar funil de reservas e histórico.',
    notes: 'Respondeu bem à mensagem institucional inicial.',
    isSubscriber: false,
  },
  {
    id: 'camp_9',
    name: 'Campinas Barber Lounge Centro',
    category: 'barbearia',
    contactPerson: 'Renato Silveira',
    phone: '(19) 98112-4455',
    bairro: 'Centro',
    address: 'Rua Barão de Jaguara, 1080 - Centro, Campinas - SP',
    coordinates: [-47.0605, -22.904],
    status: 'apresentacao',
    potential: 'Ponto tradicional no centro comercial com 5 cadeiras de atendimento.',
    notes: 'Interessado no CRM e no envio simplificado do link pelo WhatsApp.',
    isSubscriber: false,
  },
  {
    id: 'camp_10',
    name: 'Mansões Auto Spa & Detalhe',
    category: 'estetica_automotiva',
    contactPerson: 'Luciano Prado',
    phone: '(19) 99422-7700',
    bairro: 'Mansões Santo Antônio',
    address: 'Rua Hermantino Coelho, 520 - Mansões Santo Antônio, Campinas - SP',
    coordinates: [-47.0545, -22.868],
    status: 'convertido',
    potential: 'Região com alta densidade de condomínios. Assinante ativo com cobrança Pix recorrente.',
    notes: 'Assinante ativo da plataforma.',
    isSubscriber: true,
    planName: 'Plano Pro Studio',
  },
];

export const INITIAL_SUBSCRIBERS: ActiveSubscriber[] = [
  {
    id: 'sub_1',
    businessName: 'Vip Clean Detail Castelo',
    category: 'estetica_automotiva',
    ownerName: 'André Vasconcelos',
    phone: '(19) 99234-9001',
    bairro: 'Castelo',
    planId: 'plan_pro',
    planName: 'Plano Pro Studio',
    monthlyAmount: 149.0,
    paymentMethod: 'pix_syncpay',
    status: 'active',
    startedAt: '12/08/2026',
    nextRenewalAt: '12/11/2026',
    lastPixTransactionId: 'SYNC-PX-8829104',
    activeUpgrades: ['Carrossel de vídeos 9:16', 'Ficha veicular detalhada'],
  },
  {
    id: 'sub_2',
    businessName: 'Studio Barba & Estilo Nova Campinas',
    category: 'barbearia',
    ownerName: 'Thiago Meirelles',
    phone: '(19) 98455-1234',
    bairro: 'Nova Campinas',
    planId: 'plan_black',
    planName: 'Plano Black Studio',
    monthlyAmount: 229.0,
    paymentMethod: 'pix_syncpay',
    status: 'active',
    startedAt: '05/09/2026',
    nextRenewalAt: '05/11/2026',
    lastPixTransactionId: 'SYNC-PX-9921473',
    activeUpgrades: ['Módulo Fidelidade VIP', 'WhatsApp Bot', 'Domínio próprio'],
  },
  {
    id: 'sub_3',
    businessName: 'Mansões Auto Spa & Detalhe',
    category: 'estetica_automotiva',
    ownerName: 'Luciano Prado',
    phone: '(19) 99422-7700',
    bairro: 'Mansões Santo Antônio',
    planId: 'plan_pro',
    planName: 'Plano Pro Studio',
    monthlyAmount: 149.0,
    paymentMethod: 'pix_syncpay',
    status: 'active',
    startedAt: '18/07/2026',
    nextRenewalAt: '18/11/2026',
    lastPixTransactionId: 'SYNC-PX-7731902',
    activeUpgrades: ['Carrossel 9:16', 'Fidelidade de clientes'],
  },
  {
    id: 'sub_4',
    businessName: 'Navalha & Navalhão Barão',
    category: 'barbearia',
    ownerName: 'Ricardo Antunes',
    phone: '(19) 99778-1122',
    bairro: 'Barão Geraldo',
    planId: 'plan_basic',
    planName: 'Plano Básico Studio',
    monthlyAmount: 97.0,
    paymentMethod: 'pix_syncpay',
    status: 'pending_renewal',
    startedAt: '15/06/2026',
    nextRenewalAt: 'Hoje (15/10/2026)',
    lastPixTransactionId: 'SYNC-PX-6612048',
    activeUpgrades: ['Agenda inteligente'],
  },
];

export const INITIAL_PLANS: PlatformPlan[] = [
  {
    id: 'plan_base',
    name: 'Plano Base Ustudio',
    price: 24.9,
    period: '/mês',
    description: 'Plano essencial para barbearias e estética com site público e agendamentos via WhatsApp.',
    isPopular: true,
    features: [
      'Site público e catálogo mobile personalizado',
      'Agenda inteligente e bloqueio de horários/datas',
      'Recebimento de agendamentos no WhatsApp',
      'Chave Pix padrão para pagamentos',
      'Link público compartilhável (Instagram e WhatsApp)',
    ],
    linkedFunctions: ['fn_blocking', 'fn_whatsapp'],
  },
  {
    id: 'plan_pro',
    name: 'Plano Pro Studio',
    price: 49.9,
    period: '/mês',
    description: 'Plano base + pacote de catálogo de produtos e fidelidade.',
    features: [
      'Tudo do Plano Base (R$ 24,90/mês)',
      'Catálogo de produtos para venda & retirada',
      'Módulo Fidelidade com confetes e selos VIP',
      'Dashboard Financeiro com gráfico neon',
      'Ficha técnica de veículos para estética automotiva',
    ],
    linkedFunctions: ['fn_catalog', 'fn_whatsapp', 'fn_blocking', 'fn_loyalty', 'fn_neon_dashboard'],
  },
  {
    id: 'plan_black',
    name: 'Plano Black & Equipe',
    price: 89.9,
    period: '/mês',
    description: 'Estrutura completa com equipe multi-profissionais e todos os módulos liberados.',
    features: [
      'Tudo do Plano Pro',
      'Múltiplos profissionais e cadeiras',
      'Cobrança de sinal antecipado (Caução Pix)',
      'Carrossel de vídeos verticais 9:16',
      'Integração direta com Pix SyncPay CashIn',
      'Suporte VIP prioritário',
    ],
    linkedFunctions: [
      'fn_catalog',
      'fn_whatsapp',
      'fn_blocking',
      'fn_loyalty',
      'fn_pix_syncpay',
      'fn_multistaff',
      'fn_deposit',
      'fn_neon_dashboard',
      'fn_vip_support',
    ],
  },
];

export const INITIAL_UPGRADES: PlatformUpgrade[] = [
  {
    id: 'upg_catalog',
    name: 'Catálogo de Produtos para Venda & Reserva',
    price: 12.9,
    period: '/mês',
    description: 'Venda de pomadas, óleos e cosméticos com página de reservas exclusiva para retirada no balcão.',
    isActiveDefault: false,
  },
  {
    id: 'upg_notifications',
    name: 'Notificações & Lembretes Automáticos WhatsApp',
    price: 19.9,
    period: '/mês',
    description: 'Disparador automático de lembretes e confirmações 2 horas antes para zerar no-show.',
    isActiveDefault: false,
  },
  {
    id: 'upg_multistaff',
    name: 'Múltiplos Profissionais & Cadeiras',
    price: 29.9,
    period: '/mês',
    description: 'Controle de agendas separadas por profissional com relatórios de faturamento individuais.',
    isActiveDefault: false,
  },
  {
    id: 'upg_deposit',
    name: 'Cobrança de Sinal / Caução Antecipado via Pix',
    price: 14.9,
    period: '/mês',
    description: 'Exige pagamento de 30% a 50% via Pix SyncPay para confirmar horário e evitar no-show.',
    isActiveDefault: false,
  },
  {
    id: 'upg_video',
    name: 'Carrossel de Vídeos Verticais 9:16 (Reels/TikTok)',
    price: 19.9,
    period: '/mês',
    description: 'Até 6 vídeos verticais em autoplay suave integrados na vitrine com alta conversão.',
    isActiveDefault: false,
  },
  {
    id: 'upg_loyalty',
    name: 'Módulo Fidelidade VIP & Descontos',
    price: 14.9,
    period: '/mês',
    description: 'Contagem de agendamentos por cliente com concessão automática de selos Ouro, VIP e descontos.',
    isActiveDefault: false,
  },
  {
    id: 'upg_gallery',
    name: 'Tab de Galeria no Perfil Público (Grid 3x9)',
    price: 5.9,
    period: '/mês',
    description: 'Grade de fotos e vídeos 3x9 para postar e reordenar mídias no perfil público.',
    isActiveDefault: false,
  },
  {
    id: 'upg_reports',
    name: 'Dashboard Financeiro Neon & Relatórios',
    price: 14.9,
    period: '/mês',
    description: 'Gráfico em linhas neon sem pins, projeção de MRR e exportação completa de dados.',
    isActiveDefault: false,
  },
];

export const INITIAL_SYNCPAY_TRANSACTIONS: SyncPayTransaction[] = [
  {
    identifier: 'SYNC-PX-9821034',
    payerName: 'Barbearia Dom Cambuí',
    payerPhone: '(19) 99876-5432',
    amount: 149.0,
    status: 'PAID',
    pixKey: 'tonyfilho911@gmail.com',
    createdAt: '16/10/2026 09:32',
    planOrItem: 'Plano Pro Studio (Mensalidade)',
  },
  {
    identifier: 'SYNC-PX-8841920',
    payerName: 'Custom Detailing Campinas',
    payerPhone: '(19) 98811-2233',
    amount: 149.0,
    status: 'PAID',
    pixKey: 'tonyfilho911@gmail.com',
    createdAt: '14/10/2026 14:15',
    planOrItem: 'Plano Pro Studio (Mensalidade)',
  },
  {
    identifier: 'SYNC-PX-7731902',
    payerName: 'Studio Garage 19',
    payerPhone: '(19) 99123-4567',
    amount: 229.0,
    status: 'PAID',
    pixKey: 'tonyfilho911@gmail.com',
    createdAt: '12/10/2026 11:05',
    planOrItem: 'Plano Black Studio & Equipe',
  },
  {
    identifier: 'SYNC-PX-6612048',
    payerName: 'Navalha & Navalhão Barão',
    payerPhone: '(19) 99778-1122',
    amount: 97.0,
    status: 'PAID',
    pixKey: 'tonyfilho911@gmail.com',
    createdAt: '10/10/2026 16:40',
    planOrItem: 'Plano Básico Studio',
  },
  {
    identifier: 'SYNC-PX-5509121',
    payerName: 'Barbearia VIP Taquaral',
    payerPhone: '(19) 99345-6789',
    amount: 57.7,
    status: 'PAID',
    pixKey: 'tonyfilho911@gmail.com',
    createdAt: '08/10/2026 10:20',
    planOrItem: 'Plano Base (R$ 24,90) + Catálogo (R$ 12,90) + WhatsApp (R$ 19,90)',
  },
];
