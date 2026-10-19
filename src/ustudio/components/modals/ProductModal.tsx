// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Pencil, Gift, Check, Package, ShoppingBag, Plus, Minus } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, setEditingService, categories, showToast, addProductReservation } = useApp();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'sobre' | 'specs' | 'avaliacoes'>('sobre');

  if (!selectedProduct) return null;

  const currentCategory = categories.find((c) => c.key === selectedProduct.cat) || categories[0];

  const handleAddToCart = () => {
    const rawCents = selectedProduct.cents || 4500;
    const totalCents = rawCents * qty;
    const totalPrice = `R$ ${(totalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    addProductReservation?.({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerName: 'Cliente Loja Online',
      customerPhone: '(19) 99821-4321',
      quantity: qty,
      unitPrice: selectedProduct.price,
      totalPrice,
      pickupDate: 'Hoje às 18:00',
      status: 'Pendente',
      notes: 'Reserva efetuada pelo catálogo público.',
    });

    showToast(`${qty}x "${selectedProduct.name}" reservado para retirada!`);
    setSelectedProduct(null);
  };

  const handleEditProduct = () => {
    const itemToEdit = selectedProduct;
    setSelectedProduct(null);
    setEditingService({ item: itemToEdit, isNew: false });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">Detalhes do produto</h3>
          <button
            onClick={() => setSelectedProduct(null)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Hero */}
        <div
          className="h-44 rounded-2xl flex items-center justify-center text-6xl relative overflow-hidden mb-4 shadow-inner"
          style={{
            background: selectedProduct.image
              ? `url('${selectedProduct.image}') center/cover no-repeat`
              : `linear-gradient(135deg, ${currentCategory.soft} 0%, rgba(22,22,22,0.9) 100%)`,
          }}
        >
          {selectedProduct.badge && (
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-r from-[#00c2ff] to-[#0284c7] shadow-md">
              {selectedProduct.badge}
            </span>
          )}

          <button
            onClick={handleEditProduct}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            title="Editar este produto"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {!selectedProduct.image && <span>{selectedProduct.emoji || currentCategory.emoji}</span>}
        </div>

        {/* Product Headings */}
        <div className="mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00c2ff] block mb-1">
            {currentCategory.label}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
            {selectedProduct.name}
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mt-1">
            {selectedProduct.desc}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#1e1e1e] flex flex-col items-center justify-center text-center gap-1">
            <Gift className="w-4 h-4 text-[#00c2ff]" />
            <span className="text-[10px] font-bold text-white/70">Presenteável</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#1e1e1e] flex flex-col items-center justify-center text-center gap-1">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-white/70">Pronto p/ venda</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#1e1e1e] flex flex-col items-center justify-center text-center gap-1">
            <Package className="w-4 h-4 text-[#2f7dff]" />
            <span className="text-[10px] font-bold text-white/70">Pagar no ato</span>
          </div>
        </div>

        {/* Price & Quantity Selector */}
        <div className="p-3.5 rounded-2xl bg-[#1e1e1e] flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
              Valor unitário
            </span>
            <span className="text-xl font-extrabold text-white">{selectedProduct.price}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#262626] rounded-full p-1 border border-white/10">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-full bg-[#161616] text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-white w-5 text-center">{qty}</span>
            <button
              onClick={() => setQty((prev) => prev + 1)}
              className="w-7 h-7 rounded-full bg-[#161616] text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-3.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs flex items-center justify-center gap-2 mb-5 shadow-lg active:scale-98 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Reservar para compra ({qty} un)</span>
        </button>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-3">
          <button
            onClick={() => setActiveTab('sobre')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'sobre' ? 'text-white border-[#00c2ff]' : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            Sobre
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'specs' ? 'text-white border-[#00c2ff]' : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            Ficha técnica
          </button>
          <button
            onClick={() => setActiveTab('avaliacoes')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'avaliacoes' ? 'text-white border-[#00c2ff]' : 'text-white/40 border-transparent hover:text-white'
            }`}
          >
            Avaliações
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs text-white/70 leading-relaxed min-h-[60px]">
          {activeTab === 'sobre' && (
            <p>
              {selectedProduct.desc}
              <br />
              <br />
              Este item pode ser reservado para retirada e pagamento no estabelecimento.
            </p>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Categoria</span>
                <span className="text-white font-medium">{currentCategory.label}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Prazo</span>
                <span className="text-white font-medium">{selectedProduct.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Integração</span>
                <span className="text-white font-medium">Reserva / Pagamento no ato</span>
              </div>
            </div>
          )}

          {activeTab === 'avaliacoes' && (
            <p className="text-white/40 text-center py-2">
              ⭐ 4.9 · Avaliado por 28 clientes que compraram este produto recentemente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
