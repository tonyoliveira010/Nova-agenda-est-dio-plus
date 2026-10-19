import React, { useState, useEffect } from 'react';
import { PlatformPlan, AVAILABLE_PLAN_FUNCTIONS } from '../adminTypes';
import {
  X,
  CreditCard,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ShoppingBag,
  MessageCircle,
  Clock,
  Award,
  Zap,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface PlanEditModalProps {
  plan: PlatformPlan | null; // null = novo plano
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlatformPlan) => void;
}

export const PlanEditModal: React.FC<PlanEditModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(plan);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(99);
  const [period, setPeriod] = useState('/mês');
  const [description, setDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [linkedFunctions, setLinkedFunctions] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price);
      setPeriod(plan.period || '/mês');
      setDescription(plan.description);
      setIsPopular(Boolean(plan.isPopular));
      setLinkedFunctions(plan.linkedFunctions || []);
      setFeatures(plan.features || []);
    } else {
      setName('');
      setPrice(99);
      setPeriod('/mês');
      setDescription('');
      setIsPopular(false);
      setLinkedFunctions(['fn_blocking', 'fn_whatsapp']);
      setFeatures(['Agenda inteligente', 'Link público']);
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const toggleFunction = (fnId: string) => {
    if (linkedFunctions.includes(fnId)) {
      setLinkedFunctions(linkedFunctions.filter((id) => id !== fnId));
    } else {
      setLinkedFunctions([...linkedFunctions, fnId]);
    }
  };

  const handleAddCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    setFeatures([...features, customFeatureInput.trim()]);
    setCustomFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedPlan: PlatformPlan = {
      id: plan?.id || `plan_${Date.now().toString(36)}`,
      name: name.trim(),
      price: Number(price) || 0,
      period: period.trim() || '/mês',
      description: description.trim(),
      isPopular,
      linkedFunctions,
      features: features.length > 0 ? features : ['Recursos essenciais da plataforma'],
    };

    onSave(savedPlan);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0]">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-[#707070] uppercase tracking-wide">
                Configuração de Planos
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#141414] tracking-tight">
              {isEditing ? 'Editar Plano & Funções' : 'Criar Novo Plano'}
            </h3>
            <p className="text-xs text-[#707070]">
              Defina o valor e vincule recursos exclusivos da plataforma
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#707070] hover:text-[#141414] flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Plan Name */}
          <div>
            <label className="text-[11px] font-bold text-[#141414] block mb-1">
              Nome do Plano *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plano Master Campinas"
              className="w-full h-10 px-3.5 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium focus:outline-none focus:border-[#141414]"
            />
          </div>

          {/* Price & Period */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-[#141414] block mb-1">
                Preço Mensal (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="149.00"
                className="w-full h-10 px-3.5 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium focus:outline-none focus:border-[#141414]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#141414] block mb-1">
                Periodicidade
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="/mês"
                className="w-full h-10 px-3.5 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium focus:outline-none focus:border-[#141414]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-[#141414] block mb-1">
              Descrição para o Estabelecimento
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Ideal para estúdios consolidados com alto volume de clientes..."
              className="w-full p-3 rounded-[16px] bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs resize-none focus:outline-none focus:border-[#141414]"
            />
          </div>

          {/* Is Popular Toggle */}
          <label className="flex items-center justify-between p-3 rounded-[16px] bg-[#f9f9f9] border border-[#ebebeb] cursor-pointer">
            <div>
              <span className="font-bold text-[#141414] text-xs block">
                Destacar como Mais Popular
              </span>
              <span className="text-[10px] text-[#707070]">
                Aplica selo comercial em azul elétrico (#0066ff)
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0066ff]"
            />
          </label>

          {/* ========================================================================= */}
          {/* SECTION: VINCULAR FUNÇÕES DA PLATAFORMA AO PLANO */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1 border-t border-[#f0f0f0]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span>Vincular Funções do Plano</span>
                </label>
                <span className="text-[10px] text-[#707070]">
                  Marque as funções que estarão disponíveis para assinantes deste plano:
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-[#0066ff]">
                {linkedFunctions.length} ativas
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {AVAILABLE_PLAN_FUNCTIONS.map((fn) => {
                const isLinked = linkedFunctions.includes(fn.id);
                return (
                  <label
                    key={fn.id}
                    className={`flex items-center justify-between p-2.5 rounded-[14px] border cursor-pointer transition-all ${
                      isLinked
                        ? 'bg-[#f0f6ff] border-[#0066ff]/30 text-[#141414]'
                        : 'bg-[#fafafa] border-[#e8e8e8] text-[#707070] hover:border-[#cccccc]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          isLinked ? 'bg-[#0066ff] text-white' : 'bg-[#e5e5e5] text-[#707070]'
                        }`}
                      >
                        {isLinked ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '·'}
                      </div>
                      <span className="text-xs font-semibold truncate">{fn.label}</span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={() => toggleFunction(fn.id)}
                      className="w-4 h-4 rounded accent-[#0066ff] flex-shrink-0"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom Feature Bullets */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold uppercase text-[#707070] block">
              Destaques descritivos (Itens do Card)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFeature();
                  }
                }}
                placeholder="Ex: Ficha veicular completa com placa"
                className="flex-1 h-9 px-3 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="h-9 px-3 rounded-full bg-[#141414] text-white text-xs font-bold hover:bg-[#262626]"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-[#f3f3f3] text-[#141414] text-[10px] font-medium flex items-center gap-1"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-[#adadad] hover:text-[#141414]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-[#f3f3f3] hover:bg-[#e0e0e0] text-[#141414] font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-full bg-[#141414] text-white font-semibold text-xs hover:bg-[#262626] transition-colors shadow-md"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
