// @ts-nocheck -- ported as-is from the original AI Studio project
import { availableSlots, durationMinutes, localDate } from '../../utils/availability';
import { safeLink, mapEmbed } from '../../utils/contactLinks';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import { QRGen } from '../../utils/qrGen';
import { buildPix, normKey } from '../../utils/pix';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  X,
  CheckCircle2,
  Zap,
  MapPin,
  Phone,
  Mail,
  AtSign,
  ImageIcon,
  MessageCircle,
  LayoutGrid,
  Play,
  Wrench,
  HardHat,
  Maximize2,
} from 'lucide-react';
import { CIVIL_CONSTRUCTION_SERVICES, INITIAL_GALLERY_ITEMS } from '../../data/initialData';

const DOWS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const PublicStorefront: React.FC = () => {
  const {
    profile,
    services, workingHours, bookingSettings, daySchedule,
    setIsStorefrontOpen,
    addClientBooking,
    openCongratulations,
    showToast,
  } = useApp();

  const layout = profile.layout || 'classic';

  const getOverlayForLayout = (fmt: 'classic' | 'hero' | 'cinema') => {
    const custom = profile.layoutOverlays?.[fmt];
    if (custom) return custom;
    if (fmt === 'cinema') return { height: 35, intensity: 20, offsetDown: 20 };
    return {
      height: profile.coverOverlayHeight ?? 70,
      intensity: profile.coverOverlayIntensity ?? 50,
      offsetDown: 0,
    };
  };

  const activeOverlay = getOverlayForLayout(layout);
  const title = profile.title || profile.name || 'Meu Estúdio';
  const sub = profile.sub || profile.bio || 'Transformando autoestima com tecnologia de ponta e acolhimento';
  const place = profile.place || title;
  const google = profile.google || 'https://share.google/OIdcey9tf11sD3lEz';
  const googleOn = profile.googleOn ?? true;
  const whats = safeLink(profile.whats || '');
  const insta = safeLink(profile.insta || '');
  const email = profile.email || 'contato@marinaravi.com.br';
  const address = safeLink(profile.address || '');
  const pixKey = profile.pixKey || 'tonyfilho911@gmail.com';
  const pixName = profile.pixName || 'Antonio Jose de Oliveira';
  const pixCity = profile.pixCity || 'SAO PAULO';
  const cover = profile.cover || '';
  const coverType = profile.coverType || 'image';
  const avatar = profile.avatar || '';
  const serviceDisplay = profile.serviceDisplay || 'list';
  const { banners, categories = [] } = useApp();
  const renderBanner = (banner) => <div key={banner.id} className="relative h-28 min-w-[300px] flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#161616] p-4">{banner.image ? <img src={banner.image} alt={banner.title || 'Banner promocional'} className="absolute inset-0 h-full w-full object-cover" /> : <div className="relative z-10 flex items-center gap-3"><span className="text-3xl">{banner.emoji}</span><div className="min-w-0">{banner.kicker && <span className="text-[10px] font-bold uppercase text-white/70">{banner.kicker}</span>}<b className="block text-sm text-white">{banner.title}</b>{banner.sub && <span className="text-xs text-white/70">{banner.sub}</span>}</div></div>}</div>;
  const promoVideos = profile.promoVideos || [];

  // Gallery items (using profile or initial)
  const galleryItems = profile.galleryItems && profile.galleryItems.length > 0
    ? profile.galleryItems
    : INITIAL_GALLERY_ITEMS;

  // Tabs state (servicos, galeria 3x9, catalogo produtos, sobre mim, pagamento)
  const [activeTab, setActiveTab] = useState<'servicos' | 'galeria' | 'catalogo' | 'sobre' | 'pagamento'>('servicos');
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string } | null>(null);
  const [activeNiche, setActiveNiche] = useState<'padrao' | 'construcao_civil'>(profile.businessNiche === 'construcao_civil' ? 'construcao_civil' : 'padrao');

  // Pix dynamic payment state
  const [payAmount, setPayAmount] = useState('50,00');
  const [payValue, setPayValue] = useState(50);
  const [lastCode, setLastCode] = useState('');
  const [qrSvg, setQrSvg] = useState('');

  // Review Modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookStep, setBookStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(localDate());
  const [selectedTime, setSelectedTime] = useState('');
  const [clientForm, setClientForm] = useState({ nome: '', telefone: '', email: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const agendaDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() + index);
    const data = localDate(date);
    return { data, dow: DOWS[date.getDay()], day: String(date.getDate()), horarios: availableSlots(data, durationMinutes(selectedService?.duration), workingHours, bookingSettings, daySchedule).map(hora => ({ hora, livre: true })) };
  });

  // Recalculate Pix BR Code and QR SVG
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
      showToast('Código Pix copiado!');
    } catch {
      showToast('Selecione e copie o código');
    }
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

  const renderCinemaTitle = () => {
    const parts = title.trim().split(/\s+/);
    if (parts.length < 2) return title;
    return (
      <>
        <span className="text-white/50">{parts[0]}</span> {parts.slice(1).join(' ')}
      </>
    );
  };

  // Booking Flow Triggers
  const [reservedProduct, setReservedProduct] = useState<ServiceItem | null>(null);
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const openBookingFor = (svc?: ServiceItem) => {
    if (svc?.type === 'produto') { setReservedProduct(svc); return; }
    if (svc) {
      setSelectedService(svc);
      setBookStep(2);
    } else {
      setSelectedService(services[0] || null);
      setBookStep(1);
    }
    setIsBookingSuccess(false);
    setFormErrors({});
    setIsBookModalOpen(true);
  };

  const handleBookNext = () => {
    if (bookStep === 1) {
      if (!selectedService) return showToast('Selecione um serviço');
      setBookStep(2);
    } else if (bookStep === 2) {
      if (!selectedDate || !selectedTime) return showToast('Escolha a data e o horário');
      setBookStep(3);
    } else if (bookStep === 3) {
      const errors: Record<string, string> = {};
      if (!clientForm.nome.trim() || clientForm.nome.trim().split(' ').length < 2) {
        errors.nome = 'Informe seu nome e sobrenome.';
      }
      if ((bookingSettings.requireWhatsapp || clientForm.telefone) && clientForm.telefone.replace(/\D/g, '').length < 10) {
        errors.telefone = 'Informe um WhatsApp com DDD válido.';
      }
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      // Register booking
      const booked = addClientBooking({
        date: selectedDate,
        name: clientForm.nome.trim(),
        phone: clientForm.telefone.trim(),
        time: selectedTime,
        serviceName: selectedService?.name || 'Serviço Estético',
        vip: false,
      });

      if (booked === false) return;
      setIsBookingSuccess(true);
      setBookStep(4);

      // Trigger congratulations modal with falling confetti
      openCongratulations({
        name: clientForm.nome.trim(),
        phone: clientForm.telefone.trim(),
        service: selectedService?.name || 'Serviço Estético',
        time: `${selectedDate}, ${selectedTime}`,
        price: selectedService?.price || 'R$ 80,00',
        tier: 'padrao',
        discountAmount: 0,
        finalPrice: selectedService?.cents ? selectedService.cents / 100 : 80,
        isEligible: false,
        isPreview: false,
      });

      showToast('Agendamento confirmado com sucesso!');
    }
  };

  const whatsappUrl = safeLink(whats);
  const instaHandle = insta;
  const locationEmbed = mapEmbed(address);

  const selectedDayObj = agendaDays.find((d) => d.data === selectedDate) || agendaDays[0];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center selection:bg-[#0284c7] selection:text-white">
      {/* Top Banner (Preview Indicator) */}
      <div className="w-full bg-[#161616] border-b border-white/10 px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white/90">
            Site Público (Visão da Cliente)
          </span>
        </div>
        <button
          onClick={() => setIsStorefrontOpen(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao painel</span>
        </button>
      </div>

      {reservedProduct && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4"><div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-secondary p-5"><h3 className="font-semibold">Reservar {reservedProduct.name}</h3><p className="text-sm text-muted-foreground">{reservedProduct.price} · retirada e pagamento no ato</p><input aria-label="Nome para reserva" placeholder="Nome completo" value={reservationName} onChange={e => setReservationName(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3" /><input aria-label="WhatsApp para reserva" placeholder="WhatsApp com DDD" value={reservationPhone} onChange={e => setReservationPhone(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3" /><button className="w-full rounded-full bg-primary p-3 text-primary-foreground" onClick={() => { if (!reservationName.trim() || reservationPhone.replace(/\D/g, '').length < 10) return showToast('Informe nome e WhatsApp válido.'); const reservations = JSON.parse(localStorage.getItem('studiolite_product_reservations') || '[]'); localStorage.setItem('studiolite_product_reservations', JSON.stringify([...reservations, { id: Date.now(), product: reservedProduct.name, name: reservationName, phone: reservationPhone, status: 'Reservado', createdAt: new Date().toISOString() }])); showToast('Reserva salva neste aparelho para pagamento no ato.'); setReservedProduct(null); }}>Confirmar reserva local</button><button onClick={() => setReservedProduct(null)} className="w-full text-sm text-muted-foreground">Cancelar</button></div></div>}
      {/* Main Container */}
      <div className="w-full max-w-[430px] min-h-screen bg-black pb-24 relative shadow-2xl">
        {/* CINE HERO */}
        <div className="relative">
          {/* Cover Area */}
          <div
            className={`relative overflow-hidden transition-all ${
              layout === 'cinema'
                ? 'aspect-[9/16] max-h-[620px] w-full rounded-b-[34px] bg-gradient-to-b from-[#0a192f] via-[#050d1a] to-[#000000]'
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
              <div className="absolute inset-0 flex flex-col items-center justify-center font-extrabold text-sky-400/80 tracking-tighter opacity-80 select-none">
                <span className="text-3xl font-mono tracking-widest">ESTÚDIO</span>
                <span className="text-sm font-sans tracking-widest text-white/40">PREMIUM</span>
              </div>
            )}

            {/* Bottom Gradient Overlay (Customizable per Format) */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-black to-transparent transition-all"
              style={{
                height: `${activeOverlay.height}%`,
                opacity: activeOverlay.intensity / 100,
                transform: activeOverlay.offsetDown ? `translateY(${activeOverlay.offsetDown}%)` : undefined,
              }}
            />

            {/* Directional Gradient Overlay (Respects user intensity for full transparency) */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity ${
                layout === 'cinema'
                  ? 'bg-gradient-to-b from-black/40 via-transparent to-black/80'
                  : layout === 'hero'
                  ? 'bg-gradient-to-b from-black/30 via-transparent to-black/85'
                  : 'bg-gradient-to-b from-black/25 via-transparent to-black/75'
              }`}
              style={{ opacity: Math.max(0.05, activeOverlay.intensity / 80) }}
            />
          </div>

          {/* Top Share Button */}
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

        {/* PROFILE BLOCK (Hidden in Cinema mode) */}
        {layout !== 'cinema' && (
          <div className="px-4 relative z-30">
            {layout === 'hero' ? (
              <div className="w-full flex flex-col items-center justify-center text-center -mt-14">
                {/* Centered Avatar */}
                <div className="w-24 h-24 text-3xl rounded-full bg-[#161616] border-4 border-black text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-2xl mx-auto">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>M</span>
                  )}
                </div>

                {/* Profile Info Centered */}
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
                <div className="w-20 h-20 text-2xl rounded-full bg-[#161616] border-4 border-black text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-2xl">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>M</span>
                  )}
                </div>

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

        {/* GOOGLE REVIEWS TOP CARD (if enabled) */}
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
                onClick={() => setIsReviewOpen(true)}
                className="w-full py-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Deixar avaliação no Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {banners.some((banner) => (banner.position || 'above-tabs') === 'above-tabs') && <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4">
          {banners.filter((banner) => (banner.position || 'above-tabs') === 'above-tabs').map(renderBanner)}
        </div>}

        {/* Video Carousel com Autoplay Contínuo (Posição: Acima das Abas) */}
        {promoVideos.length > 0 && profile.videoCarouselPosition === 'above-tabs' && (
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4">
            {promoVideos.map((video) => (
              <div
                key={video.id}
                className="relative h-[310px] w-[185px] flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-lg group"
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
                {video.name && (
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9.5px] font-bold text-white/90 border border-white/10 pointer-events-none">
                    {video.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TABS HEADER COM GALERIA GRID 3X9 */}
        <div className="flex border-b border-white/10 px-4 mt-5 overflow-x-auto no-scrollbar">
          {[
            { id: 'servicos', label: 'Serviços' },
            ...(profile.galleryEnabled !== false ? [{ id: 'galeria', label: 'Galeria' }] : []),
            ...(profile.catalogDemo ? [{ id: 'catalogo', label: 'Catálogo' }] : []),
            { id: 'sobre', label: 'Sobre mim' },
            { id: 'pagamento', label: 'Pagamento' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-white border-white'
                  : 'text-white/40 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: GALERIA (Grid 3x9 avulsa R$ 5,90) */}
        {activeTab === 'galeria' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-sky-400" />
                  Galeria de Fotos & Mídias
                </h3>
                <span className="text-[11px] text-white/50 block mt-0.5">
                  Grade 3x9 · Toque em qualquer foto ou vídeo para ampliar
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
                {galleryItems.length} mídias
              </span>
            </div>

            {/* 3x9 Grid Layout (3 columns) */}
            <div className="grid grid-cols-3 gap-2">
              {galleryItems.slice(0, 27).map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setSelectedLightboxMedia(item)}
                  className="group relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-[#161616] shadow-md hover:border-white/30 transition-all active:scale-95 text-left"
                >
                  {item.type === 'video' ? (
                    <video src={item.url} muted className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || `Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {item.type === 'video' && (
                    <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 backdrop-blur-xs flex items-center justify-center text-white">
                      <Play className="w-3 h-3 fill-white" />
                    </span>
                  )}
                  {item.title && (
                    <span className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-[9.5px] font-semibold text-white truncate text-center block">
                      {item.title}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: SERVIÇOS & CATÁLOGO */}
        {(activeTab === 'servicos' || activeTab === 'catalogo') && (
          <div className="space-y-5 p-4">
            {/* Seletor de Nicho: Alternância rápida ou Construção Civil */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setActiveNiche('padrao')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeNiche === 'padrao'
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#181818] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                Catálogo Padrão
              </button>
              <button
                type="button"
                onClick={() => setActiveNiche('construcao_civil')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeNiche === 'construcao_civil'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-[#181818] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                Construção Civil & Manutenção
              </button>
            </div>

            {/* ADAPTAÇÃO: SERVIÇOS PARA CONSTRUÇÃO CIVIL & MANUTENÇÃO (7 ITENS EM FORMATO DE LISTA) */}
            {activeNiche === 'construcao_civil' ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-amber-400" />
                      Serviços — Construção Civil & Manutenção
                    </h3>
                    <span className="text-xs text-white/50 block mt-0.5">
                      Toque no serviço para ver detalhes e fotos
                    </span>
                  </div>
                  <span className="text-xs text-white/50 font-bold shrink-0">7 itens</span>
                </div>

                <div className="space-y-2.5">
                  {CIVIL_CONSTRUCTION_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => openBookingFor(s)}
                      className="group flex w-full items-center gap-3.5 rounded-2xl border border-white/10 bg-[#161616] p-3.5 text-left transition-all hover:border-white/25 hover:bg-[#1e1e1e]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <b className="truncate text-sm font-bold text-white">{s.name}</b>
                          {s.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-extrabold uppercase">
                              {s.badge}
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block text-xs text-white/50">
                          <span className="text-amber-400 font-semibold">
                            {s.cat === 'eletrica'
                              ? 'Elétrica'
                              : s.cat === 'hidraulica'
                              ? 'Hidráulica'
                              : s.cat === 'pintura'
                              ? 'Pintura'
                              : s.cat === 'alvenaria'
                              ? 'Alvenaria'
                              : 'Instalações'}
                          </span>{' '}
                          • {s.duration}
                        </span>
                        {s.desc && (
                          <span className="mt-0.5 line-clamp-1 block text-[10px] text-white/35">
                            {s.desc}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="rounded-full bg-[#262626] px-3.5 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-white group-hover:text-black block">
                          {s.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* CATÁLOGO PADRÃO (CATEGORIAS) */
              (categories.length ? categories : [{ key: '__all', label: 'Serviços', emoji: '✂️' }]).map((cat, catIdx) => {
                const items = services.filter(s => s.type === (activeTab === 'catalogo' ? 'produto' : 'servico') && (cat.key === '__all' || s.cat === cat.key));
                if (!items.length) return null;
                return (
                  <div key={cat.key} className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex min-w-0 items-center gap-2"><h3 className="truncate text-lg font-bold tracking-tight text-white">{cat.label}</h3></div>
                      <span className="shrink-0 text-xs text-white/45">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                    </div>
                    {serviceDisplay === 'cards' ? (
                      <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-3 pt-1">
                        {items.map((s) => (
                          <button key={s.id} type="button" onClick={() => openBookingFor(s)} className="group flex w-[240px] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#161616] text-left shadow-lg transition-all hover:border-white/30">
                            <div className="relative flex h-36 w-full items-center justify-center overflow-hidden text-5xl" style={{ background: s.image ? `url('${s.image}') center/cover no-repeat` : `linear-gradient(180deg, ${cat.soft || '#262626'} 0%, rgba(22,22,22,0.85) 100%)` }}>
                              {s.badge && <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-[#00c2ff] to-[#0284c7] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md">{s.badge}</span>}
                              {!s.image && <span><span className="text-sm text-muted-foreground">Sem foto</span></span>}
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-4">
                              <div>
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-sky-400">{cat.label}</span>
                                <h4 className="mb-1 line-clamp-1 text-sm font-bold leading-snug text-white">{s.name}</h4>
                                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/55">{s.desc}</p>
                              </div>
                              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                                <div><span className="block text-base font-extrabold text-white">{s.price}</span><span className="text-[10px] text-white/45">{s.duration}</span></div>
                                <span className="rounded-full bg-gradient-to-r from-[#00c2ff] to-[#0284c7] px-3.5 py-1.5 text-xs font-bold text-white shadow-md">{s.type === 'produto' ? 'Reservar' : 'Agendar'}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {items.map((s) => (
                          <button key={s.id} type="button" onClick={() => openBookingFor(s)} className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#161616] p-3 text-left transition-all hover:border-white/25 hover:bg-[#1e1e1e]">
                            {s.image ? <img src={s.image} alt="" className="h-14 w-14 flex-none rounded-xl object-cover" /> : <span className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-secondary text-muted-foreground"><ImageIcon className="h-5 w-5" /></span>}
                            <div className="min-w-0 flex-1">
                              <b className="block truncate text-sm font-bold text-white">{s.name}</b>
                              <span className="mt-0.5 block text-xs text-white/50">{s.duration}</span>
                              {s.desc && <span className="mt-0.5 line-clamp-1 block text-[10px] text-white/35">{s.desc}</span>}
                            </div>
                            <span className="flex-shrink-0 rounded-full bg-[#262626] px-3.5 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-white group-hover:text-black">{s.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {banners.filter(banner => banner.position === 'after:' + cat.key).map(renderBanner)}

                    {/* VÍDEOS COM AUTOPLAY: POSIÇÃO ENTRE AS CATEGORIAS */}
                    {promoVideos.length > 0 &&
                      profile.videoCarouselPosition === 'between-categories' &&
                      catIdx === 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2 px-1">
                            Vídeos em Destaque (Autoplay)
                          </span>
                          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                            {promoVideos.map((video) => (
                              <div
                                key={video.id}
                                className="relative h-[290px] w-[170px] flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-lg group"
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
                                {video.name && (
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-bold text-white/90 border border-white/10">
                                    {video.name}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Banners abaixo das categorias */}
        {activeTab === 'servicos' && banners.some((banner) => banner.position === 'below-categories') && <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4">{banners.filter((banner) => banner.position === 'below-categories').map(renderBanner)}</div>}

        {/* VÍDEOS COM AUTOPLAY: POSIÇÃO ABAIXO DAS CATEGORIAS (PADRÃO) */}
        {activeTab === 'servicos' && promoVideos.length > 0 && profile.videoCarouselPosition !== 'above-tabs' && profile.videoCarouselPosition !== 'between-categories' && (
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4">
            {promoVideos.map((video) => (
              <div
                key={video.id}
                className="relative h-[300px] w-[185px] flex-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-lg group"
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
                {video.name && (
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9.5px] font-bold text-white/90 border border-white/10 pointer-events-none">
                    {video.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SOBRE MIM (Sobre mim + Localização embed + Contatos unificados) */}
        {activeTab === 'sobre' && (
          <div className="p-4 space-y-3.5">
            {/* 1. Biografia e Diferenciais */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 text-xs text-white/75 leading-relaxed space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Sobre mim
              </h4>
              <p>
                {profile.about ||
                  'Trabalho há mais de 8 anos com estética facial e corporal em São Paulo. Meu foco é criar experiências de autocuidado personalizadas, sempre com escuta atenta e cuidado técnico em cada procedimento.'}
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

            {/* 2. Localização no Mapa (Embed) */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2f7dff]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Localização & Endereço
                  </h4>
                </div>
                <span className="text-[11px] text-white/45 truncate max-w-[150px]">{place || title}</span>
              </div>

              {/* Google Maps Embed Frame */}
              <div className="rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10 relative">
                {!locationEmbed && <p className="p-4 text-xs text-muted-foreground">Abra o link para ver a localização exata. Para exibir o mapa aqui, use um link Google Maps com coordenadas ou de incorporação.</p>}
                {locationEmbed && <iframe
                  title="Estabelecimento no Google Maps"
                  src={locationEmbed || undefined}
                  className="w-full h-60 border-0"
                  loading="lazy"
                />}
              </div>

              {address && (
                <div className="text-xs text-white/70 leading-relaxed bg-[#1e1e1e] p-3 rounded-xl border border-white/5">
                  <b className="text-white block mb-0.5">Endereço do estúdio</b>
                  <span>Localização informada pelo estabelecimento</span>
                </div>
              )}

              <a
                href={safeLink(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Abrir rota no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2f7dff]" />
              </a>
            </div>

            {/* 3. Informações de Contato e Horários */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Informações de Contato
              </h4>

              <div className="space-y-2">
                {whats && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-center justify-between text-white hover:bg-[#262626] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 flex items-center justify-center text-white/60">
                        <Phone className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div>
                        <b className="block font-bold text-xs">WhatsApp</b>
                        <span className="text-[11px] text-white/50">Abrir WhatsApp</span>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs">Falar agora ›</span>
                  </a>
                )}

                {instaHandle && (
                  <a
                    href={safeLink(insta)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-center justify-between text-white hover:bg-[#262626] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 flex items-center justify-center text-white/60">
                         <AtSign className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div>
                        <b className="block font-bold text-xs">Instagram</b>
                        <span className="text-[11px] text-white/50">Abrir Instagram</span>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs">Ver perfil ›</span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-center justify-between text-white hover:bg-[#262626] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 flex items-center justify-center text-white/60">
                        <Mail className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div>
                        <b className="block font-bold text-xs">E-mail</b>
                        <span className="text-[11px] text-white/50 truncate max-w-[200px] block">{email}</span>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs">Enviar ›</span>
                  </a>
                )}
              </div>

              {/* Horário de Atendimento */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11.5px]">
                <span className="text-white/50 block font-semibold uppercase text-[10px] tracking-wider mb-1">
                  Horário de atendimento
                </span>
                <div className="flex justify-between pb-1 border-b border-white/5">
                  <span className="text-white/60">Segunda a sexta</span>
                  <b className="text-white">09:00 – 18:00</b>
                </div>
                <div className="flex justify-between pb-1 border-b border-white/5">
                  <span className="text-white/60">Sábado</span>
                  <b className="text-white">09:00 – 14:00</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Domingo</span>
                  <b className="text-white/40">Fechado</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAGAMENTO PIX */}
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

      </div>

      {/* ================= MODAL: AVALIAR NO GOOGLE ================= */}
      {isReviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsReviewOpen(false)}
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
                onClick={() => setIsReviewOpen(false)}
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
                href={safeLink(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/90"
              >
                <span>Escrever avaliação no Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
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

      {/* ================= MODAL: AGENDAR + PAGAR (4 STEPS) ================= */}
      {isBookModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsBookModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] max-h-[92vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {bookStep === 1
                    ? 'Escolha o serviço'
                    : bookStep === 2
                    ? selectedService?.name || 'Agendar'
                    : bookStep === 3
                    ? 'Confirme e pague'
                    : 'Pagamento'}
                </h3>
                {selectedService && bookStep > 1 && bookStep < 4 && (
                  <span className="text-xs text-white/50 block">
                    {selectedService.duration} · {selectedService.price}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar (steps 1, 2, 3) */}
            {bookStep < 4 && (
              <div className="flex gap-1.5 mb-4">
                <i className={`h-1 flex-1 rounded-full ${bookStep >= 1 ? 'bg-white' : 'bg-[#262626]'}`} />
                <i className={`h-1 flex-1 rounded-full ${bookStep >= 2 ? 'bg-white' : 'bg-[#262626]'}`} />
                <i className={`h-1 flex-1 rounded-full ${bookStep >= 3 ? 'bg-white' : 'bg-[#262626]'}`} />
              </div>
            )}

            {/* STEP 1: Escolha o serviço */}
            {bookStep === 1 && (
              <div className="space-y-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(s);
                      setBookStep(2);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 hover:border-white/20 transition-all text-left flex items-center justify-between"
                  >
                    <div>
                      <b className="text-xs font-bold text-white block">{s.name}</b>
                      <small className="text-[11px] text-white/50 block">{s.duration}</small>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#262626] text-xs font-bold text-white">
                      {s.price}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: Escolha data & horário */}
            {bookStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                    Escolha o dia
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {agendaDays.map((d) => (
                      <button
                        key={d.data}
                        type="button"
                        onClick={() => { setSelectedDate(d.data); setSelectedTime(''); }}
                        className={`flex-shrink-0 w-14 py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          selectedDate === d.data
                            ? 'bg-white text-black font-extrabold shadow-md'
                            : 'bg-[#1e1e1e] border border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase">{d.dow}</span>
                        <span className="text-base font-bold mt-0.5">{d.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                    Escolha o horário
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDayObj.horarios.length === 0 && <p className="col-span-3 py-4 text-center text-muted-foreground">Sem horários disponíveis neste dia.</p>}
                    {selectedDayObj.horarios.map((h) => (
                      <button
                        key={h.hora}
                        type="button"
                        disabled={!h.livre}
                        onClick={() => setSelectedTime(h.hora)}
                        className={`py-2.5 rounded-full font-bold text-xs transition-all ${
                          !h.livre
                            ? 'opacity-30 line-through bg-[#1a1a1a] text-white/30 cursor-not-allowed'
                            : selectedTime === h.hora
                            ? 'bg-white text-black shadow-md'
                            : 'bg-[#1e1e1e] border border-white/10 text-white/80 hover:bg-[#262626]'
                        }`}
                      >
                        {h.hora}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookStep(1)}
                    className="py-3 px-4 rounded-full bg-[#1e1e1e] text-white/70 text-xs font-semibold hover:text-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleBookNext}
                    className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Dados & Pagamento */}
            {bookStep === 3 && (
              <div className="space-y-3.5 text-xs">
                {/* Summary */}
                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] space-y-1.5 border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/50">Serviço</span>
                    <b className="text-white font-bold">{selectedService?.name}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Data</span>
                    <b className="text-white font-bold">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")}
                    </b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Horário</span>
                    <b className="text-white font-bold">{selectedTime}</b>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-white/10 text-sm">
                    <span className="text-white/60">Total</span>
                    <b className="text-white font-extrabold">{selectedService?.price}</b>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={clientForm.nome}
                    onChange={(e) => setClientForm({ ...clientForm, nome: e.target.value })}
                    placeholder="Ex: Carla Mendes"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-semibold focus:outline-none focus:border-white/30"
                  />
                  {formErrors.nome && <p className="text-[#ff6b6b] text-[11px] mt-1">{formErrors.nome}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={clientForm.telefone}
                    onChange={(e) => setClientForm({ ...clientForm, telefone: e.target.value })}
                    placeholder="(11) 90000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                  {formErrors.telefone && (
                    <p className="text-[#ff6b6b] text-[11px] mt-1">{formErrors.telefone}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="voce@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookStep(2)}
                    className="py-3 px-4 rounded-full bg-[#1e1e1e] text-white/70 text-xs font-semibold hover:text-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleBookNext}
                    className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors"
                  >
                    Confirmar agendamento · pagar no ato
                  </button>
                </div>
                <p className="text-[11px] text-white/40 text-center leading-relaxed">
                  Reserva local neste aparelho. Pagamento no estabelecimento; não há cobrança ou confirmação automática.
                </p>
              </div>
            )}

            {/* STEP 4: Concluído */}
            {bookStep === 4 && (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Tudo certo, {clientForm.nome}!</h4>
                <p className="text-xs text-white/70 leading-relaxed max-w-xs mx-auto">
                  Seu agendamento para <b>{selectedService?.name}</b> foi confirmado para{' '}
                  <b>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")} às {selectedTime}
                  </b>
                  .
                </p>
                <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 text-xs text-left text-white/80 space-y-1">
                  <p><b>Profissional:</b> {title}</p>
                  <p><b>Endereço:</b> {address}</p>
                  <p><b>Valor:</b> {selectedService?.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-transform active:scale-95"
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: LIGHTBOX PARA VISUALIZAR FOTOS / VÍDEOS DA GALERIA GRID 3X9 */}
      {/* ========================================================================= */}
      {selectedLightboxMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxMedia(null)}
        >
          <div
            className="relative max-w-sm w-full bg-[#161616] border border-white/15 rounded-3xl overflow-hidden p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white truncate">
                {selectedLightboxMedia.title || 'Mídia da Galeria'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLightboxMedia(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[68vh] flex items-center justify-center border border-white/5">
              {selectedLightboxMedia.type === 'video' ? (
                <video
                  src={selectedLightboxMedia.url}
                  autoPlay
                  controls
                  playsInline
                  className="w-full max-h-[68vh] object-contain"
                />
              ) : (
                <img
                  src={selectedLightboxMedia.url}
                  alt={selectedLightboxMedia.title || 'Foto ampliada'}
                  className="w-full max-h-[68vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTÃO FLUTUANTE DE WHATSAPP + LIGAR (TAB DE SERVIÇOS) */}
      {/* Especificação: Largura 400px, 15px de altura útil/padding com 5px de borda, ícone ligar 40x40px */}
      {/* ========================================================================= */}
      {activeTab === 'servicos' && profile.floatingContactBar !== false && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className="w-full max-w-[400px] pointer-events-auto rounded-[24px] border-[5px] border-white/15 bg-[#161616]/95 backdrop-blur-md shadow-2xl p-2 flex items-center justify-between gap-2.5"
            style={{ minHeight: '56px' }}
          >
            {/* Botão de WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[42px] px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Chamar no WhatsApp</span>
            </a>

            {/* Botão de Ligar: Ícone de 40x40px */}
            <a
              href={`tel:${(profile.phoneCallNumber || profile.whats || '19998214321').replace(/[^\d+]/g, '')}`}
              className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-2xl bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg transition-all active:scale-95"
              title="Ligar agora"
            >
              <Phone className="w-5 h-5 fill-black" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
