import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductReservation } from '../../types';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Trash2,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  X,
  ExternalLink,
  LayoutGrid,
  List,
} from 'lucide-react';

interface ProductReservationsViewProps {
  onBack: () => void;
}

const STATUS_CONFIG: Record<
  ProductReservation['status'],
  { label: string; bg: string; text: string; border: string }
> = {
  Pendente: {
    label: 'Pendente',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  Separado: {
    label: 'Separado no Balcão',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  'Pronto para Retirada': {
    label: 'Pronto p/ Retirada',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  Entregue: {
    label: 'Concluído & Entregue',
    bg: 'bg-zinc-800',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
  },
  Cancelado: {
    label: 'Cancelado',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
};

export const ProductReservationsView: React.FC<ProductReservationsViewProps> = ({ onBack }) => {
  const {
    productReservations,
    updateProductReservationStatus,
    deleteProductReservation,
    addProductReservation,
    services,
    profile,
    saveProfile,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewFormat, setViewFormat] = useState<'cards' | 'compact'>('cards');

  // New reservation form state
  const [newProductId, setNewProductId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newPickupDate, setNewPickupDate] = useState('Hoje à tarde');
  const [newNotes, setNewNotes] = useState('');

  // Products available in catalog
  const catalogProducts = useMemo(() => {
    return services.filter((s) => s.type === 'produto');
  }, [services]);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return productReservations.filter((res) => {
      const matchSearch =
        !searchTerm ||
        res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customerPhone.includes(searchTerm);

      const matchStatus =
        selectedStatus === 'todos' || res.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [productReservations, searchTerm, selectedStatus]);

  // Financial and KPI calculations
  const totalCount = productReservations.length;
  const readyCount = productReservations.filter(
    (r) => r.status === 'Pronto para Retirada'
  ).length;
  const pendingCount = productReservations.filter(
    (r) => r.status === 'Pendente' || r.status === 'Separado'
  ).length;

  const totalValueCents = useMemo(() => {
    return productReservations
      .filter((r) => r.status !== 'Cancelado')
      .reduce((sum, r) => {
        const raw = r.totalPrice.replace(/[^\d]/g, '');
        return sum + (parseInt(raw, 10) || 0);
      }, 0);
  }, [productReservations]);

  const formattedTotalValue = `R$ ${(totalValueCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      showToast('Informe o nome do cliente');
      return;
    }

    const selectedProduct = catalogProducts.find((p) => p.id === newProductId) || catalogProducts[0];
    const unitPrice = selectedProduct ? selectedProduct.price : 'R$ 45,00';
    const unitCents = selectedProduct?.cents || 4500;
    const totalCents = unitCents * newQuantity;
    const totalPrice = `R$ ${(totalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    addProductReservation({
      productId: selectedProduct ? selectedProduct.id : 'prod-custom',
      productName: selectedProduct ? selectedProduct.name : 'Produto do Catálogo',
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || '(19) 99999-0000',
      quantity: newQuantity,
      unitPrice,
      totalPrice,
      pickupDate: newPickupDate.trim() || 'A combinar',
      status: 'Pendente',
      notes: newNotes.trim() || undefined,
    });

    setIsNewModalOpen(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewQuantity(1);
    setNewNotes('');
  };

  const sendWhatsAppNotification = (res: ProductReservation) => {
    const cleanPhone = res.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent(
      `Olá, ${res.customerName}! 👋\n\nAqui é do ${profile.name || 'nosso estabelecimento'}.\n\nPassando para avisar que sua reserva de *${res.quantity}x ${res.productName}* (${res.totalPrice}) já está separada e pronta para retirada no balcão!\n\nHorário previsto: ${res.pickupDate || 'Hoje'}.\nFicamos no aguardo da sua visita!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#fafafa] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Voltar para início"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Reservas de Produtos
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Catálogo Ativo
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Pedidos para retirada e pagamento no balcão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Mode Toggle: Cards vs Compact */}
          <div className="flex items-center p-0.5 rounded-full bg-[#1c1c1c] border border-white/10">
            <button
              type="button"
              onClick={() => setViewFormat('cards')}
              className={`p-1.5 rounded-full transition-all ${
                viewFormat === 'cards'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Visualização em Cards Detalhados"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('compact')}
              className={`p-1.5 rounded-full transition-all ${
                viewFormat === 'compact'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Visualização em Fila Compacta de Balcão"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (catalogProducts.length > 0) {
                setNewProductId(catalogProducts[0].id);
              }
              setIsNewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nova Reserva</span>
          </button>
        </div>
      </header>

      {/* Catalog Warning if disabled */}
      {!profile.catalogDemo && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-amber-200">
            <b className="text-white block font-semibold">
              Catálogo de Produtos em Modo de Demonstração
            </b>
            <p className="text-white/70 leading-relaxed">
              Para que os clientes possam navegar e reservar seus produtos
              diretamente no link público, ative a demonstração do catálogo.
            </p>
            <button
              onClick={() => saveProfile({ catalogDemo: true })}
              className="mt-1 px-3 py-1 rounded-full bg-amber-400 text-black font-bold text-[11px] hover:bg-amber-300 transition-colors"
            >
              Ativar Demonstração do Catálogo
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        <div className="p-3 rounded-2xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Total Reservas
          </span>
          <span className="text-lg font-extrabold text-white mt-1">
            {totalCount}
          </span>
          <span className="text-[10px] text-white/45">pedidos no catálogo</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Prontos / Balcão
          </span>
          <span className="text-lg font-extrabold text-emerald-400 mt-1">
            {readyCount}
          </span>
          <span className="text-[10px] text-emerald-400/70">aguardando retirada</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Volume Total
          </span>
          <span className="text-sm font-extrabold text-[#00c2ff] mt-1 truncate">
            {formattedTotalValue}
          </span>
          <span className="text-[10px] text-white/45">{pendingCount} pendentes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 mt-4 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, produto ou telefone..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedStatus('todos')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedStatus === 'todos'
                ? 'bg-white text-black font-bold'
                : 'bg-[#161616] text-white/60 hover:text-white border border-white/10'
            }`}
          >
            Todos ({productReservations.length})
          </button>
          {Object.keys(STATUS_CONFIG).map((st) => {
            const count = productReservations.filter((r) => r.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#161616] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservations List - Dois Formatos de Visualização (Cards vs Fila Compacta) */}
      <div className="px-4 mt-4 space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl p-6">
            <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white/70">
              Nenhuma reserva encontrada
            </p>
            <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
              Quando clientes reservarem produtos pelo seu catálogo, eles
              aparecerão aqui para você separar e avisar via WhatsApp.
            </p>
          </div>
        ) : viewFormat === 'cards' ? (
          /* ========================================================================= */
          /* FORMATO 1: CARDS DETALHADOS (Visualização Expandida & Ações Rápidas) */
          /* ========================================================================= */
          filteredReservations.map((res) => {
            const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG['Pendente'];

            return (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-[#141414] border border-white/10 hover:border-white/25 transition-all space-y-3 shadow-md"
              >
                {/* Header of reservation */}
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-white/5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {res.customerName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                      <Clock className="w-3 h-3 text-white/30" />
                      <span>{res.createdAt}</span>
                      <span>·</span>
                      <span className="text-white/80 font-medium">Retirada: {res.pickupDate || 'A combinar'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Total</span>
                    <span className="text-base font-extrabold text-white">
                      {res.totalPrice}
                    </span>
                  </div>
                </div>

                {/* Product details */}
                <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[#00c2ff] flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white truncate block">
                        {res.productName}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {res.quantity} un × {res.unitPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quote Note */}
                {res.notes && (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/70 italic flex items-start gap-2">
                    <span className="text-white/40 text-base leading-none">“</span>
                    <span className="flex-1">{res.notes}</span>
                    <span className="text-white/40 text-base leading-none">”</span>
                  </div>
                )}

                {/* Actions & Status Control */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    {/* Status dropdown */}
                    <select
                      value={res.status}
                      onChange={(e) =>
                        updateProductReservationStatus(
                          res.id,
                          e.target.value as ProductReservation['status']
                        )
                      }
                      className="bg-[#1e1e1e] border border-white/15 text-white text-xs font-semibold rounded-full px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Separado">Separado no Balcão</option>
                      <option value="Pronto para Retirada">Pronto p/ Retirada</option>
                      <option value="Entregue">Concluído & Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    <button
                      onClick={() => deleteProductReservation(res.id)}
                      className="p-2 rounded-full text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir reserva"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* WhatsApp contact */}
                  <button
                    onClick={() => sendWhatsAppNotification(res)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Avisar no WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* ========================================================================= */
          /* FORMATO 2: FILA DE BALCÃO COMPACTA (Visualização Rápida & Eficiente) */
          /* ========================================================================= */
          <div className="space-y-2">
            {filteredReservations.map((res) => {
              const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG['Pendente'];

              return (
                <div
                  key={res.id}
                  className="p-3 rounded-xl bg-[#141414] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white truncate">
                        {res.customerName}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 truncate">
                      {res.quantity}x {res.productName} · <b className="text-white">{res.totalPrice}</b>
                    </p>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      Retirada: {res.pickupDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={res.status}
                      onChange={(e) =>
                        updateProductReservationStatus(
                          res.id,
                          e.target.value as ProductReservation['status']
                        )
                      }
                      className="bg-[#1e1e1e] border border-white/15 text-white text-[10px] font-medium rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Separado">Separado</option>
                      <option value="Pronto para Retirada">Pronto</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    <button
                      onClick={() => sendWhatsAppNotification(res)}
                      className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                      title="Avisar cliente no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteProductReservation(res.id)}
                      className="p-2 rounded-lg text-white/30 hover:text-rose-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual New Reservation Modal */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#00c2ff]" />
                <h3 className="text-base font-bold text-white">Nova Reserva de Produto</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Selecione o Produto do Catálogo
                </label>
                {catalogProducts.length > 0 ? (
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white focus:outline-none focus:border-[#00c2ff]"
                  >
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.price}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    Nenhum produto cadastrado com tipo "produto". Cadastre produtos na aba Catálogo.
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-white/70 block mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="(19) 99999-0000"
                    className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#00c2ff]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/70 block mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white focus:outline-none focus:border-[#00c2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Previsão de Retirada
                </label>
                <input
                  type="text"
                  value={newPickupDate}
                  onChange={(e) => setNewPickupDate(e.target.value)}
                  placeholder="Ex: Hoje às 18:00 ou Amanhã"
                  className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Já pago via Pix antecipado ou separar embrulho."
                  className="w-full p-2.5 rounded-xl bg-[#202020] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#00c2ff] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#202020] hover:bg-[#282828] text-white font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 active:scale-95 transition-all shadow-md"
                >
                  Registrar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
