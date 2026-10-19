// @ts-nocheck -- ported as-is from the original AI Studio project
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Check, SlidersHorizontal } from 'lucide-react';

interface PageFormatSelectorProps {
  currentLayout?: 'classic' | 'hero' | 'cinema';
  onChange?: (layout: 'classic' | 'hero' | 'cinema') => void;
  showSectionHeader?: boolean;
  onEditOverlay?: () => void;
}

export const PageFormatSelector: React.FC<PageFormatSelectorProps> = ({
  currentLayout,
  onChange,
  showSectionHeader = true,
  onEditOverlay,
}) => {
  const { profile, saveProfile, showToast } = useApp();
  const selectedLayout = currentLayout || profile.layout || 'classic';

  const handleSelect = (layout: 'classic' | 'hero' | 'cinema') => {
    saveProfile({ layout });
    if (onChange) {
      onChange(layout);
    }
    const names = {
      classic: 'Clássico',
      hero: 'Destaque',
      cinema: 'Cinema 9:16',
    };
    showToast(`Formato ${names[layout]} ativado! Head do perfil atualizado.`);
  };

  return (
    <div className="space-y-3">
      {showSectionHeader && (
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">Formato da página</h2>
          <span className="text-xs text-white/50">Como seu público visualiza</span>
        </div>
      )}

      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar" role="radiogroup">
        {/* Card Clássico */}
        <button
          type="button"
          onClick={() => handleSelect('classic')}
          className={`flex-shrink-0 w-[172px] p-2.5 rounded-[20px] bg-[#161616] border-2 text-left relative transition-all group ${
            selectedLayout === 'classic'
              ? 'border-white shadow-lg shadow-black/50'
              : 'border-white/[0.08] hover:border-white/[0.18]'
          }`}
          aria-checked={selectedLayout === 'classic'}
          role="radio"
        >
          {selectedLayout === 'classic' && (
            <>
              <span className="absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full bg-white text-black flex items-center justify-center z-10 shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              {onEditOverlay && <span onClick={(event) => { event.stopPropagation(); onEditOverlay(); }} className="absolute left-3.5 top-3.5 z-10 inline-flex min-h-6 items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 text-[9px] font-bold text-white"><SlidersHorizontal className="h-3 w-3" /> Overlay</span>}
            </>
          )}

          {/* Thumbnail Clássico */}
          <div className="h-[92px] rounded-xl bg-black relative overflow-hidden mb-3 flex-shrink-0 border border-white/10">
            <div
              className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black to-transparent pointer-events-none transition-all"
              style={{
                height: `${profile.layoutOverlays?.classic?.height ?? profile.coverOverlayHeight ?? 70}%`,
                opacity: (profile.layoutOverlays?.classic?.intensity ?? profile.coverOverlayIntensity ?? 50) / 100,
                transform: profile.layoutOverlays?.classic?.offsetDown ? `translateY(${profile.layoutOverlays.classic.offsetDown}%)` : undefined,
              }}
            />
            {/* Top gradient cover slice */}
            <div className="h-[46px] w-full bg-gradient-to-r from-[#00c2ff] via-[#0284c7] to-[#0f172a] opacity-90" />
            {/* Lateral avatar overlapping */}
            <div className="absolute left-2.5 top-[28px] w-6 h-6 rounded-full bg-[#262626] border-2 border-black flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              M
            </div>
            {/* Text lines */}
            <div className="absolute left-10 top-[34px] w-12 h-1.5 rounded-full bg-[#d8d8d8]" />
            <div className="absolute left-10 top-[42px] w-8 h-1.5 rounded-full bg-[#d8d8d8]/50" />
            <div className="absolute left-2.5 bottom-2 right-2.5 h-1 rounded-full bg-white/20" />
          </div>

          <b className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5 mb-1">
            <span>Clássico</span>
          </b>
          <small className="text-[11.5px] text-white/55 leading-[1.4] block">
            Foto lateral, dados rápidos e visual direto ao ponto
          </small>
        </button>

        {/* Card Destaque */}
        <button
          type="button"
          onClick={() => handleSelect('hero')}
          className={`flex-shrink-0 w-[172px] p-2.5 rounded-[20px] bg-[#161616] border-2 text-left relative transition-all group ${
            selectedLayout === 'hero'
              ? 'border-white shadow-lg shadow-black/50'
              : 'border-white/[0.08] hover:border-white/[0.18]'
          }`}
          aria-checked={selectedLayout === 'hero'}
          role="radio"
        >
          {selectedLayout === 'hero' && (
            <>
              <span className="absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full bg-white text-black flex items-center justify-center z-10 shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              {onEditOverlay && <span onClick={(event) => { event.stopPropagation(); onEditOverlay(); }} className="absolute left-3.5 top-3.5 z-10 inline-flex min-h-6 items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 text-[9px] font-bold text-white"><SlidersHorizontal className="h-3 w-3" /> Overlay</span>}
            </>
          )}

          {/* Thumbnail Destaque */}
          <div className="h-[92px] rounded-xl bg-black relative overflow-hidden mb-3 flex-shrink-0 border border-white/10 flex flex-col items-center">
            <div
              className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black to-transparent pointer-events-none transition-all"
              style={{
                height: `${profile.layoutOverlays?.hero?.height ?? profile.coverOverlayHeight ?? 70}%`,
                opacity: (profile.layoutOverlays?.hero?.intensity ?? profile.coverOverlayIntensity ?? 50) / 100,
                transform: profile.layoutOverlays?.hero?.offsetDown ? `translateY(${profile.layoutOverlays.hero.offsetDown}%)` : undefined,
              }}
            />
            {/* Top gradient cover slice */}
            <div className="h-[46px] w-full bg-gradient-to-r from-[#00c2ff] via-[#0284c7] to-[#0f172a] opacity-90" />
            {/* Centered avatar overlapping */}
            <div className="w-7 h-7 rounded-full bg-sky-500 border-2 border-black -mt-3.5 flex items-center justify-center text-[10px] font-extrabold text-white shadow-md z-10">
              M
            </div>
            {/* Centered text lines */}
            <div className="w-16 h-1.5 rounded-full bg-[#d8d8d8] mt-1.5" />
            <div className="w-10 h-1.5 rounded-full bg-[#d8d8d8]/50 mt-1" />
          </div>

          <b className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5 mb-1">
            <span>Destaque</span>
          </b>
          <small className="text-[11.5px] text-white/55 leading-[1.4] block">
            Avatar centralizado, selo e presença visual marcante
          </small>
        </button>

        {/* Card Cinema 9:16 */}
        <button
          type="button"
          onClick={() => handleSelect('cinema')}
          className={`flex-shrink-0 w-[172px] p-2.5 rounded-[20px] bg-[#161616] border-2 text-left relative transition-all group ${
            selectedLayout === 'cinema'
              ? 'border-white shadow-lg shadow-black/50'
              : 'border-white/[0.08] hover:border-white/[0.18]'
          }`}
          aria-checked={selectedLayout === 'cinema'}
          role="radio"
        >
          {selectedLayout === 'cinema' && (
            <>
              <span className="absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full bg-white text-black flex items-center justify-center z-10 shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              {onEditOverlay && <span onClick={(event) => { event.stopPropagation(); onEditOverlay(); }} className="absolute left-3.5 top-3.5 z-10 inline-flex min-h-6 items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 text-[9px] font-bold text-white"><SlidersHorizontal className="h-3 w-3" /> Overlay</span>}
            </>
          )}

          {/* Thumbnail Cinema 9:16 */}
          <div className="h-[92px] rounded-xl relative overflow-hidden mb-3 flex-shrink-0 border border-white/10 bg-gradient-to-b from-[#0a192f] via-[#050d1a] to-[#000000]">
            <div
              className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black to-transparent pointer-events-none transition-all"
              style={{
                height: `${profile.layoutOverlays?.cinema?.height ?? 35}%`,
                opacity: (profile.layoutOverlays?.cinema?.intensity ?? 20) / 100,
                transform: profile.layoutOverlays?.cinema?.offsetDown ? `translateY(${profile.layoutOverlays.cinema.offsetDown}%)` : 'translateY(15%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />
            {/* Bottom typography simulation */}
            <div className="absolute left-2.5 bottom-5 flex items-center gap-1">
              <div className="w-6 h-1.5 rounded-full bg-white/40" />
              <div className="w-12 h-1.5 rounded-full bg-white" />
            </div>
            <div className="absolute left-2.5 bottom-2.5 w-16 h-1 rounded-full bg-white/50" />
          </div>

          <b className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5 mb-1">
            <span>Cinema 9:16</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-500 text-white uppercase tracking-wider">
              NOVO
            </span>
          </b>
          <small className="text-[11.5px] text-white/55 leading-[1.4] block">
            Capa vertical com foto ou vídeo e títulos sobre a imagem
          </small>
        </button>
      </div>
    </div>
  );
};
