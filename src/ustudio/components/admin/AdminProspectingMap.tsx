// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Search,
  Plus,
  Phone,
  MessageCircle,
  ExternalLink,
  Car,
  Scissors,
  Check,
  Clock,
  X,
  Compass,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Users,
  CreditCard,
  Settings,
  Target,
  QrCode,
  Copy,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Zap,
  Lock,
  Layers,
  Award,
  ArrowLeft,
  Home,
  Filter,
  ShoppingBag,
  DollarSign,
  Moon,
  Sun,
  Palette,
  LogOut,
  Key,
  Mail,
  CheckCircle,
} from 'lucide-react';

import {
  ProspectLead,
  ActiveSubscriber,
  PlatformPlan,
  PlatformUpgrade,
  SyncPayConfig,
  SyncPayTransaction,
  AVAILABLE_PLAN_FUNCTIONS,
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  CAMPINAS_CENTER,
  INITIAL_PROSPECTS,
  INITIAL_SUBSCRIBERS,
  INITIAL_PLANS,
  INITIAL_UPGRADES,
  INITIAL_SYNCPAY_TRANSACTIONS,
} from './adminTypes';

import { LeadDetailModal } from './modals/LeadDetailModal';
import { PlanEditModal } from './modals/PlanEditModal';
import { SyncPayWebhookModal } from './modals/SyncPayWebhookModal';
import { SubscriberDetailModal } from './modals/SubscriberDetailModal';

export const COLOR_CONFIG = {
  rosa: {
    key: 'rosa',
    name: 'Rosa Feminino (Estética & Salão)',
    badge: 'Público Feminino',
    hex: '#ec4899',
    activeBg: 'bg-[#ec4899]',
    activeText: 'text-[#ec4899]',
    border: 'border-[#ec4899]',
    ring: 'ring-[#ec4899]',
    glow: 'rgba(236, 72, 153, 0.35)',
  },
  azul: {
    key: 'azul',
    name: 'Azul Masculino (Barbearias)',
    badge: 'Público Masculino',
    hex: '#0066ff',
    activeBg: 'bg-[#0066ff]',
    activeText: 'text-[#0066ff]',
    border: 'border-[#0066ff]',
    ring: 'ring-[#0066ff]',
    glow: 'rgba(0, 102, 255, 0.35)',
  },
  verde: {
    key: 'verde',
    name: 'Verde Neo (Auto & Detailing)',
    badge: 'Verde Neo',
    hex: '#00e676',
    activeBg: 'bg-[#00e676]',
    activeText: 'text-[#00e676]',
    border: 'border-[#00e676]',
    ring: 'ring-[#00e676]',
    glow: 'rgba(0, 230, 118, 0.35)',
  },
  roxo: {
    key: 'roxo',
    name: 'Roxo Lilás (Spa & Harmonização)',
    badge: 'Roxo Lilás',
    hex: '#a855f7',
    activeBg: 'bg-[#a855f7]',
    activeText: 'text-[#a855f7]',
    border: 'border-[#a855f7]',
    ring: 'ring-[#a855f7]',
    glow: 'rgba(168, 85, 247, 0.35)',
  },
};

export const AdminProspectingMap: React.FC = () => {
  // Navigation: inicio, mapa, clientes, ajustes, planos, financeiro
  const [activePage, setActivePage] = useState<'inicio' | 'mapa' | 'clientes' | 'ajustes' | 'planos' | 'financeiro'>('inicio');

  // Theme: light | dark
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_theme_v5');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  });

  // Accent Color Theme: azul | rosa | verde | roxo
  const [accentColor, setAccentColor] = useState<'azul' | 'rosa' | 'verde' | 'roxo'>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_color_v5');
      if (stored && COLOR_CONFIG[stored]) return stored as any;
    } catch {}
    return 'azul';
  });

  // Admin Credentials
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('ustudio_adm_email_v5') || 'tonyfilho911@gmail.com';
    } catch {}
    return 'tonyfilho911@gmail.com';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('ustudio_adm_password_v5') || '••••••••';
    } catch {}
    return '••••••••';
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [credSuccessMsg, setCredSuccessMsg] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Map view mode: mapa (fullscreen mapbox) or lista (leads list)
  const [mapViewMode, setMapViewMode] = useState<'mapa' | 'lista'>('mapa');

  // Leads & Subscribers state
  const [prospects, setProspects] = useState<ProspectLead[]>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_prospects_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_PROSPECTS;
  });

  const [subscribers, setSubscribers] = useState<ActiveSubscriber[]>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_subscribers_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SUBSCRIBERS;
  });

  // Plans & Upgrades state
  const [plans, setPlans] = useState<PlatformPlan[]>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_plans_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_PLANS;
  });

  const [upgrades, setUpgrades] = useState<PlatformUpgrade[]>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_upgrades_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_UPGRADES;
  });

  // SyncPay Transactions Extrato
  const [transactions, setTransactions] = useState<SyncPayTransaction[]>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_transactions_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SYNCPAY_TRANSACTIONS;
  });

  // Selected Upgrades for Modular Next Billing Simulator
  const [selectedUpgradesForBilling, setSelectedUpgradesForBilling] = useState<string[]>([
    'upg_catalog',
    'upg_notifications',
  ]);

  // SyncPay API Configuration
  const [syncPayConfig, setSyncPayConfig] = useState<SyncPayConfig>(() => {
    try {
      const stored = localStorage.getItem('ustudio_adm_syncpay_config_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      baseUrl: 'https://api.syncpayments.com.br/',
      apiKey: 'sync_live_pk_88921094821',
      clientSecret: 'sync_sec_99182377481',
      pixKey: 'tonyfilho911@gmail.com',
      webhookUrl: 'https://ais-dev-jqs66yp5rfmbazsdknioij-90313742699.us-east1.run.app/api/webhooks/syncpay',
      autoActivateOnWebhook: true,
      isSandbox: false,
    };
  });

  // Filters & selection
  const [selectedProspect, setSelectedProspect] = useState<ProspectLead | null>(null);
  const [filterCategory, setFilterCategory] = useState<'todos' | 'barbearia' | 'estetica_automotiva'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modals state
  const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<ProspectLead | null>(null);
  const [selectedSubscriberForDetail, setSelectedSubscriberForDetail] = useState<ActiveSubscriber | null>(null);
  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);
  const [isPlanEditModalOpen, setIsPlanEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState<PlatformPlan | null>(null);
  const [pixGeneratedCode, setPixGeneratedCode] = useState<string>('');
  const [pixCopied, setPixCopied] = useState(false);
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [cashoutSuccessMsg, setCashoutSuccessMsg] = useState<string | null>(null);

  // New lead form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'barbearia' | 'estetica_automotiva'>('barbearia');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBairro, setNewBairro] = useState('Cambuí');
  const [newAddress, setNewAddress] = useState('');
  const [newPotential, setNewPotential] = useState('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('ustudio_adm_prospects_v4', JSON.stringify(prospects));
      localStorage.setItem('ustudio_adm_subscribers_v4', JSON.stringify(subscribers));
      localStorage.setItem('ustudio_adm_plans_v4', JSON.stringify(plans));
      localStorage.setItem('ustudio_adm_upgrades_v4', JSON.stringify(upgrades));
      localStorage.setItem('ustudio_adm_syncpay_config_v4', JSON.stringify(syncPayConfig));
    } catch {}
  }, [prospects, subscribers, plans, upgrades, syncPayConfig]);

  // Filtered prospects
  const filteredProspects = prospects.filter((p) => {
    const matchCat = filterCategory === 'todos' || p.category === filterCategory;
    const matchStatus = filterStatus === 'todos' || p.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.bairro.toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  });

  // Mapbox initialization
  useEffect(() => {
    if (activePage !== 'mapa' || mapViewMode !== 'mapa') return;
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAPBOX_STYLE,
        center: CAMPINAS_CENTER,
        zoom: 12.8,
        pitch: 0,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current = map;
    } else {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 80);
    }
  }, [activePage, mapViewMode]);

  // Update Mapbox Markers
  useEffect(() => {
    if (activePage !== 'mapa' || mapViewMode !== 'mapa' || !mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapRef.current;

    filteredProspects.forEach((prospect) => {
      const isSelected = selectedProspect?.id === prospect.id;
      const isAuto = prospect.category === 'estetica_automotiva';
      const isSub = prospect.isSubscriber || prospect.status === 'convertido';

      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform duration-150';
      el.style.width = isSelected ? '46px' : '38px';
      el.style.height = isSelected ? '46px' : '38px';
      el.style.position = 'relative';

      const inner = document.createElement('div');
      inner.className = `w-full h-full rounded-[14px] flex items-center justify-center transition-all ${
        isSelected
          ? 'bg-[#141414] text-[#ffffff] ring-2 ring-[#141414] ring-offset-2 scale-110 shadow-lg'
          : isSub
          ? 'bg-[#141414] text-[#ffffff] border-2 border-[#141414]'
          : 'bg-[#ffffff] text-[#141414] border border-[#d0d0d0] shadow-sm'
      }`;

      inner.innerHTML = isAuto
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.2V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`;

      if (isSub) {
        const badge = document.createElement('span');
        badge.className = 'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-[9px] font-bold shadow';
        badge.innerText = '★';
        badge.title = 'Assinante Ativo da Plataforma';
        el.appendChild(badge);
      }

      el.appendChild(inner);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedProspect(prospect);
        map.flyTo({
          center: prospect.coordinates,
          zoom: 14.5,
          speed: 1.2,
          essential: true,
        });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(prospect.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredProspects, selectedProspect, activePage, mapViewMode]);

  // Lead Actions
  const handleUpdateLeadStatus = (leadId: string, status: ProspectLead['status']) => {
    setProspects((prev) =>
      prev.map((p) => {
        if (p.id === leadId) {
          const isSubscriber = status === 'convertido';
          return { ...p, status, isSubscriber };
        }
        return p;
      })
    );

    if (selectedProspect?.id === leadId) {
      setSelectedProspect((prev) => (prev ? { ...prev, status, isSubscriber: status === 'convertido' } : null));
    }
  };

  const handleOpenLeadDetails = (lead: ProspectLead) => {
    setSelectedLeadForDetail(lead);
    setIsLeadDetailModalOpen(true);
  };

  const handleConvertToSubscriber = (lead: ProspectLead) => {
    setSelectedPlanForPix(plans[1] || plans[0]);
    setPixGeneratedCode(
      `00020126580014br.gov.bcb.pix0136tonyfilho911@gmail.com520400005303986540${plans[1]?.price || 149}5802BR5924Tony Oliveira Ustudio6008Campinas62070503***6304E8A2`
    );
    setIsPixModalOpen(true);
  };

  const handleSavePlan = (savedPlan: PlatformPlan) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPlan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedPlan;
        return next;
      }
      return [...prev, savedPlan];
    });
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Tem certeza que deseja remover este plano?')) {
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    }
  };

  const handleWebhookSuccess = (leadId: string, amount: number) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === leadId ? { ...p, status: 'convertido', isSubscriber: true, planName: 'Plano Pro Studio' } : p))
    );

    const target = prospects.find((p) => p.id === leadId);
    if (target) {
      const exists = subscribers.some((s) => s.id === `sub_${target.id}`);
      if (!exists) {
        const newSub: ActiveSubscriber = {
          id: `sub_${target.id}`,
          businessName: target.name,
          category: target.category,
          ownerName: target.contactPerson,
          phone: target.phone,
          bairro: target.bairro,
          planId: 'plan_pro',
          planName: 'Plano Pro Studio',
          monthlyAmount: amount || 149,
          paymentMethod: 'pix_syncpay',
          status: 'active',
          startedAt: new Date().toLocaleDateString('pt-BR'),
          nextRenewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          lastPixTransactionId: `SYNC-PX-${Date.now().toString().slice(-6)}`,
          activeUpgrades: ['Catálogo de Produtos', 'Fidelidade VIP'],
        };
        setSubscribers((prev) => [newSub, ...prev]);
      }
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const offsetLng = (Math.random() - 0.5) * 0.04;
    const offsetLat = (Math.random() - 0.5) * 0.04;

    const newLead: ProspectLead = {
      id: `lead_${Date.now().toString(36)}`,
      name: newName.trim(),
      category: newCategory,
      contactPerson: newContact.trim() || 'Responsável',
      phone: newPhone.trim() || '(19) 99000-0000',
      bairro: newBairro.trim() || 'Cambuí',
      address: newAddress.trim() || `${newBairro}, Campinas - SP`,
      coordinates: [CAMPINAS_CENTER[0] + offsetLng, CAMPINAS_CENTER[1] + offsetLat],
      status: 'novo',
      potential: newPotential.trim() || 'Novo prospect cadastrado no painel administrativo.',
      isSubscriber: false,
    };

    setProspects([newLead, ...prospects]);
    setSelectedProspect(newLead);
    setIsNewLeadModalOpen(false);

    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewAddress('');
    setNewPotential('');

    setActivePage('mapa');
    setMapViewMode('mapa');
  };

  // KPIs
  const activeSubscribersCount = subscribers.filter((s) => s.status === 'active').length;
  const mrrTotal = subscribers
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyAmount, 0);
  const conversionRate = (
    (prospects.filter((p) => p.isSubscriber).length / Math.max(1, prospects.length)) *
    100
  ).toFixed(1);

  const currentAccent = COLOR_CONFIG[accentColor] || COLOR_CONFIG.azul;

  return (
    <div
      className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-200 ${
        themeMode === 'dark'
          ? 'bg-[#0c0c0c] text-[#ffffff] selection:bg-white selection:text-black dark'
          : 'bg-[#ffffff] text-[#141414] selection:bg-[#141414] selection:text-[#ffffff]'
      } ${activePage === 'mapa' && mapViewMode === 'mapa' ? 'pb-16' : 'pb-24 sm:pb-28'}`}
    >
      {/* Top Bar Minimalist Mobile Header - SOMENTE NA TELA DE INÍCIO CONFORME SOLICITADO */}
      {activePage === 'inicio' && (
        <header
          className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 transition-colors ${
            themeMode === 'dark'
              ? 'bg-[#0c0c0c]/90 border-white/10 text-white'
              : 'bg-[#ffffff]/95 border-[#f0f0f0] text-[#141414]'
          }`}
        >
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-[9px] flex items-center justify-center text-white font-bold text-xs shadow-sm"
                style={{ backgroundColor: currentAccent.hex }}
              >
                U
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight block leading-tight">
                  Ustudio Adm
                </span>
                <span
                  className={`text-[10px] block ${
                    themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'
                  }`}
                >
                  {activeSubscribersCount} assinantes ativos · Campinas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  themeMode === 'dark' ? 'bg-white/10 text-white' : 'bg-[#f3f3f3] text-[#141414]'
                }`}
              >
                R$ {mrrTotal.toFixed(0)} MRR
              </span>
              <a
                href="/"
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  themeMode === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#707070] hover:text-[#141414]'
                }`}
                title="Voltar ao estúdio principal"
              >
                <span>App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main
        className={
          activePage === 'mapa' && mapViewMode === 'mapa'
            ? 'flex-1 w-full relative p-0 overflow-hidden'
            : 'flex-1 max-w-md w-full mx-auto px-4 pt-3.5'
        }
      >
        {/* ========================================================================= */}
        {/* 1. PÁGINA DE INÍCIO (Home do ADM) */}
        {/* ========================================================================= */}
        {activePage === 'inicio' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header Greeting */}
            <div>
              <h1 className="text-2xl font-bold text-[#141414] tracking-tight leading-tight">
                Painel Geral.
              </h1>
              <p className="text-xs text-[#707070]">
                Prospecção e assinaturas de barbearias e estética em Campinas
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                  Leads Mapeados
                </span>
                <span className="text-xl font-extrabold text-[#141414] mt-1">
                  {prospects.length}
                </span>
                <span className="text-[10px] text-[#707070]">Campinas & região</span>
              </div>

              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                  Assinantes Ativos
                </span>
                <span className="text-xl font-extrabold text-[#0066ff] mt-1">
                  {activeSubscribersCount}
                </span>
                <span className="text-[10px] text-[#0066ff]">com selo ativo no mapa</span>
              </div>

              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                  MRR SyncPay Pix
                </span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1">
                  R$ {mrrTotal.toFixed(0)}
                </span>
                <span className="text-[10px] text-emerald-700">receita recorrente</span>
              </div>

              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                  Conversão
                </span>
                <span className="text-xl font-extrabold text-[#141414] mt-1">
                  {conversionRate}%
                </span>
                <span className="text-[10px] text-[#707070]">do funil de prospecção</span>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#141414] block">
                Atalhos Rápidos
              </span>

              {/* Mapa Shortcut */}
              <button
                type="button"
                onClick={() => {
                  setActivePage('mapa');
                  setMapViewMode('mapa');
                }}
                className="w-full p-4 rounded-[20px] bg-[#141414] text-white flex items-center justify-between text-left hover:bg-[#262626] transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <b className="text-sm font-bold block">Abrir Mapa de Campinas</b>
                    <span className="text-xs text-white/60">
                      Visualização imersiva ou lista de leads por bairro
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white" />
              </button>

              {/* Clientes Shortcut */}
              <button
                type="button"
                onClick={() => setActivePage('clientes')}
                className={`w-full p-3.5 rounded-[20px] border flex items-center justify-between text-left transition-colors group ${
                  themeMode === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-[#f7f7f7] border-[#ebebeb] hover:bg-[#f0f0f0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                    themeMode === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-[#e5e5e5] text-[#141414]'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <b className={`text-xs font-bold block ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                      CRM de Clientes Assinantes ({activeSubscribersCount})
                    </b>
                    <span className={`text-[11px] ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                      Gestão de mensalidades, vencimentos e upgrades
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeMode === 'dark' ? 'text-white/40 group-hover:text-white' : 'text-[#adadad] group-hover:text-[#141414]'}`} />
              </button>

              {/* Gestão Financeira Shortcut (Conforme solicitado) */}
              <button
                type="button"
                onClick={() => setActivePage('financeiro')}
                className={`w-full p-3.5 rounded-[20px] border flex items-center justify-between text-left transition-all group ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-r from-emerald-950/40 via-white/5 to-white/5 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-gradient-to-r from-emerald-50/80 via-[#f9f9f9] to-[#ffffff] border-emerald-500/30 hover:border-emerald-500/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <b className={`text-xs font-bold block ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                        Gestão Financeira & Caixa SyncPay
                      </b>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold uppercase">
                        R$ 1.840
                      </span>
                    </div>
                    <span className={`text-[11px] ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                      Saldo em conta, extrato Pix e previsão de receita
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#adadad] group-hover:text-emerald-500" />
              </button>

              {/* Planos Shortcut */}
              <button
                type="button"
                onClick={() => setActivePage('planos')}
                className={`w-full p-3.5 rounded-[20px] border flex items-center justify-between text-left transition-colors group ${
                  themeMode === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-[#f7f7f7] border-[#ebebeb] hover:bg-[#f0f0f0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                    themeMode === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-[#e5e5e5] text-[#141414]'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <b className={`text-xs font-bold block ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                      Planos & Funções da Plataforma
                    </b>
                    <span className={`text-[11px] ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                      Plano base R$ 24,90 + funções cobradas juntas
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${themeMode === 'dark' ? 'text-white/40 group-hover:text-white' : 'text-[#adadad] group-hover:text-[#141414]'}`} />
              </button>

              {/* Ajustes SyncPay Shortcut */}
              <button
                type="button"
                onClick={() => setActivePage('ajustes')}
                className="w-full p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb] flex items-center justify-between text-left hover:bg-[#f0f0f0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center text-[#141414]">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-[#141414] block">
                      Ajustes & API SyncPay Pix
                    </b>
                    <span className="text-[11px] text-[#707070]">
                      Webhook de retorno, chave Pix e simulação
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#adadad] group-hover:text-[#141414]" />
              </button>
            </div>

            {/* Recent Leads Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#141414]">
                  Leads Recentes em Campinas
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('mapa');
                    setMapViewMode('lista');
                  }}
                  className="text-[11px] font-semibold text-[#0066ff] hover:underline"
                >
                  Ver todos ({prospects.length})
                </button>
              </div>

              <div className="space-y-2">
                {prospects.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleOpenLeadDetails(lead)}
                    className="p-3 rounded-[16px] bg-[#ffffff] border border-[#ebebeb] hover:border-[#141414] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-[#707070]">
                          {lead.category === 'estetica_automotiva' ? 'Estética Auto' : 'Barbearia'} · {lead.bairro}
                        </span>
                        {lead.isSubscriber && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0066ff] text-white text-[8px] font-extrabold uppercase">
                            Assinante
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#141414] truncate">
                        {lead.name}
                      </h4>
                      <p className="text-[11px] text-[#707070] truncate">
                        {lead.contactPerson} · {lead.phone}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#adadad] group-hover:text-[#141414] flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PÁGINA DE MAPA (Tela inteira com auto layout para todos os dispositivos) */}
        {/* ========================================================================= */}
        {activePage === 'mapa' && mapViewMode === 'mapa' && (
          <div className="relative w-full h-[calc(100vh-68px)] sm:h-[calc(100vh-76px)] overflow-hidden bg-[#e5e5e5] dark:bg-[#111111]">
            {/* The Mapbox Map fills 100% of the screen */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Top Controls Overlay */}
            <div className="absolute top-3 inset-x-3 sm:inset-x-6 max-w-xl mx-auto z-20 space-y-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                {/* Segmented View Mode Toggle: [ Ver Mapa ] vs [ Lista de Leads ] */}
                <div className="flex-1 flex items-center p-1 rounded-full bg-white/90 dark:bg-black/85 backdrop-blur-md border border-black/10 dark:border-white/15 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setMapViewMode('mapa')}
                    className="flex-1 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#141414] text-white dark:bg-white dark:text-black shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Ver no Mapa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapViewMode('lista')}
                    className="flex-1 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-[#707070] dark:text-white/70 hover:text-[#141414] dark:hover:text-white"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Lista de Leads ({filteredProspects.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(true)}
                  className="h-10 px-3.5 rounded-full bg-[#141414] text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 shadow-lg"
                  title="Cadastrar novo ponto no mapa"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Add ponto</span>
                </button>
              </div>

              {/* Floating Search Bar */}
              <div className="relative shadow-lg">
                <Search className="w-4 h-4 text-[#707070] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar barbearia, estética ou bairro (Cambuí, Taquaral...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-9 rounded-full bg-white/95 dark:bg-[#161616]/95 text-[#141414] dark:text-white backdrop-blur-md border border-black/10 dark:border-white/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#141414] dark:focus:ring-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#141414] dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { key: 'todos', label: 'Todos os nichos' },
                  { key: 'barbearia', label: 'Barbearias' },
                  { key: 'estetica_automotiva', label: 'Estética Automotiva' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setFilterCategory(s.key as any)}
                    className={`h-7 px-3 rounded-full text-[11px] font-bold whitespace-nowrap transition-all backdrop-blur-md shadow-xs ${
                      filterCategory === s.key
                        ? 'bg-[#141414] text-white dark:bg-white dark:text-black'
                        : 'bg-white/80 dark:bg-black/60 text-[#707070] dark:text-white/70 hover:text-[#141414] dark:hover:text-white border border-black/10 dark:border-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Legend Badge */}
            <div className="absolute top-36 left-3 sm:left-6 z-10 flex items-center gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-[10px] font-bold text-[#141414] dark:text-white shadow-md pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#0066ff]" />
              <span>Azul: Assinante</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span className="w-2 h-2 rounded-full bg-white border border-neutral-400" />
              <span>Branco: Lead</span>
            </div>

            {/* Selected Lead Bottom Floating Card (Clique abre ficha detalhada) */}
            {selectedProspect && (
              <div
                onClick={() => handleOpenLeadDetails(selectedProspect)}
                className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-20 p-4 rounded-[22px] bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-black/10 dark:border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 cursor-pointer group"
                title="Clique no card para abrir a ficha detalhada completa"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#141414] dark:text-white text-[10px] font-semibold">
                        {selectedProspect.category === 'estetica_automotiva' ? 'Estética automotiva' : 'Barbearia'} · {selectedProspect.bairro}
                      </span>
                      {selectedProspect.isSubscriber ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#0066ff] text-white text-[9px] font-extrabold uppercase">
                          Assinante Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 text-[9px] font-bold">
                          Prospect
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-[#141414] dark:text-white tracking-tight truncate">
                      {selectedProspect.name}
                    </h4>
                    <p className="text-xs text-[#707070] dark:text-white/60">
                      {selectedProspect.contactPerson} · {selectedProspect.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProspect(null);
                    }}
                    className="w-7 h-7 rounded-full bg-[#f3f3f3] dark:bg-white/10 text-[#707070] dark:text-white/70 hover:text-[#141414] flex items-center justify-center shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#262626] dark:text-white/80 bg-neutral-100/70 dark:bg-white/5 p-2.5 rounded-[14px] leading-relaxed mb-3 line-clamp-2">
                  {selectedProspect.potential}
                </p>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenLeadDetails(selectedProspect)}
                    className="flex-1 h-9 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-xs font-bold transition-all hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Abrir Ficha Detalhada</span>
                  </button>

                  <a
                    href={`https://wa.me/55${selectedProspect.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${selectedProspect.contactPerson}! Sou da equipe Ustudio em Campinas.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW B: LISTA DE LEADS (Alternância solicitada) */}
        {activePage === 'mapa' && mapViewMode === 'lista' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Header: Title + Add Point */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight">
                  Lista de Leads Campinas.
                </h1>
                <p className="text-[11px] text-[#707070] dark:text-white/60">
                  {filteredProspects.length} de {prospects.length} estabelecimentos cadastrados
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(true)}
                className="h-8 px-3.5 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add ponto</span>
              </button>
            </div>

            {/* Segmented View Mode Toggle: [ Ver Mapa ] vs [ Lista de Leads ] */}
            <div className="flex items-center p-1 rounded-full bg-[#f0f0f0] dark:bg-white/10 border border-[#e0e0e0] dark:border-white/10">
              <button
                type="button"
                onClick={() => setMapViewMode('mapa')}
                className="flex-1 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-[#707070] dark:text-white/70 hover:text-[#141414] dark:hover:text-white"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Visualizar no Mapa</span>
              </button>

              <button
                type="button"
                onClick={() => setMapViewMode('lista')}
                className="flex-1 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white dark:bg-white/20 text-[#141414] dark:text-white shadow-sm"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Lista de Leads ({filteredProspects.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#707070] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, bairro (Cambuí, Taquaral...), contato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-9 rounded-full bg-[#f5f5f5] dark:bg-white/5 text-[#141414] dark:text-white border border-[#e5e5e5] dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#141414] dark:focus:border-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#141414]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { key: 'todos', label: 'Todos os nichos' },
                { key: 'barbearia', label: 'Barbearias' },
                { key: 'estetica_automotiva', label: 'Estética Automotiva' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setFilterCategory(s.key as any)}
                  className={`h-7 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                    filterCategory === s.key
                      ? 'bg-[#141414] text-white dark:bg-white dark:text-black'
                      : 'bg-[#f5f5f5] dark:bg-white/5 text-[#707070] dark:text-white/70 hover:text-[#141414] border border-[#e5e5e5] dark:border-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Funnel Status Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
              {['todos', 'novo', 'em_contato', 'apresentacao', 'proposta', 'convertido'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`h-7 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                    filterStatus === st
                      ? 'bg-[#141414] text-white dark:bg-white dark:text-black'
                      : 'bg-[#f5f5f5] dark:bg-white/5 text-[#707070] dark:text-white/70 hover:text-[#141414] border border-[#e5e5e5] dark:border-white/10'
                  }`}
                >
                  {st === 'todos' ? 'Todos os status' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* List of Leads (Ao clicar no card abre a ficha detalhada) */}
            <div className="space-y-2.5">
              {filteredProspects.length === 0 ? (
                <div className="p-8 text-center rounded-[20px] bg-[#f9f9f9] dark:bg-white/5 border border-dashed border-[#e0e0e0] dark:border-white/10">
                  <p className="text-xs text-[#707070] dark:text-white/60">Nenhum lead encontrado com estes filtros.</p>
                </div>
              ) : (
                filteredProspects.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleOpenLeadDetails(lead)}
                    className="p-3.5 rounded-[20px] bg-[#ffffff] dark:bg-white/5 border border-[#e5e5e5] dark:border-white/10 hover:border-[#141414] dark:hover:border-white/30 transition-all space-y-2 shadow-xs cursor-pointer group"
                    title="Clique no card para abrir a ficha detalhada completa"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#707070] dark:text-white/60">
                            {lead.category === 'estetica_automotiva' ? 'Estética Automotiva' : 'Barbearia'} · {lead.bairro}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                              lead.isSubscriber
                                ? 'bg-[#0066ff] text-white'
                                : 'bg-[#f0f0f0] dark:bg-white/10 text-[#707070] dark:text-white/70'
                            }`}
                          >
                            {lead.isSubscriber ? 'Assinante Ativo' : lead.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#141414] dark:text-white truncate">
                          {lead.name}
                        </h4>
                        <p className="text-xs text-[#707070] dark:text-white/60">
                          {lead.contactPerson} · {lead.phone}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLeadDetails(lead);
                        }}
                        className="h-8 px-3 rounded-full bg-[#f3f3f3] dark:bg-white/10 hover:bg-[#e0e0e0] text-[#141414] dark:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Ficha</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#262626] dark:text-white/80 bg-[#f8f8f8] dark:bg-white/5 p-2 rounded-[12px] leading-relaxed line-clamp-2">
                      {lead.potential}
                    </p>

                    <div
                      className="flex items-center justify-between gap-2 pt-1 border-t border-[#f5f5f5] dark:border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-[#707070] dark:text-white/50 truncate">
                        {lead.address}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${lead.contactPerson}! Sou da equipe Ustudio em Campinas.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-3 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-[11px] font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        {!lead.isSubscriber && (
                          <button
                            type="button"
                            onClick={() => handleConvertToSubscriber(lead)}
                            className="h-7 px-2.5 rounded-full bg-[#0066ff] text-white text-[11px] font-semibold"
                          >
                            Ativar Pix
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PÁGINA DE CLIENTES (CRM de Assinantes Ativos) */}
        {/* ========================================================================= */}
        {activePage === 'clientes' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h1 className="text-xl font-bold text-[#141414] tracking-tight leading-tight">
                Clientes Assinantes.
              </h1>
              <p className="text-xs text-[#707070]">
                Estúdios ativos na plataforma com pagamentos recorrentes via Pix SyncPay
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb]">
                <span className="text-[10px] font-bold text-[#707070] uppercase">
                  Receita Mensal Recorrente
                </span>
                <span className="text-xl font-extrabold text-[#141414] block mt-1">
                  R$ {mrrTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="p-3.5 rounded-[20px] bg-[#f7f7f7] border border-[#ebebeb]">
                <span className="text-[10px] font-bold text-[#707070] uppercase">
                  Assinaturas Ativas
                </span>
                <span className="text-xl font-extrabold text-[#0066ff] block mt-1">
                  {activeSubscribersCount} estúdios
                </span>
              </div>
            </div>

            {/* Subscribers List */}
            <div className="space-y-2.5">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubscriberForDetail(sub);
                    setIsSubscriberModalOpen(true);
                  }}
                  className={`p-4 rounded-[20px] border space-y-3 shadow-xs cursor-pointer transition-all hover:scale-[1.01] ${
                    themeMode === 'dark'
                      ? 'bg-white/5 border-white/10 hover:border-white/30'
                      : 'bg-[#ffffff] border-[#e5e5e5] hover:border-[#141414]'
                  }`}
                  title="Clique para abrir a ficha completa do assinante"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="px-2 py-0.2 rounded-full text-white text-[9px] font-extrabold uppercase shadow-xs"
                          style={{ backgroundColor: currentAccent.hex }}
                        >
                          {sub.status === 'active' ? 'Ativo' : 'Renovação Pendente'}
                        </span>
                        <span className={`text-[10px] font-semibold ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                          {sub.bairro}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                        {sub.businessName}
                      </h4>
                      <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                        {sub.ownerName} · {sub.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-extrabold block ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                        R$ {sub.monthlyAmount.toFixed(2).replace('.', ',')}
                      </span>
                      <span className={`text-[10px] ${themeMode === 'dark' ? 'text-white/50' : 'text-[#707070]'}`}>por mês</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-[14px] border text-xs space-y-1 ${
                    themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#f8f8f8] border-[#f0f0f0]'
                  }`}>
                    <div className="flex justify-between text-[11px]">
                      <span className={themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}>Plano contratado:</span>
                      <b className={themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}>{sub.planName}</b>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className={themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}>Próxima renovação Pix:</span>
                      <b className="text-emerald-500">{sub.nextRenewalAt}</b>
                    </div>
                    {sub.lastPixTransactionId && (
                      <div className="flex justify-between text-[10px]">
                        <span className={themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}>ID Transação SyncPay:</span>
                        <span className="font-mono text-[#707070]">{sub.lastPixTransactionId}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-between gap-2 pt-1 border-t ${
                    themeMode === 'dark' ? 'border-white/10' : 'border-[#f5f5f5]'
                  }`}>
                    <a
                      href={`https://wa.me/55${sub.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá ${sub.ownerName}! Tudo bem? Sou do suporte Ustudio.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        themeMode === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-[#f3f3f3] hover:bg-[#e0e0e0] text-[#141414]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubscriberForDetail(sub);
                          setIsSubscriberModalOpen(true);
                        }}
                        className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                          themeMode === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#f3f3f3] text-[#141414] hover:bg-[#e0e0e0]'
                        }`}
                      >
                        Ver Ficha
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetPlan = plans.find((p) => p.name === sub.planName) || plans[0];
                          setSelectedPlanForPix({
                            ...targetPlan,
                            price: sub.monthlyAmount,
                            name: `${sub.businessName} (Mensalidade Consolidada)`,
                          });
                          setPixGeneratedCode(
                            `00020126580014br.gov.bcb.pix0136tonyfilho911@gmail.com520400005303986540${sub.monthlyAmount}5802BR5924Tony Oliveira Ustudio6008Campinas62070503***6304E8A2`
                          );
                          setIsPixModalOpen(true);
                        }}
                        className="h-8 px-3 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Cobrar Pix</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PÁGINA DE GESTÃO FINANCEIRA (Caixa & API Pix SyncPay) */}
        {/* ========================================================================= */}
        {activePage === 'financeiro' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Top Bar with Back to Início */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActivePage('inicio')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-[#f3f3f3] hover:bg-[#e0e0e0] text-[#141414]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Início</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600">SyncPay Conectada</span>
              </div>
            </div>

            <div>
              <h1 className={`text-xl font-bold tracking-tight leading-tight ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                Gestão Financeira & Caixa.
              </h1>
              <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                Controle de recebimentos Pix, saldo disponível e conciliação bancária SyncPay
              </p>
            </div>

            {/* SyncPay Balance & CashOut Card */}
            <div
              className="p-5 rounded-[24px] text-white space-y-3.5 shadow-lg relative overflow-hidden"
              style={{
                background:
                  themeMode === 'dark'
                    ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
                    : 'linear-gradient(135deg, #141414 0%, #262626 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                      Saldo Disponível SyncPay
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight block">
                      R$ 1.840,00
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Liberado p/ Saque
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                <span className="text-[11px]">Chave Pix padrão:</span>
                <span className="font-mono text-[11px] font-bold text-white">{syncPayConfig.pixKey}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCashoutModalOpen(true)}
                  className="h-10 rounded-full bg-white text-[#141414] font-bold text-xs hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Sacar via Pix (CashOut)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(true)}
                  className="h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Simular CashIn</span>
                </button>
              </div>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3.5 rounded-[20px] border flex flex-col justify-between ${
                themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#f7f7f7] border-[#ebebeb]'
              }`}>
                <span className="text-[10px] font-bold text-[#707070] uppercase">
                  Receita Mensal (MRR)
                </span>
                <span className={`text-xl font-extrabold mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                  R$ {mrrTotal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">100% via Pix SyncPay</span>
              </div>

              <div className={`p-3.5 rounded-[20px] border flex flex-col justify-between ${
                themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#f7f7f7] border-[#ebebeb]'
              }`}>
                <span className="text-[10px] font-bold text-[#707070] uppercase">
                  Próxima Cobrança
                </span>
                <span className="text-xl font-extrabold text-[#0066ff] mt-1">
                  R$ {(mrrTotal + 74.6).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-[#707070]">Base + Funções somadas</span>
              </div>
            </div>

            {/* Extrato de Transações Recentes SyncPay */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                  Extrato Pix Recente · SyncPay API
                </span>
                <span className="text-[10px] text-[#707070] font-mono">
                  api.syncpayments.com.br
                </span>
              </div>

              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.identifier}
                    className={`p-3.5 rounded-[18px] border transition-all space-y-1.5 shadow-xs ${
                      themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ffffff] border-[#e8e8e8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] text-[#707070] font-bold">
                            {tx.identifier}
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold">
                            {tx.status}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                          {tx.payerName}
                        </h4>
                        <p className="text-[10px] text-[#707070]">
                          {tx.planOrItem} · {tx.createdAt}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-extrabold text-emerald-600 block">
                          + R$ {tx.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[9px] text-[#707070]">Pix CashIn</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. PÁGINA DE AJUSTES (Dark/Light, Cores Cliente, Trocar Senha e Sair) */}
        {/* ========================================================================= */}
        {activePage === 'ajustes' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h1 className={`text-xl font-bold tracking-tight leading-tight ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                Ajustes & Configurações.
              </h1>
              <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                Personalização visual, segurança, credenciais e integrações da plataforma
              </p>
            </div>

            {/* A. MODO DARK / LIGHT (Conforme solicitado) */}
            <div className={`p-4 rounded-[22px] border space-y-2.5 ${
              themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ffffff] border-[#e8e8e8]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    themeMode === 'dark' ? 'bg-white/10 text-white' : 'bg-[#f0f0f0] text-[#141414]'
                  }`}>
                    {themeMode === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                      Modo de Exibição (Dark / Light)
                    </h3>
                    <span className="text-[10px] text-[#707070]">
                      Alterne a aparência do painel do administrador
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  themeMode === 'dark' ? 'bg-white/10 text-white' : 'bg-[#f3f3f3] text-[#141414]'
                }`}>
                  {themeMode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('light');
                    localStorage.setItem('ustudio_adm_theme_v5', 'light');
                  }}
                  className={`h-9 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    themeMode === 'light'
                      ? 'bg-[#141414] text-white shadow-sm ring-2 ring-[#141414]'
                      : 'bg-[#f3f3f3] text-[#707070] hover:text-[#141414]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Modo Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dark');
                    localStorage.setItem('ustudio_adm_theme_v5', 'dark');
                  }}
                  className={`h-9 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    themeMode === 'dark'
                      ? 'bg-white text-black shadow-sm ring-2 ring-white'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Modo Escuro</span>
                </button>
              </div>
            </div>

            {/* B. CORES POR TIPO DE CLIENTE (Feminino / Masculino) */}
            <div className={`p-4 rounded-[22px] border space-y-3 ${
              themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ffffff] border-[#e8e8e8]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f3f3f3] dark:bg-white/10 flex items-center justify-center text-[#141414] dark:text-white">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    Cores da Plataforma por Nicho / Cliente
                  </h3>
                  <span className="text-[10px] text-[#707070]">
                    Personalize para público feminino, masculino ou estética automotiva
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(COLOR_CONFIG).map((c) => {
                  const isSelected = accentColor === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setAccentColor(c.key as any);
                        localStorage.setItem('ustudio_adm_color_v5', c.key);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? `${c.border} ring-2 ${c.ring} ${themeMode === 'dark' ? 'bg-white/10' : 'bg-white'}`
                          : themeMode === 'dark'
                          ? 'bg-white/5 border-white/10 hover:border-white/30'
                          : 'bg-[#f8f8f8] border-[#e8e8e8] hover:border-[#141414]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                          {c.key.charAt(0).toUpperCase() + c.key.slice(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#707070] block leading-tight">
                        {c.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. TROCAR E-MAIL E SENHA DO ADM (Conforme solicitado) */}
            <div className={`p-4 rounded-[22px] border space-y-3 ${
              themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ffffff] border-[#e8e8e8]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f3f3f3] dark:bg-white/10 flex items-center justify-center text-[#141414] dark:text-white">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    Credenciais de Acesso do Administrador
                  </h3>
                  <span className="text-[10px] text-[#707070]">
                    Altere o e-mail e a senha do painel ADM
                  </span>
                </div>
              </div>

              {credSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{credSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] block mb-1">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    value={newEmailInput || adminEmail}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className={`w-full h-9 px-3.5 rounded-full text-xs font-semibold border focus:outline-none ${
                      themeMode === 'dark'
                        ? 'bg-white/5 border-white/10 text-white focus:border-white'
                        : 'bg-[#f5f5f5] border-[#e0e0e0] text-[#141414] focus:border-[#141414]'
                    }`}
                    placeholder="tonyfilho911@gmail.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] block mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className={`w-full h-9 px-3.5 rounded-full text-xs font-semibold border focus:outline-none ${
                        themeMode === 'dark'
                          ? 'bg-white/5 border-white/10 text-white focus:border-white'
                          : 'bg-[#f5f5f5] border-[#e0e0e0] text-[#141414] focus:border-[#141414]'
                      }`}
                      placeholder="Mínimo 6 dígitos"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] block mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className={`w-full h-9 px-3.5 rounded-full text-xs font-semibold border focus:outline-none ${
                        themeMode === 'dark'
                          ? 'bg-white/5 border-white/10 text-white focus:border-white'
                          : 'bg-[#f5f5f5] border-[#e0e0e0] text-[#141414] focus:border-[#141414]'
                      }`}
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (newPasswordInput && newPasswordInput !== confirmPasswordInput) {
                      alert('A confirmação da nova senha não confere!');
                      return;
                    }
                    if (newEmailInput) {
                      setAdminEmail(newEmailInput);
                      localStorage.setItem('ustudio_adm_email_v5', newEmailInput);
                    }
                    if (newPasswordInput) {
                      setAdminPassword(newPasswordInput);
                      localStorage.setItem('ustudio_adm_password_v5', newPasswordInput);
                    }
                    setCredSuccessMsg('Credenciais atualizadas com sucesso!');
                    setNewPasswordInput('');
                    setConfirmPasswordInput('');
                    setTimeout(() => setCredSuccessMsg(null), 3000);
                  }}
                  className="w-full h-9 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Salvar Novas Credenciais
                </button>
              </div>
            </div>

            {/* D. SESSÃO PARA PLANOS (Conforme solicitado) */}
            <div className={`p-4 rounded-[22px] border space-y-3 ${
              themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#141414] text-white shadow-md'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold block text-white">
                      Planos de Assinatura & Upgrades
                    </h3>
                    <span className="text-[10px] text-white/60">
                      Plano Base R$ 24,90/mês + Funções Modulares
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                  Gerenciar
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                Configure os planos de assinatura da plataforma, crie novos planos, edite preços e <b>vincule funções específicas</b> do sistema a cada plano.
              </p>

              <button
                type="button"
                onClick={() => setActivePage('planos')}
                className="w-full h-10 rounded-full bg-white text-[#141414] font-bold text-xs hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Acessar Gestão de Planos & Funções</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* E. SESSÃO INTEGRAÇÃO SYNCPAY API PIX (Abre em Modal conforme solicitado) */}
            <div className={`p-4 rounded-[22px] border space-y-3 ${
              themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#f8f8f8] border-[#e8e8e8]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-bold flex items-center gap-1.5 ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <span>Integração SyncPay API Pix</span>
                  </h3>
                  <span className="text-[10px] text-[#707070] font-mono">
                    https://api.syncpayments.com.br/
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                  Ativa
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className={`flex justify-between items-center py-1 px-3 rounded-xl border ${
                  themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-[#e8e8e8]'
                }`}>
                  <span className="text-[#707070] text-[10px]">Chave Pix:</span>
                  <span className={`font-mono text-xs font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    {syncPayConfig.pixKey}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Timeout padrão SyncPay: 5 segundos. Aciona evento no CashIn pago.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(true)}
                  className="w-full h-10 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-[#00c2ff]" />
                  <span>Abrir Configuração SyncPay & Simulação</span>
                </button>
              </div>
            </div>

            {/* F. BOTÃO DE SAIR / LOGOUT (Conforme solicitado) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full h-11 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta de Administrador</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PÁGINA DE PLANOS (Plano Atual de 24,90 e funções cobradas juntas) */}
        {/* ========================================================================= */}
        {activePage === 'planos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header with Back to Ajustes and New Plan Button */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActivePage('ajustes')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                  themeMode === 'dark' ? 'bg-white/10 text-white' : 'bg-[#f3f3f3] text-[#141414]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar aos Ajustes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsPlanEditModalOpen(true);
                }}
                className="h-8 px-3.5 rounded-full bg-[#141414] dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Novo Plano</span>
              </button>
            </div>

            <div>
              <h1 className={`text-xl font-bold tracking-tight leading-tight ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                Planos & Funções da Plataforma.
              </h1>
              <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                Plano base atual de <b>R$ 24,90/mês</b> + funções adicionais cobradas juntas na fatura
              </p>
            </div>

            {/* CARD DESTAQUE: PLANO BASE ATUAL (R$ 24,90/mês) */}
            <div
              className={`p-4 rounded-[22px] border space-y-3 shadow-md relative overflow-hidden ${
                themeMode === 'dark' ? 'bg-white/5 border-white/15' : 'bg-[#ffffff] border-[#141414]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-white text-[9px] font-extrabold uppercase shadow-xs"
                      style={{ backgroundColor: currentAccent.hex }}
                    >
                      Plano Base Atual
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.2 rounded-full">
                      Padrão Ustudio
                    </span>
                  </div>
                  <h3 className={`text-lg font-extrabold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    Plano Base Ustudio
                  </h3>
                  <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                    Site público mobile, catálogo de serviços, agenda inteligente e agendamentos no WhatsApp.
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-black text-[#141414] dark:text-white block">
                    R$ 24,90
                  </span>
                  <span className="text-[10px] text-[#707070]">por mês</span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 border-t border-[#f0f0f0] dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] text-[#707070] dark:text-white/70">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Site & Vitrine Mobile</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#707070] dark:text-white/70">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Agenda & Bloqueios</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#707070] dark:text-white/70">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Agendamentos no WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#707070] dark:text-white/70">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Chave Pix de Pagamento</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO: FUNÇÕES ADICIONAIS BLOQUEADAS (COBRADAS JUNTAS) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    Módulos & Funções Bloqueadas (Upgrades)
                  </h3>
                  <span className="text-[10px] text-[#707070]">
                    Ative as funções desejadas: tudo é cobrado junto na próxima mensalidade
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {upgrades.map((upg) => {
                  const isChecked = selectedUpgradesForBilling.includes(upg.id);
                  return (
                    <div
                      key={upg.id}
                      onClick={() => {
                        setSelectedUpgradesForBilling((prev) =>
                          isChecked ? prev.filter((id) => id !== upg.id) : [...prev, upg.id]
                        );
                      }}
                      className={`p-3.5 rounded-[18px] border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? `${currentAccent.border} ring-1 ${currentAccent.ring} ${
                              themeMode === 'dark' ? 'bg-white/10' : 'bg-white'
                            }`
                          : themeMode === 'dark'
                          ? 'bg-white/5 border-white/10 hover:border-white/30'
                          : 'bg-[#f8f8f8] border-[#e8e8e8] hover:border-[#141414]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 rounded accent-[#141414] dark:accent-white mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                            {upg.name}
                          </h4>
                          <p className={`text-[11px] leading-relaxed mt-0.5 ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                            {upg.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-emerald-600 block">
                          + R$ {upg.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[9px] text-[#707070]">por mês</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DEMONSTRATIVO: TUDO COBRADO JUNTO NA PRÓXIMA MENSALIDADE */}
              {(() => {
                const upgradesSelectedTotal = upgrades
                  .filter((u) => selectedUpgradesForBilling.includes(u.id))
                  .reduce((sum, u) => sum + u.price, 0);
                const nextConsolidatedBilling = 24.9 + upgradesSelectedTotal;

                return (
                  <div
                    className="p-4 rounded-[20px] text-white space-y-2.5 shadow-md mt-3"
                    style={{
                      background:
                        themeMode === 'dark'
                          ? 'linear-gradient(135deg, #16222f 0%, #1e293b 100%)'
                          : 'linear-gradient(135deg, #141414 0%, #262626 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                          Demonstrativo Consolidado
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          Próxima Mensalidade Pix SyncPay
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400 block">
                          R$ {nextConsolidatedBilling.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-white/60">cobrado junto</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-white/80 space-y-1">
                      <div className="flex justify-between">
                        <span>• Plano Base Ustudio:</span>
                        <b className="text-white">R$ 24,90</b>
                      </div>
                      <div className="flex justify-between">
                        <span>• Funções Adicionais ({selectedUpgradesForBilling.length} ativas):</span>
                        <b className="text-emerald-300">+ R$ {upgradesSelectedTotal.toFixed(2).replace('.', ',')}</b>
                      </div>
                    </div>

                    <p className="text-[10px] text-white/70 bg-white/10 p-2 rounded-xl leading-relaxed">
                      💡 <b>Cobrança Única:</b> Caso o usuário assine as funções adicionais, todos os valores são unificados e cobrados juntos na próxima mensalidade via Pix da SyncPay.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForPix({
                          id: 'plan_consolidated',
                          name: `Plano Base + ${selectedUpgradesForBilling.length} Funções`,
                          price: nextConsolidatedBilling,
                          period: '/mês',
                          description: 'Mensalidade unificada com plano base e funções adicionais',
                          features: ['Plano Base R$ 24,90', ...selectedUpgradesForBilling],
                        });
                        setPixGeneratedCode(
                          `00020126580014br.gov.bcb.pix0136tonyfilho911@gmail.com520400005303986540${nextConsolidatedBilling.toFixed(2)}5802BR5924Tony Oliveira Ustudio6008Campinas62070503***6304E8A2`
                        );
                        setIsPixModalOpen(true);
                      }}
                      className="w-full h-10 rounded-full bg-white text-[#141414] font-bold text-xs hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5 text-black" />
                      <span>Gerar Pix SyncPay da Mensalidade Consolidada</span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* DEMAIS PLANOS PRÉ-CONFIGURADOS DA PLATAFORMA */}
            <div className="space-y-3 pt-2">
              <span className={`text-xs font-bold block ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                Outros Planos Estruturados
              </span>

              {plans
                .filter((p) => p.id !== 'plan_base')
                .map((plan) => {
                  const linkedFnsCount = plan.linkedFunctions?.length || 0;
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-[22px] border transition-all space-y-3 shadow-xs ${
                        themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#ffffff] border-[#e5e5e5]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className={`text-base font-bold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                            {plan.name}
                          </h4>
                          <p className={`text-xs ${themeMode === 'dark' ? 'text-white/60' : 'text-[#707070]'}`}>
                            {plan.description}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={`text-xl font-extrabold ${themeMode === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[11px] text-[#707070] block">{plan.period}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#f5f5f5] dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsPlanEditModalOpen(true);
                          }}
                          className={`flex-1 h-9 rounded-full text-xs font-bold transition-colors ${
                            themeMode === 'dark'
                              ? 'bg-white text-black hover:bg-white/90'
                              : 'bg-[#141414] text-white hover:bg-[#262626]'
                          }`}
                        >
                          Editar Plano & Funções
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanForPix(plan);
                            setPixGeneratedCode(
                              `00020126580014br.gov.bcb.pix0136tonyfilho911@gmail.com520400005303986540${plan.price}5802BR5924Tony Oliveira Ustudio6008Campinas62070503***6304E8A2`
                            );
                            setIsPixModalOpen(true);
                          }}
                          className="h-9 px-3.5 rounded-full bg-[#f3f3f3] dark:bg-white/10 hover:bg-[#e0e0e0] text-[#141414] dark:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pix</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 5-PAGE MOBILE FIXED NAVBAR (Bottom Nav with Stadium Pills) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto h-14 px-2 rounded-full bg-[#141414] border border-white/10 flex items-center justify-between gap-1 shadow-2xl max-w-md w-full">
          {/* 1. Início */}
          <button
            type="button"
            onClick={() => setActivePage('inicio')}
            className={`flex-1 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePage === 'inicio'
                ? 'bg-[#ffffff] text-[#141414]'
                : 'text-[#adadad] hover:text-[#ffffff]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold">Início</span>
          </button>

          {/* 2. Mapa */}
          <button
            type="button"
            onClick={() => setActivePage('mapa')}
            className={`flex-1 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePage === 'mapa'
                ? 'bg-[#ffffff] text-[#141414]'
                : 'text-[#adadad] hover:text-[#ffffff]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-bold">Mapa</span>
          </button>

          {/* 3. Clientes */}
          <button
            type="button"
            onClick={() => setActivePage('clientes')}
            className={`flex-1 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePage === 'clientes'
                ? 'bg-[#ffffff] text-[#141414]'
                : 'text-[#adadad] hover:text-[#ffffff]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold">Clientes</span>
          </button>

          {/* 4. Planos */}
          <button
            type="button"
            onClick={() => setActivePage('planos')}
            className={`flex-1 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePage === 'planos'
                ? 'bg-[#ffffff] text-[#141414]'
                : 'text-[#adadad] hover:text-[#ffffff]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold">Planos</span>
          </button>

          {/* 5. Ajustes */}
          <button
            type="button"
            onClick={() => setActivePage('ajustes')}
            className={`flex-1 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePage === 'ajustes'
                ? 'bg-[#ffffff] text-[#141414]'
                : 'text-[#adadad] hover:text-[#ffffff]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-bold">Ajustes</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETALHES COMPLETOS DO LEAD */}
      {/* ========================================================================= */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        onClose={() => {
          setIsLeadDetailModalOpen(false);
          setSelectedLeadForDetail(null);
        }}
        onUpdateStatus={handleUpdateLeadStatus}
        onConvertToSubscriber={handleConvertToSubscriber}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: CRIAR E EDITAR PLANO & VINCULAR FUNÇÕES */}
      {/* ========================================================================= */}
      <PlanEditModal
        plan={editingPlan}
        isOpen={isPlanEditModalOpen}
        onClose={() => {
          setIsPlanEditModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: SIMULAÇÃO E CONFIGURAÇÃO DE WEBHOOK SYNCPAY */}
      {/* ========================================================================= */}
      <SyncPayWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        config={syncPayConfig}
        prospects={prospects}
        onWebhookSuccess={handleWebhookSuccess}
        onUpdateConfig={setSyncPayConfig}
      />

      {/* ========================================================================= */}
      {/* MODAL 4: PIX SYNCPAY CASHIN GENERATOR */}
      {/* ========================================================================= */}
      {isPixModalOpen && selectedPlanForPix && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsPixModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
              <div>
                <h3 className="text-base font-bold text-[#141414]">
                  Pix SyncPay CashIn.
                </h3>
                <span className="text-xs text-[#707070]">{selectedPlanForPix.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPixModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#707070] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-[20px] bg-[#f9f9f9] border border-[#f0f0f0] text-center space-y-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#e0e0e0]">
                <QrCode className="w-36 h-36 text-[#141414]" />
              </div>

              <div>
                <span className="text-2xl font-bold text-[#141414] block">
                  R$ {selectedPlanForPix.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-[#707070]">
                  Chave Pix: {syncPayConfig.pixKey}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pixGeneratedCode);
                  setPixCopied(true);
                  setTimeout(() => setPixCopied(false), 2000);
                }}
                className="w-full h-10 rounded-full bg-[#141414] text-[#ffffff] text-xs font-semibold hover:bg-[#262626] transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{pixCopied ? 'Código Copiado!' : 'Copiar Pix Copia e Cola'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPixModalOpen(false);
                  setIsWebhookModalOpen(true);
                }}
                className="w-full h-10 rounded-full bg-[#f3f3f3] hover:bg-[#e0e0e0] text-[#141414] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[#0066ff]" />
                <span>Abrir Simulador de Webhook</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: NOVO LEAD EM CAMPINAS */}
      {/* ========================================================================= */}
      {isNewLeadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#141414]">
                  Novo ponto em Campinas.
                </h3>
                <span className="text-xs text-[#707070]">Cadastre para prospecção no mapa</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#707070] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                  Nome do estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Prime Taquaral"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                    Nicho
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs font-semibold"
                  >
                    <option value="barbearia">Barbearia</option>
                    <option value="estetica_automotiva">Estética auto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cambuí"
                    value={newBairro}
                    onChange={(e) => setNewBairro(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(19) 99999-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  placeholder="Rua, número - Bairro, Campinas - SP"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-full bg-[#f0f0f0] text-[#141414] border-none text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                  Diagnóstico / Oportunidade
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Procura agendamento mobile sem filas..."
                  value={newPotential}
                  onChange={(e) => setNewPotential(e.target.value)}
                  className="w-full p-3 rounded-[16px] bg-[#f0f0f0] text-[#141414] border-none text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="flex-1 h-10 rounded-full bg-[#f3f3f3] text-[#141414] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-[#141414] text-white font-semibold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: FICHA DETALHADA DO ASSINANTE / CLIENTE */}
      {/* ========================================================================= */}
      <SubscriberDetailModal
        subscriber={selectedSubscriberForDetail}
        isOpen={isSubscriberModalOpen}
        onClose={() => {
          setIsSubscriberModalOpen(false);
          setSelectedSubscriberForDetail(null);
        }}
        onChargePix={(sub) => {
          const targetPlan = plans.find((p) => p.name === sub.planName) || plans[0];
          setSelectedPlanForPix({
            ...targetPlan,
            price: sub.monthlyAmount,
            name: `${sub.businessName} (Mensalidade Consolidada)`,
          });
          setPixGeneratedCode(
            `00020126580014br.gov.bcb.pix0136tonyfilho911@gmail.com520400005303986540${sub.monthlyAmount}5802BR5924Tony Oliveira Ustudio6008Campinas62070503***6304E8A2`
          );
          setIsPixModalOpen(true);
        }}
        onUpdateStatus={(subscriberId, status) => {
          setSubscribers((prev) =>
            prev.map((s) => (s.id === subscriberId ? { ...s, status } : s))
          );
        }}
        plans={plans}
      />

      {/* ========================================================================= */}
      {/* MODAL 7: CONFIRMAÇÃO DE SAIR / LOGOUT DO ADM */}
      {/* ========================================================================= */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-white/10 rounded-[24px] p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#141414] dark:text-white">
                Sair do Painel de Administrador?
              </h3>
              <p className="text-xs text-[#707070] dark:text-white/60 mt-1">
                Você será desconectado da sessão de administrador e redirecionado para a vitrine do aplicativo.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 h-10 rounded-full bg-[#f3f3f3] dark:bg-white/10 text-[#141414] dark:text-white font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  window.location.href = '/';
                }}
                className="flex-1 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
