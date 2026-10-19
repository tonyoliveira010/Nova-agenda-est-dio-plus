import React, { createContext, useContext, useState, useEffect } from 'react';
import { availableSlots, localDate, durationMinutes } from '../utils/availability';
import {
  Client,
  ClientTier,
  Category,
  ServiceItem,
  DayScheduleSlot,
  WorkingHours,
  PaymentConfig,
  BookingSettings,
  Profile,
  Banner,
  ProductReservation,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_DAY_SCHEDULE,
  INITIAL_PROFILE,
  INITIAL_BANNERS,
  INITIAL_WORKING_HOURS,
  INITIAL_PAYMENT_CONFIG,
  INITIAL_BOOKING_SETTINGS,
  INITIAL_PRODUCT_RESERVATIONS,
} from '../data/initialData';

interface AppContextType {
  // Data State
  clients: Client[];
  categories: Category[];
  addCategory: (label: string, iconName?: string, emoji?: string, type?: 'servico' | 'produto' | 'ambos') => string;
  updateCategory: (key: string, data: Partial<Category>) => void;
  deleteCategory: (key: string) => void;
  services: ServiceItem[];
  daySchedule: DayScheduleSlot[];
  profile: Profile;
  banners: Banner[];
  workingHours: WorkingHours;
  paymentConfig: PaymentConfig;
  bookingSettings: BookingSettings;
  productReservations: ProductReservation[];
  addProductReservation: (res: Omit<ProductReservation, 'id' | 'createdAt'>) => void;
  updateProductReservationStatus: (id: string, status: ProductReservation['status']) => void;
  deleteProductReservation: (id: string) => void;

  // Navigation & View
  activeTab: 'home' | 'services' | 'agenda' | 'profile' | 'dashboard' | 'crm' | 'product-reservations';
  setActiveTab: (tab: 'home' | 'services' | 'agenda' | 'profile' | 'dashboard' | 'crm' | 'product-reservations') => void;
  isStorefrontOpen: boolean;
  setIsStorefrontOpen: (open: boolean) => void;

  // Congratulations Modal
  isCongratulationsOpen: boolean;
  congratulationsData: any;
  openCongratulations: (data?: any) => void;
  closeCongratulations: () => void;

  // Actions
  addClientBooking: (data: {
    name: string;
    phone: string;
    time: string;
    serviceName: string;
    date?: string;
    vip?: boolean;
    tier?: ClientTier;
    price?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    dob?: string;
    notes?: string;
  }) => boolean;
  updateClient: (updated: Client) => void;
  updateClientNotes: (clientId: string, notes: string) => void;
  cancelAppointment: (clientId: string) => void;
  rescheduleAppointment: (clientId: string, dayDisplay: string, newTime: string) => void;
  blockSlot: (time: string) => void;
  unblockSlot: (time: string) => void;
  saveService: (item: ServiceItem) => void;
  deleteService: (id: string) => void;
  saveProfile: (p: Partial<Profile>) => void;
  addBanner: (b: Omit<Banner, 'id'>) => void;
  updateBanner: (b: Banner) => void;
  removeBanner: (id: string) => void;
  saveWorkingHours: (hours: WorkingHours) => void;
  savePaymentConfig: (cfg: PaymentConfig) => void;
  saveBookingSettings: (cfg: BookingSettings) => void;
  resetAllData: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Modals state & handlers
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  editingService: { item: ServiceItem | null; isNew: boolean } | null;
  setEditingService: (val: { item: ServiceItem | null; isNew: boolean } | null) => void;

  selectedProduct: ServiceItem | null;
  setSelectedProduct: (item: ServiceItem | null) => void;

  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;

  isManualBookingOpen: boolean;
  setIsManualBookingOpen: (open: boolean) => void;

  isHoursConfigOpen: boolean;
  setIsHoursConfigOpen: (open: boolean) => void;

  isPaymentConfigOpen: boolean;
  setIsPaymentConfigOpen: (open: boolean) => void;

  isBookingRulesOpen: boolean;
  setIsBookingRulesOpen: (open: boolean) => void;

  profileEditField: 'cover' | 'avatar' | 'name' | 'about' | null;
  setProfileEditField: (field: 'cover' | 'avatar' | 'name' | 'about' | null) => void;

  isBannerModalOpen: boolean;
  setIsBannerModalOpen: (open: boolean) => void;

  reschedulingClientId: string | null;
  setReschedulingClientId: (id: string | null) => void;

  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;

  isAffiliateModalOpen: boolean;
  setIsAffiliateModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to defaults
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('studiolite_clients_v2');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try { return JSON.parse(localStorage.getItem('studiolite_categories') || 'null') || INITIAL_CATEGORIES; } catch { return INITIAL_CATEGORIES; }
  });
  useEffect(() => { localStorage.setItem('studiolite_categories', JSON.stringify(categories)); }, [categories]);

  const addCategory = (label: string, iconName = 'Scissors', emoji = '✨', type: 'servico' | 'produto' | 'ambos' = 'ambos') => {
    const existing = categories.find(c => c.label.toLowerCase() === label.trim().toLowerCase());
    if (existing) return existing.key;
    const key = 'cat_' + Date.now().toString(36);
    setCategories(prev => [...prev, { key, label: label.trim(), iconName, emoji, type, soft: 'var(--studio-surface)' }]);
    return key;
  };

  const updateCategory = (key: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.key === key ? { ...c, ...data } : c));
  };

  const deleteCategory = (key: string) => {
    setCategories(prev => prev.filter(c => c.key !== key));
  };

  // Product Reservations (Substitui CRM no lojista para controle de reservas de produtos)
  const [productReservations, setProductReservations] = useState<ProductReservation[]>(() => {
    try {
      const saved = localStorage.getItem('studiolite_product_reservations');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCT_RESERVATIONS;
    } catch {
      return INITIAL_PRODUCT_RESERVATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('studiolite_product_reservations', JSON.stringify(productReservations));
  }, [productReservations]);

  const addProductReservation = (res: Omit<ProductReservation, 'id' | 'createdAt'>) => {
    const newReservation: ProductReservation = {
      ...res,
      id: 'res-' + Date.now().toString(36),
      createdAt: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setProductReservations(prev => [newReservation, ...prev]);
    showToast(`Reserva de "${res.productName}" confirmada!`);
  };

  const updateProductReservationStatus = (id: string, status: ProductReservation['status']) => {
    setProductReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showToast(`Status atualizado para: ${status}`);
  };

  const deleteProductReservation = (id: string) => {
    setProductReservations(prev => prev.filter(r => r.id !== id));
    showToast('Reserva excluída');
  };

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('studiolite_services');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [daySchedule, setDaySchedule] = useState<DayScheduleSlot[]>(() => {
    try {
      const saved = localStorage.getItem('studiolite_schedule');
      return saved ? JSON.parse(saved) : INITIAL_DAY_SCHEDULE;
    } catch {
      return INITIAL_DAY_SCHEDULE;
    }
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('studiolite_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('studiolite_banners');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours>(() => {
    try {
      const saved = localStorage.getItem('studiolite_hours');
      return saved ? JSON.parse(saved) : INITIAL_WORKING_HOURS;
    } catch {
      return INITIAL_WORKING_HOURS;
    }
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('studiolite_payment');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_CONFIG;
    } catch {
      return INITIAL_PAYMENT_CONFIG;
    }
  });

  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(() => {
    try {
      const saved = localStorage.getItem('studiolite_booking_settings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKING_SETTINGS;
    } catch {
      return INITIAL_BOOKING_SETTINGS;
    }
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('studiolite_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('studiolite_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('studiolite_schedule', JSON.stringify(daySchedule));
  }, [daySchedule]);

  useEffect(() => {
    try { localStorage.setItem('studiolite_profile', JSON.stringify(profile)); } catch { showToast('Não há espaço neste aparelho para esta capa. Use um vídeo menor.'); }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studiolite_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('studiolite_hours', JSON.stringify(workingHours));
  }, [workingHours]);

  useEffect(() => {
    localStorage.setItem('studiolite_payment', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('studiolite_booking_settings', JSON.stringify(bookingSettings));
  }, [bookingSettings]);

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'agenda' | 'profile' | 'dashboard' | 'crm' | 'product-reservations'>('home');
  const [isStorefrontOpen, setIsStorefrontOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);

  // Congratulations Modal
  const [isCongratulationsOpen, setIsCongratulationsOpen] = useState(false);
  const [congratulationsData, setCongratulationsData] = useState<any>(null);
  const openCongratulations = (data?: any) => {
    setCongratulationsData(data || null);
    setIsCongratulationsOpen(true);
  };
  const closeCongratulations = () => {
    setIsCongratulationsOpen(false);
    setCongratulationsData(null);
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  // Modals state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<{ item: ServiceItem | null; isNew: boolean } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ServiceItem | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [isHoursConfigOpen, setIsHoursConfigOpen] = useState(false);
  const [isPaymentConfigOpen, setIsPaymentConfigOpen] = useState(false);
  const [isBookingRulesOpen, setIsBookingRulesOpen] = useState(false);
  const [profileEditField, setProfileEditField] = useState<'cover' | 'avatar' | 'name' | 'about' | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [reschedulingClientId, setReschedulingClientId] = useState<string | null>(null);

  // Actions
  const addClientBooking = (data: {
    name: string;
    phone: string;
    time: string;
    serviceName: string;
    date?: string;
    vip?: boolean;
    tier?: ClientTier;
    price?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    dob?: string;
    notes?: string;
  }) => {
    const newId = 'c_' + Date.now().toString(36);
    const targetService = services.find((s) => s.name === data.serviceName);

    const date = data.date || localDate();
    if (data.date && !availableSlots(date, durationMinutes(targetService?.duration), workingHours, bookingSettings, daySchedule).includes(data.time)) {
      showToast('Este horário não está mais disponível. Escolha outro.');
      return false;
    }
    const newClient: Client = {
      id: newId,
      name: data.name,
      phone: data.phone,
      vip: !!data.vip || data.tier === 'vip',
      tier: data.tier || (data.vip ? 'vip' : 'padrao'),
      vehicleModel: data.vehicleModel,
      vehiclePlate: data.vehiclePlate,
      dob: data.dob || '—',
      since: 'Hoje',
      service: data.serviceName,
      duration: targetService?.duration || '45 min',
      price: data.price || targetService?.price || 'R$ 120',
      status: 'Confirmado',
      date,
      time: `${date === localDate() ? "Hoje" : date}, ${data.time}`,
      notes: data.notes || '',
    };

    setClients((prev) => [newClient, ...prev]);

    // Update schedule
    setDaySchedule((prev) => {
      const existing = prev.find((s) => s.time === data.time && (s.date || localDate()) === date);
      if (existing) {
        return prev.map((s) => (s.time === data.time && (s.date || localDate()) === date ? { ...s, date, durationMinutes: durationMinutes(targetService?.duration), type: 'client' as const, id: newId } : s));
      }
      return [...prev, { time: data.time, date, durationMinutes: durationMinutes(targetService?.duration), type: 'client' as const, id: newId }].sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    });

    showToast(`Agendamento de ${data.name} confirmado às ${data.time}`);
    return true;
  };

  const updateClient = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Dados do agendamento atualizados');
  };

  const updateClientNotes = (clientId: string, notes: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, notes } : c))
    );
    showToast('Observações salvas');
  };

  const cancelAppointment = (clientId: string) => {
    setDaySchedule((prev) =>
      prev.map((s) => (s.id === clientId ? { time: s.time, type: 'free' } : s))
    );
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setSelectedClientId(null);
    showToast('Agendamento cancelado com sucesso');
  };

  const rescheduleAppointment = (clientId: string, dayDisplay: string, newTime: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const date = /^\d{4}-\d{2}-\d{2}$/.test(dayDisplay) ? dayDisplay : localDate();
    const cleared = daySchedule.filter(s => s.id !== clientId);
    if (!availableSlots(date, durationMinutes(client.duration), workingHours, bookingSettings, cleared).includes(newTime)) return showToast('Horário indisponível. Escolha outro.');
    setDaySchedule([...cleared, {date, time:newTime, durationMinutes:durationMinutes(client.duration), type:'client', id:clientId}]);
    setClients(prev => prev.map(c => c.id === clientId ? {...c, date, time:`${date}, ${newTime}`} : c));

    setReschedulingClientId(null);
    showToast(`Reagendado para ${dayDisplay} às ${newTime}`);
  };

  const blockSlot = (time: string, date = localDate()) => {
    setDaySchedule(prev => [...prev.filter(s => !(s.time === time && (s.date || localDate()) === date)), {time, date, type:'blocked', blockedReason:'Indisponível'}]);
    showToast(`Horário ${time} bloqueado`);
  };

  const unblockSlot = (time: string, date = localDate()) => {
    setDaySchedule((prev) =>
      prev.map((s) => (s.time === time && (s.date || localDate()) === date ? { time: s.time, date, type: 'free' } : s))
    );
    showToast(`Horário ${time} liberado para agendamento`);
  };

  const saveService = (item: ServiceItem) => {
    if (item.type === 'produto' && !profile.catalogDemo) { showToast('Abra Catálogo e ative a demonstração do upgrade de R$ 12,90/mês.'); return; }
    if (item.type === 'produto' && services.filter(s => s.type === 'produto' && s.id !== item.id).length >= 10) { showToast('O catálogo permite até 10 produtos.'); return; }
    setServices((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        return prev.map((s) => (s.id === item.id ? item : s));
      }
      return [item, ...prev];
    });
    setEditingService(null);
    showToast(
      item.type === 'produto'
        ? 'Produto salvo no catálogo'
        : 'Serviço salvo e vinculado à agenda'
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setEditingService(null);
    setSelectedProduct(null);
    showToast('Item removido do catálogo');
  };

  const saveProfile = (p: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...p }));
    setProfileEditField(null);
    showToast('Formato e perfil salvos');
  };

  const addBanner = (b: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...b,
      id: 'b_' + Date.now().toString(36),
    };
    setBanners((prev) => [newBanner, ...prev]);
    setIsBannerModalOpen(false);
    showToast('Banner promocional adicionado');
  };

  const removeBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('Banner removido');
  };

  const updateBanner = (banner: Banner) => {
    setBanners((prev) => prev.map((item) => item.id === banner.id ? banner : item));
    showToast('Posição do banner atualizada');
  };

  const saveWorkingHours = (hours: WorkingHours) => {
    setWorkingHours(hours);
    setIsHoursConfigOpen(false);
    showToast('Horário de funcionamento salvo');
  };

  const savePaymentConfig = (cfg: PaymentConfig) => {
    setPaymentConfig(cfg);
    setIsPaymentConfigOpen(false);
    showToast('Configuração de pagamentos atualizada');
  };

  const saveBookingSettings = (cfg: BookingSettings) => {
    setBookingSettings(cfg);
    setIsBookingRulesOpen(false);
    showToast('Regras de agendamento salvas');
  };

  const resetAllData = () => {
    setClients(INITIAL_CLIENTS);
    setServices(INITIAL_SERVICES);
    setDaySchedule(INITIAL_DAY_SCHEDULE);
    setProfile(INITIAL_PROFILE);
    setBanners(INITIAL_BANNERS);
    setWorkingHours(INITIAL_WORKING_HOURS);
    setPaymentConfig(INITIAL_PAYMENT_CONFIG);
    setBookingSettings(INITIAL_BOOKING_SETTINGS);
    showToast('Dados restaurados para o padrão de demonstração');
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        services,
        daySchedule,
        profile,
        banners,
        workingHours,
        paymentConfig,
        bookingSettings,
        productReservations,
        addProductReservation,
        updateProductReservationStatus,
        deleteProductReservation,
        activeTab,
        setActiveTab,
        isStorefrontOpen,
        setIsStorefrontOpen,
        addClientBooking,
        updateClient,
        updateClientNotes,
        cancelAppointment,
        rescheduleAppointment,
        blockSlot,
        unblockSlot,
        saveService,
        deleteService,
        saveProfile,
        addBanner,
        updateBanner,
        removeBanner,
        saveWorkingHours,
        savePaymentConfig,
        saveBookingSettings,
        resetAllData,
        toastMessage,
        showToast,
        selectedClientId,
        setSelectedClientId,
        editingService,
        setEditingService,
        selectedProduct,
        setSelectedProduct,
        isQuickActionOpen,
        setIsQuickActionOpen,
        isManualBookingOpen,
        setIsManualBookingOpen,
        isHoursConfigOpen,
        setIsHoursConfigOpen,
        isPaymentConfigOpen,
        setIsPaymentConfigOpen,
        isBookingRulesOpen,
        setIsBookingRulesOpen,
        profileEditField,
        setProfileEditField,
        isBannerModalOpen,
        setIsBannerModalOpen,
        reschedulingClientId,
        setReschedulingClientId,
        isCongratulationsOpen,
        congratulationsData,
        openCongratulations,
        closeCongratulations,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isAffiliateModalOpen,
        setIsAffiliateModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
