// @ts-nocheck -- ported app uses browser-only state
import React, { useRef, useState } from 'react';
import {
  ChevronRight,
  Image,
  LockKeyhole,
  Play,
  Upload,
  X,
  Link as LinkIcon,
  HardDrive,
  CheckCircle2,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Trash2,
  Phone,
  MessageCircle,
  Plus,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_GALLERY_ITEMS } from '../../data/initialData';

type Editor = 'banners' | 'videos' | 'gallery' | 'floating-contact' | null;

const PositionSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#0d0d0d] p-1 border border-white/5">
    {[
      ['above-tabs', 'Acima das abas'],
      ['between-categories', 'Entre categorias'],
      ['below-categories', 'Abaixo categorias'],
    ].map(([option, label]) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`min-h-9 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
          value === option ? 'bg-white text-black font-bold shadow-sm' : 'text-white/50 hover:text-white'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const UpgradeBadge = ({ price = '7,90', label = 'mês' }: { price?: string; label?: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
    <LockKeyhole className="h-3 w-3" /> R$ {price}/{label}
  </span>
);

export const PublicPagePreferences: React.FC = () => {
  const { profile, saveProfile, setIsBannerModalOpen, showToast } = useApp();
  const [editor, setEditor] = useState<Editor>(null);

  // Video states
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [showUrlAdd, setShowUrlAdd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videos = profile.promoVideos || [];

  // Gallery states
  const galleryItems = profile.galleryItems && profile.galleryItems.length > 0
    ? profile.galleryItems
    : INITIAL_GALLERY_ITEMS;
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [showAddMediaForm, setShowAddMediaForm] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Floating contact states
  const [whatsNumber, setWhatsNumber] = useState(profile.whats || '(11) 90000-0000');
  const [callNumber, setCallNumber] = useState(profile.phoneCallNumber || profile.whats || '(19) 99821-4321');
  const isFloatingBarActive = profile.floatingContactBar !== false;

  // Standard memory limit per video: 15 MB
  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const addVideos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 6 - videos.length));
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      showToast('O vídeo excede o tamanho padrão de memória de 15 MB. Envie um arquivo menor ou use Link de Vídeo.');
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
            reader.onload = () =>
              resolve({
                id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                url: reader.result,
                name: file.name,
                sizeDisplay: `${sizeInMB} MB`,
              });
            reader.readAsDataURL(file);
          })
      )
    ).then((items) => {
      saveProfile({ promoVideos: [...videos, ...items] });
      showToast(`${items.length} vídeo(s) adicionado(s) com reprodução automática!`);
    });
  };

  const handleAddVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = videoUrlInput.trim();
    if (!url) return;
    if (videos.length >= 6) {
      showToast('Limite de 6 vídeos atingido no carrossel.');
      return;
    }

    const newVideo = {
      id: `v_url_${Date.now()}`,
      url: url,
      name: `Vídeo Web ${videos.length + 1}`,
      sizeDisplay: 'Nuvem (0 KB local)',
    };

    saveProfile({ promoVideos: [...videos, newVideo] });
    setVideoUrlInput('');
    setShowUrlAdd(false);
    showToast('Vídeo adicionado ao carrossel com autoplay!');
  };

  // Reorder Gallery Item
  const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...galleryItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    saveProfile({ galleryItems: newItems });
    showToast(`Ordem da mídia atualizada (Posição ${targetIndex + 1})`);
  };

  // Remove Gallery Item
  const removeGalleryItem = (id: string) => {
    const updated = galleryItems.filter((item) => item.id !== id);
    saveProfile({ galleryItems: updated });
    showToast('Mídia removida da galeria.');
  };

  // Add Gallery Media via File
  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.onload = () => {
      const newItem = {
        id: `gal_${Date.now()}`,
        url: reader.result as string,
        type: isVideo ? ('video' as const) : ('image' as const),
        title: file.name.replace(/\.[^/.]+$/, ''),
      };
      saveProfile({ galleryItems: [...galleryItems, newItem] });
      showToast('Nova mídia adicionada à galeria 3x9!');
    };
    reader.readAsDataURL(file);
  };

  // Add Gallery Media via URL
  const handleAddGalleryUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const newItem = {
      id: `gal_${Date.now()}`,
      url: newMediaUrl.trim(),
      type: newMediaType,
      title: newMediaTitle.trim() || `Mídia ${galleryItems.length + 1}`,
    };

    saveProfile({ galleryItems: [...galleryItems, newItem] });
    setNewMediaUrl('');
    setNewMediaTitle('');
    setShowAddMediaForm(false);
    showToast('Mídia adicionada com sucesso!');
  };

  // Restore Default Gallery
  const handleRestoreDefaultGallery = () => {
    saveProfile({ galleryItems: INITIAL_GALLERY_ITEMS });
    showToast('Galeria restaurada com 9 fotos padrão!');
  };

  // Save Floating Bar Settings
  const handleSaveFloatingSettings = () => {
    saveProfile({
      whats: whatsNumber,
      phoneCallNumber: callNumber,
      floatingContactBar: isFloatingBarActive,
    });
    showToast('Configurações do botão flutuante salvas!');
    setEditor(null);
  };

  const cards = [
    {
      id: 'banners',
      title: 'Banners promocionais',
      detail: 'Imagem, texto e posição individual',
      icon: Image,
      premium: true,
      price: '4,90',
    },
    {
      id: 'videos',
      title: 'Carrossel de vídeos',
      detail: `${videos.length} de 6 vídeos · autoplay automático e escolha de posição`,
      icon: Play,
      premium: true,
      price: '7,90',
    },
    {
      id: 'gallery',
      title: 'Personalizar galeria (Grid 3x9)',
      detail: `${galleryItems.length} mídias · grade 3x9 avulsa, reordenação e fotos`,
      icon: LayoutGrid,
      premium: true,
      price: '5,90',
    },
    {
      id: 'floating-contact',
      title: 'Botão flutuante WhatsApp & Ligar',
      detail: isFloatingBarActive
        ? 'Ativo na tab de serviços · barra 400px com ligar 40x40px'
        : 'Desativado (toque para configurar e ativar)',
      icon: MessageCircle,
      premium: false,
    },
  ];

  return (
    <section className="px-5 space-y-2.5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold text-white">Personalizar página pública</h3>
        <span className="text-xs text-white/40">Toque para editar</span>
      </div>

      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              if (card.id === 'banners') {
                setIsBannerModalOpen(true);
              } else {
                setEditor(card.id as Editor);
              }
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-[#141414] p-3.5 text-left hover:border-white/15 hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/70">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <b className="truncate text-xs text-white">{card.title}</b>
                {card.premium && <UpgradeBadge price={card.price} />}
                {card.id === 'floating-contact' && isFloatingBarActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                    Ativo
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-white/45">{card.detail}</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-white/20" />
          </button>
        );
      })}

      {editor && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setEditor(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl border border-white/15 bg-[#161616] p-5 sm:rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            {/* ========================================================================= */}
            {/* 1. EDITOR: CARROSSEL DE VÍDEOS COM AUTOPLAY E POSIÇÃO */}
            {/* ========================================================================= */}
            {editor === 'videos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-white">Carrossel de vídeos</h3>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      Reprodução automática contínua · formato vertical 9:16
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    aria-label="Fechar"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Standard Memory Spec Box */}
                <div className="p-3 rounded-2xl bg-[#1c1c1c] border border-white/10 flex items-start gap-2.5">
                  <HardDrive className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <b className="text-white block font-semibold">Reprodução automática contínua (Autoplay)</b>
                    <span className="text-white/50">
                      Os vídeos iniciam automaticamente na vitrine pública. Limite de até 15 MB por arquivo local ou links diretos de nuvem.
                    </span>
                  </div>
                </div>

                {/* Videos Horizontal Preview Carousel */}
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2">
                  {videos.length ? (
                    videos.map((video) => (
                      <div
                        key={video.id}
                        className="relative h-[290px] w-[170px] flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-md group"
                      >
                        <video
                          src={video.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => saveProfile({ promoVideos: videos.filter((item) => item.id !== video.id) })}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors shadow-md"
                          title="Remover vídeo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        {video.sizeDisplay && (
                          <span className="absolute left-2 bottom-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-white/80 border border-white/10">
                            {video.sizeDisplay}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[240px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-[#0d0d0d] text-white/35">
                      <Play className="h-8 w-8 text-white/20" />
                      <span className="text-xs font-medium">Nenhum vídeo adicionado</span>
                      <span className="text-[10px] text-white/40">Padrão vertical 9:16 (200 × 355 px)</span>
                    </div>
                  )}
                </div>

                {/* Video Carousel Position Selector (Acima das abas / Entre as categorias / Abaixo das categorias) */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
                    Posição na página pública (entre categorias disponível)
                  </label>
                  <PositionSelector
                    value={profile.videoCarouselPosition || 'below-categories'}
                    onChange={(videoCarouselPosition) => {
                      saveProfile({ videoCarouselPosition });
                      showToast(`Posição atualizada: ${videoCarouselPosition}`);
                    }}
                  />
                </div>

                {/* Action Buttons: Upload or URL Link */}
                <div className="space-y-2 pt-1">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    multiple
                    className="hidden"
                    onChange={addVideos}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-black hover:bg-white/90 transition-all shadow-md active:scale-95"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Enviar arquivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlAdd(!showUrlAdd)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#222] border border-white/10 py-2.5 text-xs font-bold text-white hover:bg-[#2c2c2c] transition-all active:scale-95"
                    >
                      <LinkIcon className="h-3.5 w-3.5 text-sky-400" />
                      <span>Link de vídeo</span>
                    </button>
                  </div>

                  {showUrlAdd && (
                    <form onSubmit={handleAddVideoUrl} className="p-3 rounded-2xl bg-[#1e1e1e] border border-white/10 space-y-2 mt-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                        URL do Vídeo (MP4, Cloud ou Web)
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/meu-video.mp4"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-sky-500/50"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUrlAdd(false)}
                          className="flex-1 py-1.5 rounded-lg bg-[#282828] text-white/60 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!videoUrlInput.trim()}
                          className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold disabled:opacity-40"
                        >
                          Adicionar link
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. EDITOR: PERSONALIZAR GALERIA GRID 3X9 (AVULSA POR R$ 5,90) */}
            {/* ========================================================================= */}
            {editor === 'gallery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Personalizar Galeria</h3>
                      <UpgradeBadge price="5,90" label="mês avulso" />
                    </div>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      Grid 3x9 · configure fotos, vídeos e reordene a exibição pública
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    aria-label="Fechar"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Enable / Disable Gallery Toggle */}
                <div className="p-3.5 rounded-2xl bg-[#1c1c1c] border border-white/10 flex items-center justify-between">
                  <div>
                    <b className="text-xs font-bold text-white block">Exibir aba de Galeria no perfil público</b>
                    <span className="text-[11px] text-white/50">
                      Disponibiliza a aba 'Galeria' aos clientes com o grid 3x9
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = profile.galleryEnabled === false ? true : false;
                      saveProfile({ galleryEnabled: updated });
                      showToast(updated ? 'Aba Galeria ativada no perfil público!' : 'Aba Galeria desativada.');
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      profile.galleryEnabled !== false ? 'bg-[#0066ff]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        profile.galleryEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reordering & Media Grid Notice */}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="font-semibold text-white/80">
                    Mídias na grade ({galleryItems.length} de 27 slots do grid 3x9)
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreDefaultGallery}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Restaurar padrão
                  </button>
                </div>

                {/* Gallery Items List with Reorder buttons */}
                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {galleryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>

                        <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={item.title || ''}
                            placeholder="Legenda da foto..."
                            onChange={(e) => {
                              const updated = [...galleryItems];
                              updated[index] = { ...updated[index], title: e.target.value };
                              saveProfile({ galleryItems: updated });
                            }}
                            className="bg-transparent text-xs font-semibold text-white truncate w-full outline-none focus:border-b border-sky-400/50"
                          />
                          <span className="text-[10px] text-white/40 block mt-0.5">
                            {item.type === 'video' ? 'Vídeo 9:16' : 'Foto'} · Posição #{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Reorder Buttons & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveGalleryItem(index, 'up')}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 flex items-center justify-center"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === galleryItems.length - 1}
                          onClick={() => moveGalleryItem(index, 'down')}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 flex items-center justify-center"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(item.id)}
                          className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center"
                          title="Excluir da galeria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Media Action Buttons */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleGalleryFileUpload}
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-black hover:bg-white/90 transition-all shadow-md active:scale-95"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Foto/Vídeo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddMediaForm(!showAddMediaForm)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#222] border border-white/10 py-2.5 text-xs font-bold text-white hover:bg-[#2c2c2c] transition-all active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5 text-sky-400" />
                    <span>Adicionar por URL</span>
                  </button>
                </div>

                {showAddMediaForm && (
                  <form onSubmit={handleAddGalleryUrl} className="p-3 rounded-2xl bg-[#1e1e1e] border border-white/10 space-y-2 mt-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewMediaType('image')}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold ${newMediaType === 'image' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/50'}`}
                      >
                        Foto (Imagem)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewMediaType('video')}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold ${newMediaType === 'video' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/50'}`}
                      >
                        Vídeo
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... ou URL do vídeo"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-sky-500/50"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Título / Legenda (opcional)"
                      value={newMediaTitle}
                      onChange={(e) => setNewMediaTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-sky-500/50"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMediaForm(false)}
                        className="flex-1 py-1.5 rounded-lg bg-[#282828] text-white/60 text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold"
                      >
                        Salvar na grade 3x9
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. EDITOR: BOTÃO FLUTUANTE DE WHATSAPP + LIGAR */}
            {/* ========================================================================= */}
            {editor === 'floating-contact' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-white">Botão Flutuante de Contato</h3>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      Botão WhatsApp + Ligar na tab de serviços do perfil público
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    aria-label="Fechar"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Toggle Switch */}
                <div className="p-3.5 rounded-2xl bg-[#1c1c1c] border border-white/10 flex items-center justify-between">
                  <div>
                    <b className="text-xs font-bold text-white block">Ativar botão flutuante na tab de serviços</b>
                    <span className="text-[11px] text-white/50">
                      Exibe a barra fixa com botão WhatsApp e discador telefônico
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = !isFloatingBarActive;
                      saveProfile({ floatingContactBar: updated });
                      showToast(updated ? 'Botão flutuante ativado!' : 'Botão flutuante desativado.');
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isFloatingBarActive ? 'bg-[#25D366]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isFloatingBarActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Phone & WhatsApp Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                      WhatsApp para mensagem direta
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121212] border border-white/10">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <input
                        type="text"
                        value={whatsNumber}
                        onChange={(e) => setWhatsNumber(e.target.value)}
                        placeholder="(11) 90000-0000"
                        className="w-full bg-transparent text-xs text-white outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                      Telefone para ligação direta (Ícone de ligar 40x40px)
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121212] border border-white/10">
                      <Phone className="w-4 h-4 text-sky-400" />
                      <input
                        type="text"
                        value={callNumber}
                        onChange={(e) => setCallNumber(e.target.value)}
                        placeholder="(19) 99821-4321"
                        className="w-full bg-transparent text-xs text-white outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Preview Box according to exact spec: 15px height / padding, 5px border, 400px width, 40x40px call icon */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
                    Pré-visualização do componente flutuante (largura 400px · ícone 40x40px)
                  </label>
                  <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 flex justify-center">
                    <div
                      className="w-full max-w-[400px] rounded-[24px] border-[5px] border-white/10 bg-[#161616] p-2 flex items-center justify-between gap-3 shadow-xl"
                      style={{ minHeight: '56px' }}
                    >
                      {/* WhatsApp Button */}
                      <div className="flex-1 h-[42px] px-4 rounded-2xl bg-[#25D366] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chamar no WhatsApp</span>
                      </div>

                      {/* Call Icon Button: exact 40x40px */}
                      <div
                        className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-2xl bg-white text-black flex items-center justify-center shadow-md"
                        title="Ligar agora (40x40px)"
                      >
                        <Phone className="w-5 h-5 fill-black" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 text-center mt-2 leading-relaxed">
                    O componente flutuará suavemente na parte inferior da aba de serviços no perfil público.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFloatingSettings}
                    className="w-full py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    Salvar configurações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
