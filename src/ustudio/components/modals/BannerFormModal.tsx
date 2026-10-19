// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Megaphone, ImagePlus, Trash2 } from 'lucide-react';

const BANNER_EMOJIS = ['🎁', '📅', '🔥', '✨', '🌸', '⚡', '👑', '🎉'];

export const BannerFormModal: React.FC = () => {
  const { isBannerModalOpen, setIsBannerModalOpen, addBanner, categories, banners, updateBanner, removeBanner } = useApp();

  const [kicker, setKicker] = useState('Promoção');
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [image, setImage] = useState('');
  const [position, setPosition] = useState<string>('above-tabs');
  const imageRef = useRef<HTMLInputElement>(null);

  if (!isBannerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !title.trim()) return;

    addBanner({
      kicker: image ? '' : kicker.trim(),
      title: title.trim(),
      sub: sub.trim(),
      emoji,
      image,
      position,
    });

    setTitle('');
    setSub('');
    setImage('');
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && setImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setIsBannerModalOpen(false)}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] overflow-y-auto bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#ffb020]" />
            <h3 className="text-base font-bold text-white">Banners · R$ 4,90/mês</h3>
          </div>
          <button
            onClick={() => setIsBannerModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <button type="button" onClick={() => imageRef.current?.click()} className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#1e1e1e] text-white/55">
              {image ? <><img src={image} alt="Prévia do banner" className="h-full w-full object-cover" /><span onClick={(e) => { e.stopPropagation(); setImage(''); }} className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white">Remover</span></> : <span className="flex items-center gap-2 font-semibold"><ImagePlus className="h-4 w-4" /> Enviar imagem do banner</span>}
            </button>
            <span className="mt-1 block text-[10px] text-white/35">JPG, PNG ou WebP · até 4 MB</span>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Posição deste banner</label>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#1e1e1e] p-1">
              {[['above-tabs', 'Acima das abas'], ['below-categories', 'Abaixo das categorias'], ...categories.map(cat => ['after:' + cat.key, 'Após ' + cat.label])].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setPosition(value as any)} className={`rounded-lg px-2 py-2 text-[10px] font-semibold ${position === value ? 'bg-white text-black' : 'text-white/50'}`}>{label}</button>
              ))}
            </div>
          </div>

          {image ? <p className="text-[10px] text-white/40">Com imagem, título, subtítulo e ícone não são necessários.</p> : <>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Selo pequeno
            </label>
            <input
              type="text"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder="Ex: Promoção, Novidade"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Título do anúncio
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 20% off em Limpeza de pele"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-semibold focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Subtítulo / Regra
            </label>
            <input
              type="text"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              placeholder="Ex: Válido até domingo ou enquanto durarem os horários"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              Ícone / Emoji
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {BANNER_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${
                    emoji === em
                      ? 'bg-white text-black shadow-md scale-110'
                      : 'bg-[#1e1e1e] border border-white/10 text-white/70 hover:bg-[#262626]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          </>}

          <div className="flex gap-2 pt-4 border-t border-white/10 mt-4">
            <button
              type="button"
              onClick={() => setIsBannerModalOpen(false)}
              className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!image && !title.trim()}
              className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors disabled:opacity-50"
            >
              Adicionar banner
            </button>
          </div>
        </form>

        {banners.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Banners adicionados</span>
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-xl border border-white/10 bg-[#1e1e1e] p-3">
                <div className="mb-2 flex items-center gap-2">
                  {banner.image ? <img src={banner.image} alt="" className="h-10 w-12 rounded-lg object-cover" /> : <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-white/5">{banner.emoji}</span>}
                  <b className="min-w-0 flex-1 truncate text-xs text-white">{banner.title || 'Banner com imagem'}</b>
                  <button type="button" onClick={() => removeBanner(banner.id)} aria-label="Remover banner" className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <select value={banner.position || 'above-tabs'} onChange={(event) => updateBanner({ ...banner, position: event.target.value as any })} className="w-full rounded-lg border border-white/10 bg-[#141414] px-2 py-2 text-[11px] text-white">
                  <option value="above-tabs">Acima das abas</option>
                  <option value="below-categories">Abaixo das categorias</option>
                  {categories.map(cat => <option key={cat.key} value={"after:" + cat.key}>Após {cat.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
