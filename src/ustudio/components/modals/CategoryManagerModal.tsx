import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Tag,
  Scissors,
  Sparkles,
  Package,
  Layers,
  FolderPlus,
  Car,
} from 'lucide-react';

const EMOJI_OPTIONS = ['✂️', '💈', '🚗', '✨', '💆', '🎁', '⚡', '🪒', '🧴', '🧼', '👔', '👑'];

export const CategoryManagerModal: React.FC = () => {
  const {
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    services,
    showToast,
  } = useApp();

  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');
  const [newType, setNewType] = useState<'servico' | 'produto' | 'ambos'>('ambos');

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editType, setEditType] = useState<'servico' | 'produto' | 'ambos'>('ambos');

  if (!isCategoryModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      showToast('Digite o nome da categoria');
      return;
    }

    const key = addCategory(newLabel.trim(), 'Scissors', newEmoji, newType);
    showToast(`Categoria "${newLabel.trim()}" criada com sucesso!`);
    setNewLabel('');
  };

  const startEdit = (cat: Category) => {
    setEditingKey(cat.key);
    setEditLabel(cat.label);
    setEditEmoji(cat.emoji || '✂️');
    setEditType(cat.type || 'ambos');
  };

  const handleSaveEdit = (key: string) => {
    if (!editLabel.trim()) {
      showToast('O nome da categoria não pode ficar vazio');
      return;
    }

    updateCategory(key, {
      label: editLabel.trim(),
      emoji: editEmoji,
      type: editType,
    });

    setEditingKey(null);
    showToast('Categoria atualizada!');
  };

  const handleDelete = (key: string, label: string) => {
    const count = services.filter((s) => s.cat === key).length;
    if (count > 0) {
      if (
        !confirm(
          `A categoria "${label}" possui ${count} item(ns) associado(s). Tem certeza que deseja excluí-la?`
        )
      ) {
        return;
      }
    }
    deleteCategory(key);
    showToast(`Categoria "${label}" removida`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsCategoryModalOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[88vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#00c2ff]" />
            <h3 className="text-base font-bold text-white">
              Criar & Editar Categorias
            </h3>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Category Form */}
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-2xl bg-[#1c1c1c] border border-white/10 mb-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-[#00c2ff]" />
              Nova Categoria
            </span>
            <span className="text-[10px] text-white/40">Serviços e Produtos</span>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-12 h-10 rounded-xl bg-[#282828] border border-white/15 text-center text-base cursor-pointer focus:outline-none"
              >
                {EMOJI_OPTIONS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Barba & Cabelo, Acessórios..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#282828] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00c2ff]"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-white/45 text-[10px] mr-1">Tipo:</span>
              <button
                type="button"
                onClick={() => setNewType('ambos')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  newType === 'ambos'
                    ? 'bg-white text-black'
                    : 'bg-[#262626] text-white/60 hover:text-white'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setNewType('servico')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  newType === 'servico'
                    ? 'bg-[#00c2ff] text-black'
                    : 'bg-[#262626] text-white/60 hover:text-white'
                }`}
              >
                Serviço
              </button>
              <button
                type="button"
                onClick={() => setNewType('produto')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  newType === 'produto'
                    ? 'bg-[#ffb020] text-black'
                    : 'bg-[#262626] text-white/60 hover:text-white'
                }`}
              >
                Produto
              </button>
            </div>

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white/70">
              Categorias Cadastradas ({categories.length})
            </span>
            <span className="text-[10px] text-white/40">
              Edite ou exclua conforme necessário
            </span>
          </div>

          {categories.map((cat) => {
            const itemCount = services.filter((s) => s.cat === cat.key).length;
            const isEditing = editingKey === cat.key;

            if (isEditing) {
              return (
                <div
                  key={cat.key}
                  className="p-3 rounded-2xl bg-[#222222] border border-[#00c2ff]/40 space-y-2.5 animate-in fade-in duration-150"
                >
                  <div className="flex gap-2">
                    <select
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                      className="w-11 h-9 rounded-lg bg-[#2e2e2e] border border-white/20 text-center text-sm"
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#2e2e2e] border border-white/20 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setEditType('ambos')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          editType === 'ambos' ? 'bg-white text-black' : 'bg-black/30 text-white/50'
                        }`}
                      >
                        Ambos
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType('servico')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          editType === 'servico' ? 'bg-[#00c2ff] text-black' : 'bg-black/30 text-white/50'
                        }`}
                      >
                        Serviço
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType('produto')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          editType === 'produto' ? 'bg-[#ffb020] text-black' : 'bg-black/30 text-white/50'
                        }`}
                      >
                        Produto
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="px-2.5 py-1 rounded-lg bg-[#2e2e2e] text-white/70 text-[11px] font-medium hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.key)}
                        className="px-3 py-1 rounded-lg bg-[#00c2ff] text-black text-[11px] font-bold hover:bg-[#00c2ff]/90 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.key}
                className="p-3 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm flex-shrink-0">
                    {cat.emoji || '✨'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">
                        {cat.label}
                      </span>
                      {cat.type && cat.type !== 'ambos' && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wide ${
                            cat.type === 'produto'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {cat.type}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      {itemCount} {itemCount === 1 ? 'item vinculado' : 'itens vinculados'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                    title="Editar categoria"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.key, cat.label)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 flex items-center justify-center transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
