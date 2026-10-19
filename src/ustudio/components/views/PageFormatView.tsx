// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QRGen } from '../../utils/qrGen';
import { buildPix, absorbPayload, normKey } from '../../utils/pix';
import { PageFormatSelector } from '../common/PageFormatSelector';
import {
  ArrowLeft,
  Check,
  Pencil,
  Share2,
  ExternalLink,
  X,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

export const PageFormatView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { profile, saveProfile, showToast, services } = useApp();

  const [layout, setLayout] = useState<'classic' | 'hero' | 'cinema'>(profile.layout || 'classic');
  const [title, setTitle] = useState(profile.title || 'Meu Estúdio');
  const [sub, setSub] = useState(profile.sub || 'Transformando autoestima com tecnologia de ponta e acolhimento');
  const [place, setPlace] = useState(profile.place || 'Studio Marina Ravi');
  const [google, setGoogle] = useState(profile.google || 'https://share.google/OIdcey9tf11sD3lEz');
  const [googleOn, setGoogleOn] = useState(profile.googleOn ?? true);
  const [apiUrl, setApiUrl] = useState(profile.apiUrl || '');
  const [pixKey, setPixKey] = useState(profile.pixKey || 'tonyfilho911@gmail.com');
  const [pixName, setPixName] = useState(profile.pixName || 'Antonio Jose de Oliveira');
  const [pixCity, setPixCity] = useState(profile.pixCity || 'SAO PAULO');
  const [whats, setWhats] = useState(profile.whats || '(11) 90000-0000');
  const [insta, setInsta] = useState(profile.insta || '@marinaravi');
  const [email, setEmail] = useState(profile.email || 'contato@marinaravi.com.br');
  const [address, setAddress] = useState(profile.address || 'Av. Paulista, 1000 · Bela Vista, São Paulo — SP');
  const [cover, setCover] = useState(profile.cover || '');
  const [coverType, setCoverType] = useState<'image' | 'video'>(profile.coverType || 'image');
  const [avatar, setAvatar] = useState(profile.avatar || '');

  // Preview interactive state
  const [activeTab, setActiveTab] = useState<'servicos' | 'sobre' | 'avaliacoes' | 'pagamento' | 'contato'>('servicos');
  const [payAmount, setPayAmount] = useState('50,00');
  const [payValue, setPayValue] = useState(50);
  const [lastCode, setLastCode] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fileCoverRef = useRef<HTMLInputElement>(null);
  const fileAvatarRef = useRef<HTMLInputElement>(null);

  // Auto-absorb full Pix payload if pasted
  const handlePixKeyChange = (val: string) => {
    setPixKey(val);
    const absorbed = absorbPayload(val);
    if (absorbed) {
      if (absorbed.key) setPixKey(absorbed.key);
      if (absorbed.name) setPixName(absorbed.name);
      if (absorbed.city) setPixCity(absorbed.city);
      showToast('Chave Pix, nome e cidade extraídos do payload!');
    }
  };

  // Recalculate Pix QR
  useEffect(() => {
    if (payValue >= 1 && pixKey && pixName && pixCity) {
      try {
        const code = buildPix({
          key: pixKey,
          name: pixName,
          city: pixCity,
          amount: payValue,
        });
        setLastCode(code);
        setQrSvg(QRGen.svg(code));
      } catch {
        setLastCode('');
        setQrSvg('');
      }
    } else {
      setLastCode('');
      setQrSvg('');
    }
  }, [payValue, pixKey, pixName, pixCity]);

  const handlePayAmountChange = (val: string) => {
    const clean = val.replace(/\./g, ',').replace(/[^\d,]/g, '');
    const [int, dec] = clean.split(',');
    const limited = dec === undefined ? (int || '') : `${int || ''},${dec.slice(0, 2)}`;
    setPayAmount(limited);
    const num = parseFloat(limited.replace(',', '.')) || 0;
    setPayValue(num);
  };

  const handleQuickPay = (val: number) => {
    setPayValue(val);
    setPayAmount(val.toFixed(2).replace('.', ','));
  };

  const handleCopyPix = async () => {
    if (!lastCode) return;
    try {
      await navigator.clipboard.writeText(lastCode);
      showToast('Código Pix copia e cola copiado!');
    } catch {
      showToast('Selecione e copie o código');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) {
      showToast('Arquivo muito grande (máx. 25 MB)');
      return;
    }
    if (f.type.startsWith('video/')) {
      setCoverType('video');
      const reader = new FileReader(); reader.onload = () => setCover(String(reader.result)); reader.readAsDataURL(f);
    } else {
      setCoverType('image');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setCover(reader.result);
      };
      reader.readAsDataURL(f);
    }
    showToast('Capa atualizada');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      showToast('Imagem muito grande (máx. 8 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result);
    };
    reader.readAsDataURL(f);
    showToast('Foto de perfil atualizada');
  };

  const handleSaveAll = () => {
    saveProfile({
      layout,
      title,
      sub,
      place,
      google,
      googleOn,
      apiUrl,
      pixKey,
      pixName,
      pixCity,
      whats,
      insta,
      email,
      address,
      cover,
      coverType,
      avatar,
    });
    showToast(`Formato "${layout === 'classic' ? 'Clássico' : layout === 'hero' ? 'Destaque' : 'Cinema 9:16'}" salvo com sucesso!`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: sub, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link do estúdio copiado!');
      }
    } catch {}
  };

  // Cinema title formatting helper
  const renderCinemaTitle = () => {
    const parts = title.trim().split(/\s+/);
    if (parts.length < 2) return title;
    return (
      <>
        <span className="text-white/50">{parts[0]}</span> {parts.slice(1).join(' ')}
      </>
    );
  };

  const digitsWhats = whats.replace(/\D/g, '');
  const instaHandle = insta.replace(/^@/, '').trim();
  const whatsappUrl = digitsWhats ? `https://wa.me/${digitsWhats.length <= 11 ? '55' + digitsWhats : digitsWhats}` : '#';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar if navigated from inside */}
      {onBack && (
        <div className="flex items-center gap-3 px-5 pt-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-white">Formato da página pública</h2>
        </div>
      )}

      {/* SECTION 1: Formato da página */}
      <div className="px-5">
        <PageFormatSelector
          currentLayout={layout}
          onChange={(newLayout) => setLayout(newLayout)}
          showSectionHeader={true}
        />
      </div>

      {/* SECTION 2: Textos e Contato Editor Panel */}
      <div className="px-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-tight">Textos e contato</h2>
        </div>

        <div className="p-4 rounded-3xl bg-[#161616] border border-white/10 space-y-4 text-xs">
          {/* Titulo */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Título da página
            </h3>
            <label className="text-[10px] font-bold text-white/40 block mb-1">Título</label>
            <input
              type="text"
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-semibold focus:outline-none focus:border-white/30"
            />
            <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
              No formato Cinema, a primeira palavra fica em cinza suave e o restante em branco destacado.
            </p>

            <label className="text-[10px] font-bold text-white/40 block mt-3 mb-1">Subtítulo</label>
            <input
              type="text"
              maxLength={90}
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Avaliações no Google */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Avaliações no Google
            </h3>

            <label className="text-[10px] font-bold text-white/40 block mb-1">
              Nome do estabelecimento (aparece no mapa do modal)
            </label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Ex: Studio Marina Ravi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30 mb-2"
            />

            <label className="text-[10px] font-bold text-white/40 block mb-1">Link para avaliar</label>
            <input
              type="text"
              value={google}
              onChange={(e) => setGoogle(e.target.value)}
              placeholder="https://share.google/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30 mb-2"
            />

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={googleOn}
                onChange={(e) => setGoogleOn(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
              <span className="text-xs text-white/80 font-medium">
                Mostrar cartão de avaliações no topo da página
              </span>
            </label>
          </div>

<div className="border-t border-border pt-3 text-sm text-muted-foreground">InfinitePay e Pix por API · Em breve</div>

          {/* Pagamento Pix */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              Pagamento Pix
            </h3>
            <label className="text-[10px] font-bold text-white/40 block mb-1">Chave Pix</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30 mb-2"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1">
                  Nome do favorecido
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={pixName}
                  onChange={(e) => setPixName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1">Cidade</label>
                <input
                  type="text"
                  maxLength={15}
                  value={pixCity}
                  onChange={(e) => setPixCity(e.target.value.toUpperCase())}
                  placeholder="SAO PAULO"
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e1e] border border-white/10 text-white uppercase focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
              O código Pix é gerado com sua chave e o valor que a cliente digitar. Se colar um código Pix completo no campo, ele é lido automaticamente.
            </p>
          </div>

          {/* Contato */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Informações de Contato
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={whats}
                  onChange={(e) => setWhats(e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1">Instagram</label>
                <input
                  type="text"
                  value={insta}
                  onChange={(e) => setInsta(e.target.value)}
                  placeholder="@marinaravi"
                  className="w-full px-3 py-2 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <label className="text-[10px] font-bold text-white/40 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@exemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30 mb-2"
            />

            <label className="text-[10px] font-bold text-white/40 block mb-1">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número · Bairro, Cidade — UF"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Prévia Interativa em Tempo Real */}
      <div className="px-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-tight">Prévia</h2>
          <span className="text-xs font-semibold text-white/60">
            {layout === 'classic' ? 'Clássico' : layout === 'hero' ? 'Destaque' : 'Cinema 9:16'}
          </span>
        </div>

        {/* Outer Frame */}
        <div className="border border-white/15 rounded-[28px] overflow-hidden bg-black shadow-2xl relative">
          {/* CINE HERO */}
          <div className="relative">
            {/* Cover Area */}
            <div
              className={`relative overflow-hidden transition-all ${
                layout === 'cinema'
                  ? 'aspect-[9/16] max-h-[580px] w-full rounded-b-[34px] bg-gradient-to-b from-[#071630] via-[#0b192c] to-[#050505]'
                  : layout === 'hero'
                  ? 'h-[220px] bg-gradient-to-br from-[#00c2ff] via-[#0284c7] to-[#0f172a]'
                  : 'h-[160px] bg-gradient-to-br from-[#00c2ff] via-[#0284c7] to-[#0f172a]'
              }`}
            >
              {cover ? (
                coverType === 'video' ? (
                  <video
                    src={cover}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src={cover} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center font-extrabold text-[#ffa6c4] tracking-tighter opacity-80 select-none">
                  <span className="text-4xl">doce</span>
                  <span className="text-4xl text-black/30">favorito</span>
                </div>
              )}

              {/* Cover Dark & Gradient Overlays */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              <div
                className={`absolute inset-0 pointer-events-none ${
                  layout === 'cinema'
                    ? 'bg-gradient-to-b from-black/50 via-black/15 via-black/50 via-black/85 to-black'
                    : layout === 'hero'
                    ? 'bg-gradient-to-b from-black/30 via-transparent to-black/85'
                    : 'bg-gradient-to-b from-black/25 via-transparent to-black/75'
                }`}
              />
            </div>

            {/* Direct Edit Cover Chip */}
            <button
              type="button"
              onClick={() => fileCoverRef.current?.click()}
              className={`absolute z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-semibold hover:bg-black/80 transition-all ${
                layout === 'cinema'
                  ? 'top-3.5 left-3.5'
                  : layout === 'hero'
                  ? 'bottom-12 right-3.5'
                  : 'bottom-3 right-3.5'
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>Editar capa</span>
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Cinema Title (overlays image) */}
            {layout === 'cinema' && (
              <div className="absolute left-0 right-0 bottom-0 z-20 p-5 pointer-events-none">
                <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-2">
                  {renderCinemaTitle()}
                </h1>
                <p className="text-sm font-light text-white/90 max-w-[28ch] leading-relaxed">
                  {sub}
                </p>
              </div>
            )}
          </div>

          {/* PROFILE ROW (Hidden in Cinema mode) */}
          {layout !== 'cinema' && (
            <div className="px-4 relative z-30">
              {layout === 'hero' ? (
                <div className="w-full flex flex-col items-center justify-center text-center -mt-14">
                  {/* Avatar Button Centered */}
                  <button
                    type="button"
                    onClick={() => fileAvatarRef.current?.click()}
                    className="relative rounded-full bg-[#161616] border-4 border-black text-white font-extrabold flex items-center justify-center group flex-shrink-0 shadow-2xl w-24 h-24 text-3xl mx-auto"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>M</span>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                      <Pencil className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  </button>

                  {/* Profile Details Centered */}
                  <div className="w-full mt-3 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                      <span>{title}</span>
                      <span className="text-[#2f7dff]" title="Verificado">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.4-1 3.1 1 3.1-3 1.4-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.4 1-3.1-1-3.1 3-1.4.8-3.2 3.2.6z" />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke="#161616"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </h2>

                    <div className="flex items-center justify-center gap-2.5 text-xs text-white/50 mt-1 flex-wrap">
                      <span>{insta}</span>
                      <span>·</span>
                      <span>{services.length} serviços</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1.5 leading-relaxed max-w-xs mx-auto text-center">{sub}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[76px_1fr] gap-3.5 items-end -mt-9">
                  <button
                    type="button"
                    onClick={() => fileAvatarRef.current?.click()}
                    className="relative rounded-full bg-[#161616] border-4 border-black text-white font-extrabold flex items-center justify-center group flex-shrink-0 shadow-2xl w-20 h-20 text-2xl"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>M</span>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                      <Pencil className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  </button>

                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                      <span>{title}</span>
                    </h2>
                    <div className="flex gap-2.5 text-xs text-white/50 mt-0.5">
                      <span>{insta}</span>
                      <span>·</span>
                      <span>{services.length} serviços</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1 leading-snug">{sub}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOGLE REVIEWS CARD (if enabled) */}
          {googleOn && (
            <div className="px-4 mt-4">
              <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                      Avaliações no Google
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <span className="text-amber-400 tracking-wider">★★★★★</span>
                      <b className="text-white text-sm">5.0</b>
                      <span>(48 avaliações)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-xl text-center leading-tight">
                    Google<br />Verificado ✓
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Avalie nosso atendimento no Google
                  </h4>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Sua opinião é fundamental para mantermos a excelência nos tratamentos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Deixar avaliação no Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STOREFRONT TABS */}
          <div className="flex border-b border-white/10 px-4 mt-5 overflow-x-auto no-scrollbar">
            {[
              { id: 'servicos', label: 'Serviços' },
              { id: 'sobre', label: 'Sobre mim' },
              { id: 'avaliacoes', label: 'Avaliações' },
              { id: 'pagamento', label: 'Pagamento' },
              { id: 'contato', label: 'Contato' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-white border-white'
                    : 'text-white/40 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: SERVIÇOS */}
          {activeTab === 'servicos' && (
            <div className="p-4 space-y-2.5">
              {services.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <b className="text-xs font-bold text-white block truncate">{s.name}</b>
                    <small className="text-[11px] text-white/45 block">{s.duration}</small>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#262626] text-xs font-bold text-white flex-shrink-0">
                    {s.price}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SOBRE MIM */}
          {activeTab === 'sobre' && (
            <div className="p-4">
              <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 text-xs text-white/75 leading-relaxed space-y-3">
                <p>
                  Trabalho há mais de 8 anos com estética facial e corporal em São Paulo. Meu foco é
                  criar experiências de autocuidado personalizadas, sempre com escuta atenta e
                  cuidado técnico em cada procedimento.
                </p>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider pt-1">
                  Diferenciais e formação
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-white/10 text-white font-semibold text-[11px]">
                    ✓ Estética avançada
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-white/10 text-white font-semibold text-[11px]">
                    ✓ Biossegurança rigorosa
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-white/10 text-white font-semibold text-[11px]">
                    ✓ Protocolos personalizados
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-white/10 text-white font-semibold text-[11px]">
                    ✓ Cosméticos de alta performance
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVALIAÇÕES */}
          {activeTab === 'avaliacoes' && (
            <div className="p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex items-center gap-3.5">
                <span className="text-3xl font-extrabold text-white">5.0</span>
                <div>
                  <span className="text-amber-400 text-sm tracking-wider">★★★★★</span>
                  <small className="text-xs text-white/50 block">48 avaliações no Google</small>
                </div>
              </div>

              {/* Google Embed Map */}
              <div className="h-64 rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10 relative">
                <iframe
                  title="Estabelecimento no Google Maps"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(place || title)}&output=embed&hl=pt-BR`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <a
                href={google || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place || title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-transform active:scale-98"
              >
                <span>Escrever avaliação no Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* TAB 4: PAGAMENTO PIX */}
          {activeTab === 'pagamento' && (
            <div className="p-4">
              <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-white flex-shrink-0">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <b className="text-xs font-bold text-white block truncate">{pixName}</b>
                    <span className="text-[11px] text-white/50 block truncate">{pixKey}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    Quanto você quer pagar?
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1e1e1e] border border-white/10 focus-within:border-white/30">
                    <span className="text-sm font-bold text-white/40">R$</span>
                    <input
                      type="text"
                      value={payAmount}
                      onChange={(e) => handlePayAmountChange(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-transparent text-xl font-extrabold text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {[50, 100, 150, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleQuickPay(v)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        payValue === v
                          ? 'bg-white text-black'
                          : 'bg-[#1e1e1e] border border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>

                {/* Generated QR & Copia e Cola */}
                {qrSvg && (
                  <div className="pt-2 flex flex-col items-center gap-3">
                    <div
                      className="w-48 h-48 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                    <span className="text-xs text-white/60">
                      Total: <b className="text-white">R$ {payValue.toFixed(2).replace('.', ',')}</b>
                    </span>

                    <div className="w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                        Pix copia e cola
                      </span>
                      <div className="p-2.5 rounded-xl bg-[#1e1e1e] text-[10px] text-white/70 font-mono break-all max-h-20 overflow-y-auto mb-2 select-all">
                        {lastCode}
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="w-full py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-transform active:scale-98"
                        >
                          Copiar código Pix
                        </button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Enviar comprovante no WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CONTATO */}
          {activeTab === 'contato' && (
            <div className="p-4 space-y-3 text-xs">
              <div className="space-y-2">
                {whats && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex items-center justify-between text-white hover:bg-[#1e1e1e] transition-colors"
                  >
                    <div>
                      <b className="block font-bold">WhatsApp</b>
                      <span className="text-white/50">{whats}</span>
                    </div>
                    <span className="text-white/40">›</span>
                  </a>
                )}

                {instaHandle && (
                  <a
                    href={`https://instagram.com/${instaHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex items-center justify-between text-white hover:bg-[#1e1e1e] transition-colors"
                  >
                    <div>
                      <b className="block font-bold">Instagram</b>
                      <span className="text-white/50">@{instaHandle}</span>
                    </div>
                    <span className="text-white/40">›</span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex items-center justify-between text-white hover:bg-[#1e1e1e] transition-colors"
                  >
                    <div>
                      <b className="block font-bold">E-mail</b>
                      <span className="text-white/50">{email}</span>
                    </div>
                    <span className="text-white/40">›</span>
                  </a>
                )}

                {address && (
                  <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 text-white">
                    <b className="block font-bold mb-0.5">Endereço</b>
                    <span className="text-white/60 leading-relaxed block">{address}</span>
                  </div>
                )}
              </div>

              {/* Working Hours card */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-2">
                <div className="flex justify-between pb-1.5 border-b border-white/10">
                  <span className="text-white/60">Segunda a sexta</span>
                  <b className="text-white">09:00 – 18:00</b>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-white/10">
                  <span className="text-white/60">Sábado</span>
                  <b className="text-white">09:00 – 14:00</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Domingo</span>
                  <b className="text-white/40">Fechado</b>
                </div>
              </div>
            </div>
          )}

          {/* Prominent CTA */}
          <div className="p-4 pt-2">
            <button
              type="button"
              onClick={() => showToast('Abrindo fluxo de agendamento')}
              className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-98 transition-transform shadow-xl"
            >
              Agendar horário
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="px-5 pt-2">
        <button
          type="button"
          onClick={handleSaveAll}
          className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-98 transition-transform shadow-xl"
        >
          Salvar formato
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileCoverRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={fileAvatarRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* MODAL: AVALIAR NO GOOGLE */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h3 className="text-base font-bold text-white">Avaliar no Google</h3>
                <span className="text-xs text-white/50 block">{place || title}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-72 rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10 mb-4">
              <iframe
                title="Estabelecimento no Google Maps"
                src={`https://www.google.com/maps?q=${encodeURIComponent(place || title)}&output=embed&hl=pt-BR`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="space-y-2">
              <a
                href={google || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place || title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/90"
              >
                <span>Escrever avaliação no Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-full py-3 rounded-full bg-[#1e1e1e] text-white/70 text-xs font-semibold hover:text-white"
              >
                Agora não
              </button>
            </div>
            <p className="text-[11px] text-white/40 text-center mt-3 leading-relaxed">
              Para publicar a avaliação, o Google solicita login na sua conta Google.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
