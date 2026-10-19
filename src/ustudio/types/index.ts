export type ClientTier = 'padrao' | 'bronze' | 'ouro' | 'vip';
export type ClientCardFormat = 'barbearia' | 'automotiva' | 'completa' | 'rapida';

export interface Client {
  id: string;
  name: string;
  vip: boolean;
  tier?: ClientTier;
  appointmentsCount?: number;
  phone: string;
  dob?: string;
  since?: string;
  service: string;
  duration: string;
  price: string;
  status: 'Confirmado' | 'Pendente' | 'Concluído' | 'Cancelado' | 'Em Atendimento';
  time: string;
  notes?: string;
  date?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
}

export interface Category {
  key: string;
  label: string;
  iconName: string;
  soft: string;
  emoji?: string;
  type?: 'servico' | 'produto' | 'ambos';
}

export interface ProductReservation {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  createdAt: string;
  pickupDate?: string;
  status: 'Pendente' | 'Separado' | 'Pronto para Retirada' | 'Entregue' | 'Cancelado';
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  cents?: number;
  cat: string;
  type: 'servico' | 'produto';
  desc: string;
  badge?: string | null;
  emoji?: string;
  image?: string;
}

export interface DayScheduleSlot {
  time: string;
  type: 'client' | 'free' | 'blocked';
  id?: string;
  blockedReason?: string;
  date?: string;
  durationMinutes?: number;
}

export interface WorkingHours {
  days: string[];
  start: string;
  end: string;
  overrides?: Record<string, { start: string; end: string }>;
  blockedDates?: string[];
}

export interface PaymentConfig {
  activeMethod: 'sync' | 'infinite' | 'both' | 'none';
  syncApiKey: string;
  syncPixKey: string;
  infiniteClientId: string;
  infiniteApiKey: string;
  webhookUrl: string;
  isProduction: boolean;
}

export interface BookingSettings {
  minAdvanceHours: number;
  bufferMinutes: number;
  freeCancellationHours: number;
  requireWhatsapp: boolean;
  autoWhatsappNotification: boolean;
  firstVisitDiscount: number;
  activeCoupon: string;
  requireDeposit: boolean;
  depositPercent: number;
  allowPayOnSite: boolean;
  loyaltyDiscountEnabled?: boolean;
  loyaltyMinBookings?: number;
  loyaltyDiscountPercent?: number;
  loyaltyMatchMode?: 'both' | 'phone' | 'name';
  clientCardFormat?: ClientCardFormat;
}

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  about: string;
  coverIndex: number;
  customCoverUrl?: string;
  avatarEmoji: string;
  avatarUrl?: string;
  layout: 'classic' | 'hero' | 'cinema';
  serviceDisplay?: 'cards' | 'list';
  coverOverlayHeight?: number;
  coverOverlayIntensity?: number;
  layoutOverlays?: {
    classic?: { height: number; intensity: number; offsetDown?: number };
    hero?: { height: number; intensity: number; offsetDown?: number };
    cinema?: { height: number; intensity: number; offsetDown?: number };
  };
  bannerPosition?: 'above-tabs' | 'below-categories';
  videoCarouselPosition?: 'above-tabs' | 'below-categories' | 'between-categories' | string;
  catalogDemo?: boolean;
  promoVideos?: Array<{ id: string; url: string; name: string }>;
  galleryEnabled?: boolean;
  galleryItems?: Array<{ id: string; url: string; type: 'image' | 'video'; title?: string }>;
  floatingContactBar?: boolean;
  phoneCallNumber?: string;
  businessNiche?: 'lashdesigner' | 'barbearia' | 'estetica_automotiva' | 'construcao_civil' | 'corretor' | 'lanchonete';
  hasFixedAddress?: boolean;

  // Storefront specific config
  title: string;
  sub: string;
  place: string;
  google: string;
  googleOn: boolean;
  whats: string;
  insta: string;
  email: string;
  address: string;
  pixKey: string;
  pixName: string;
  pixCity: string;
  apiUrl: string;
  cover: string;
  coverType: 'image' | 'video';
  avatar: string;
}

export interface Banner {
  id: string;
  kicker: string;
  title: string;
  sub: string;
  emoji?: string;
  image?: string;
  position?: string;
}
