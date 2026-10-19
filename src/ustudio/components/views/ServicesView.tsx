// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import {
  TrendingUp,
  CreditCard,
  List,
  LayoutGrid,
  Plus,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const {
    services,
    profile, saveProfile, showToast,
    categories,
    paymentConfig,
    setActiveTab,
    setIsPaymentConfigOpen,
    setEditingService,
    setSelectedProduct,
    setIsCategoryModalOpen,
  } = useApp();

  const [catalogTab, setCatalogTab] = useState('servico');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredServices = services.filter((s) => {
    if (s.type !== catalogTab) return false;
    if (selectedFilter === 'all') return true;
    return s.cat === selectedFilter;
  });

  // Group services by category
  const grouped = categories.reduce<Record<string, ServiceItem[]>>((acc, cat) => {
    const matched = filteredServices.filter((s) => s.cat === cat.key);
    if (matched.length > 0) {
      acc[cat.key] = matched;
    }
    return acc;
  }, {});

  const handleItemClick = (item: ServiceItem) => {
    if (item.type === 'produto') {
      setSelectedProduct(item);
    } else {
      setEditingService({ item, isNew: false });
    }
  };

  const getPaymentStatusText = () => {
    if (paymentConfig.activeMethod === 'sync') return 'Pix via API SyncPayments ativo';
    if (paymentConfig.activeMethod === 'infinite') return 'InfinitePay Checkout ativo';
    if (paymentConfig.activeMethod === 'both') return 'Pix e InfinitePay ativos';
    return 'Nenhum método configurado';
  };

  return (
    <div className="px-5 space-y-5">
      {/* Header with Title, Mode Switcher/Config Button, and Add Button */}
      <div className="flex items-center justify-between pt-3">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {catalogTab === 'servico' ? 'Serviços' : 'Catálogo'}
          </h2>
          <span className="text-xs text-white/45 block mt-0.5">
            {catalogTab === 'servico' ? 'Procedimentos e cortes' : 'Produtos para venda e reserva'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de configuração/alternância ao lado do botão de novo item */}
          <button
            onClick={() => {
              const next = catalogTab === 'servico' ? 'produto' : 'servico';
              setCatalogTab(next);
              setSelectedFilter('all');
              showToast(next === 'servico' ? 'Exibindo Serviços da barbearia' : 'Exibindo Catálogo de Produtos');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1e1e] hover:bg-[#282828] border border-white/15 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Alternar entre Serviços e Catálogo"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2f7dff]" />
            <span>{catalogTab === 'servico' ? 'Catálogo' : 'Serviços'}</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 active:scale-95 transition-transform shadow-sm"
            title="Criar e editar categorias de produtos e serviços"
          >
            <Tag className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Categorias</span>
          </button>
        </div>
      </div>

      {catalogTab === 'produto' && (
        <div className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 space-y-2 text-xs text-white/70">
          <div className="flex items-center justify-between">
            <b className="text-white text-xs">Catálogo de Produtos (Até 10 itens)</b>
            <span className="text-[11px] text-[#ffb020] font-bold">R$ 12,90/mês</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            {services.filter((s) => s.type === 'produto').length}/10 produtos cadastrados · Clientes podem reservar para pagar no ato.
          </p>
          {!profile.catalogDemo && (
            <button
              onClick={() => saveProfile({ catalogDemo: true })}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
            >
              Ativar demonstração do catálogo
            </button>
          )}
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex gap-1 p-1 bg-[#161616] border border-white/10 rounded-full">
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === 'list' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === 'cards' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>

        <span className="text-xs text-white/45">
          {filteredServices.length} {filteredServices.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            selectedFilter === 'all'
              ? 'bg-white text-black'
              : 'bg-[#161616] border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          Todas ({services.filter(s => s.type === catalogTab).length})
        </button>
        {categories.map((cat) => {
          const count = services.filter((s) => s.cat === cat.key && s.type === catalogTab).length;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedFilter(cat.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedFilter === cat.key
                  ? 'bg-white text-black'
                  : 'bg-[#161616] border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Services List / Cards */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#161616] border border-white/10 text-center">
            <p className="text-sm text-white/60">Nenhum item nesta categoria.</p>
            <button
              onClick={() => catalogTab === 'produto' && !profile.catalogDemo ? showToast('Ative a demonstração do catálogo primeiro.') : setEditingService({ item: null, isNew: true, defaultType: catalogTab })}
              className="mt-3 text-xs font-semibold text-[#2f7dff] hover:underline"
            >
              + Adicionar item agora
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([catKey, items]) => {
            const cat = categories.find((c) => c.key === catKey) || categories[0];

            if (viewMode === 'list') {
              return (
                <div key={catKey} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm"></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                      {cat.label}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleItemClick(s)}
                        className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 hover:bg-[#1e1e1e] hover:border-white/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                              {s.name}
                            </span>
                            {s.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                {s.badge}
                              </span>
                            )}
                            {s.type === 'produto' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Produto
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {s.duration} · {s.desc ? s.desc.slice(0, 50) + '...' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-3 py-1.5 rounded-full bg-[#262626] text-xs font-bold text-white">
                            {s.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Cards view
            return (
              <div key={catKey} className="space-y-3">
                <div className="flex items-baseline justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base"></span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{cat.label}</h3>
                  </div>
                  <span className="text-xs text-white/45">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleItemClick(s)}
                      className="flex-shrink-0 w-[240px] rounded-3xl bg-[#161616] border border-white/10 hover:border-white/30 transition-all overflow-hidden cursor-pointer flex flex-col group shadow-lg"
                    >
                      {/* Visual Header */}
                      <div
                        className="h-36 relative flex items-center justify-center text-5xl overflow-hidden"
                        style={{
                          background: s.image
                            ? `url('${s.image}') center/cover no-repeat`
                            : `linear-gradient(180deg, ${cat.soft} 0%, rgba(22,22,22,0.85) 100%)`,
                        }}
                      >
                        {s.badge && (
                          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-r from-[#00c2ff] to-[#0284c7] shadow-md">
                            {s.badge}
                          </span>
                        )}
                        {s.type === 'produto' && (
                          <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                            Reserva
                          </span>
                        )}
                        {!s.image && (
                          <span className="group-hover:scale-110 transition-transform">
                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                            {cat.label}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-1 mb-1">
                            {s.name}
                          </h4>
                          <p className="text-xs text-white/55 line-clamp-2 leading-relaxed mb-3">
                            {s.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div>
                            <span className="text-base font-extrabold text-white block">
                              {s.price}
                            </span>
                            <span className="text-[10px] text-white/45">{s.duration}</span>
                          </div>
                          <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00c2ff] to-[#0284c7] text-white font-bold text-xs shadow-md group-hover:opacity-90">
                            {s.type === 'produto' ? 'Reservar' : 'Detalhes'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
