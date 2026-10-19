// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import { X, Calendar, ShoppingCart, Trash2, ImagePlus } from 'lucide-react';



export const EditItemModal: React.FC = () => {
  const { editingService, setEditingService, categories, addCategory, services, saveService, deleteService, showToast } = useApp();

  const [name, setName] = useState('');
  const [cat, setCat] = useState('facial');
  const [duration, setDuration] = useState('45 min');
  const [price, setPrice] = useState('R$ 150');
  const [desc, setDesc] = useState('');
  const [badge, setBadge] = useState<string>('');
  const [type, setType] = useState<'servico' | 'produto'>('servico');
  const [selectedEmoji, setSelectedEmoji] = useState('💆');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editingService?.item) {
      const item = editingService.item;
      setName(item.name);
      setCat(item.cat);
      setDuration(item.duration);
      setPrice(item.price);
      setDesc(item.desc || '');
      setBadge(item.badge || '');
      setType(item.type || 'servico');
      setSelectedEmoji(item.emoji || '💆');
      setImageUrl(item.image || '');
    } else {
      setName('');
      setCat('facial');
      setDuration('45 min');
      setPrice('R$ 120');
      setDesc('');
      setBadge('');
      setType(editingService?.defaultType || 'servico');
      setSelectedEmoji('💆');
      setImageUrl('');
    }
  }, [editingService]);

  if (!editingService) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const id = editingService.item ? editingService.item.id : 's_' + Date.now().toString(36);

    const updatedItem: ServiceItem = {
      id,
      name: name.trim(),
      cat,
      duration: duration.trim() || '30 min',
      price: price.trim().startsWith('R$') ? price.trim() : `R$ ${price.trim()}`,
      desc: desc.trim(),
      badge: badge.trim() || null,
      type,
      emoji: undefined,
      image: imageUrl.trim() || undefined,
    };

    saveService(updatedItem);
  };

  const currentCategory = categories.find((c) => c.key === cat) || categories[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setEditingService(null)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">
            {editingService.isNew ? 'Novo item' : 'Editar item'}
          </h3>
          <button
            onClick={() => setEditingService(null)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Preview */}
        <div
          className="h-28 rounded-2xl flex items-center justify-center text-5xl mb-3 shadow-inner relative overflow-hidden"
          style={{
            background: imageUrl
              ? `url('${imageUrl}') center/cover no-repeat`
              : `linear-gradient(135deg, ${currentCategory.soft} 0%, rgba(22,22,22,0.9) 100%)`,
          }}
        >
          {!imageUrl && <ImagePlus className="h-8 w-8 text-muted-foreground" />}
          {badge && (
            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00c2ff] text-black">
              {badge}
            </span>
          )}
        </div>

        <label className="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border p-3 text-sm text-foreground">
          <ImagePlus className="h-4 w-4" /> Enviar foto
          <input type="file" accept="image/*" className="hidden" onChange={event => {
            const file = event.target.files?.[0]; if (!file) return;
            if (file.size > 2 * 1024 * 1024) return showToast('Escolha uma foto de até 2 MB.');
            const reader = new FileReader(); reader.onload = () => setImageUrl(String(reader.result)); reader.readAsDataURL(file);
          }} />
        </label>
        {/* Form Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Link da foto (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Nome do serviço ou produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Limpeza de pele profunda"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/40 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Categoria
              </label>
              <select
                value={cat}
                onChange={(e) => {
                  if (e.target.value === '__new') { const label = window.prompt('Nome da nova categoria'); if (label?.trim()) setCat(addCategory(label)); }
                  else setCat(e.target.value);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/40"
              >
                <option value="__new">+ Criar categoria</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Duração ou Prazo
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 50 min"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/40"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Preço
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: R$ 180"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/40 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Destaque / Selo
              </label>
              <input value={badge} onChange={e => setBadge(e.target.value)} list="studio-badges" placeholder="Escolher ou criar selo" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-foreground" />
              <datalist id="studio-badges">{Array.from(new Set(['Mais pedido', 'Novo', 'Favorito', ...services.map(s => s.badge).filter(Boolean)])).map(value => <option key={value} value={value} />)}</datalist>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Descrição
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descreva benefícios, etapas e indicações..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/40 resize-none"
            />
          </div>

          {/* Link Type Toggle */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              Vincular item a
            </label>
            <div className="p-1 bg-[#1e1e1e] rounded-full flex gap-1">
              <button
                type="button"
                onClick={() => setType('servico')}
                className={`flex-1 py-2 rounded-full font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'servico' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agenda (Serviço)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('produto')}
                className={`flex-1 py-2 rounded-full font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                  type === 'produto' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Reserva (Produto)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-5 border-t border-white/10 mt-4">
          {!editingService.isNew && editingService.item && (
            <button
              type="button"
              onClick={() => deleteService(editingService.item?.id)}
              className="w-11 h-11 rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-900/50 transition-colors flex-shrink-0"
              title="Excluir item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setEditingService(null)}
            className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/80 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors disabled:opacity-50"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
};
