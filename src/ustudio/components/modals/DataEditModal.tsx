// @ts-nocheck -- ported as-is from the original AI Studio project
import { safeLink } from '../../utils/contactLinks';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { absorbPayload } from '../../utils/pix';
import { X, ExternalLink, Zap, Star, ShieldCheck, Phone, Check } from 'lucide-react';

export type DataEditType = 'google' | 'infinitepay' | 'pix' | 'contact' | null;

interface DataEditModalProps {
  type: DataEditType;
  onClose: () => void;
}

export const DataEditModal: React.FC<DataEditModalProps> = ({ type, onClose }) => {
  const { profile, saveProfile, showToast } = useApp();

  // Local state initialized from profile
  const [place, setPlace] = useState(profile.place || 'Studio Marina Ravi');
  const [google, setGoogle] = useState(profile.google || 'https://share.google/OIdcey9tf11sD3lEz');
  const [googleOn, setGoogleOn] = useState(profile.googleOn ?? true);

  const [apiUrl, setApiUrl] = useState(profile.apiUrl || 'https://api.seudominio.com');

  const [pixKey, setPixKey] = useState(profile.pixKey || 'tonyfilho911@gmail.com');
  const [pixName, setPixName] = useState(profile.pixName || 'Antonio Jose de Oliveira');
  const [pixCity, setPixCity] = useState(profile.pixCity || 'SAO PAULO');

  const [whats, setWhats] = useState(safeLink(profile.whats || ''));
  const [insta, setInsta] = useState(safeLink(profile.insta || ''));
  const [email, setEmail] = useState(profile.email || 'contato@marinaravi.com.br');
  const [address, setAddress] = useState(safeLink(profile.address || ''));

  useEffect(() => {
    setPlace(profile.place || 'Studio Marina Ravi');
    setGoogle(profile.google || 'https://share.google/OIdcey9tf11sD3lEz');
    setGoogleOn(profile.googleOn ?? true);
    setApiUrl(profile.apiUrl || 'https://api.seudominio.com');
    setPixKey(profile.pixKey || 'tonyfilho911@gmail.com');
    setPixName(profile.pixName || 'Antonio Jose de Oliveira');
    setPixCity(profile.pixCity || 'SAO PAULO');
    setWhats(safeLink(profile.whats || ''));
    setInsta(safeLink(profile.insta || ''));
    setEmail(profile.email || 'contato@marinaravi.com.br');
    setAddress(safeLink(profile.address || ''));
  }, [profile, type]);

  if (!type) return null;

  const handlePixKeyChange = (val: string) => {
    setPixKey(val);
    const absorbed = absorbPayload(val);
    if (absorbed) {
      if (absorbed.key) setPixKey(absorbed.key);
      if (absorbed.name) setPixName(absorbed.name);
      if (absorbed.city) setPixCity(absorbed.city);
      showToast('Chave Pix, nome e cidade lidos automaticamente do payload!');
    }
  };

  const handleSave = () => {
    if (type === 'infinitepay') return;
    if (type === 'contact' && [whats, insta, address].some(value => value.trim() && !safeLink(value.trim()))) return showToast('Cole links completos começando com https://.');
    if (type === 'google') {
      saveProfile({
        place: place.trim(),
        google: google.trim(),
        googleOn,
      });
      showToast('Configurações de Avaliações no Google salvas!');
    } else if (type === 'infinitepay') {
      saveProfile({
        apiUrl: apiUrl.trim(),
      });
      showToast('API de agendamento online salva!');
    } else if (type === 'pix') {
      saveProfile({
        pixKey: pixKey.trim(),
        pixName: pixName.trim(),
        pixCity: pixCity.trim().toUpperCase(),
      });
      showToast('Dados de pagamento Pix salvos com sucesso!');
    } else if (type === 'contact') {
      saveProfile({
        whats: whats.trim(),
        insta: insta.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      showToast('Informações de contato atualizadas!');
    }
    onClose();
  };

  const titles = {
    google: 'Avaliações no Google',
    infinitepay: 'InfinitePay · Em breve',
    pix: 'Pagamento Pix',
    contact: 'Informações de Contato',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] max-h-[90vh] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center text-white">
              {type === 'google' && <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />}
              {type === 'infinitepay' && <Zap className="w-4 h-4 text-[#2f7dff]" />}
              {type === 'pix' && <Zap className="w-4 h-4 text-emerald-400" />}
              {type === 'contact' && <Phone className="w-4 h-4 text-[#00c2ff]" />}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{titles[type]}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {type === "infinitepay" && <p className="py-8 text-center text-sm text-muted-foreground">Em breve · Integração de pagamentos com InfinitePay.</p>}
        {/* MODAL 1: AVALIAÇÕES NO GOOGLE */}
        {type === 'google' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                Nome do estabelecimento (aparece no mapa do modal)
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ex: Studio Marina Ravi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                Link para avaliar
              </label>
              <input
                type="text"
                value={google}
                onChange={(e) => setGoogle(e.target.value)}
                placeholder="https://share.google/OIdcey9tf11sD3lEz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#1e1e1e] border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={googleOn}
                onChange={(e) => setGoogleOn(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-white cursor-pointer"
              />
              <div>
                <span className="text-xs text-white font-semibold block">
                  Mostrar cartão de avaliações no topo da página
                </span>
                <span className="text-[11px] text-white/45 block mt-0.5 leading-relaxed">
                  Exibe o selo Google Verificado ★★★★★ com mapa e botão direto de avaliação.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* MODAL 2: AGENDAMENTO ONLINE (INFINITEPAY) */}
        {false && type === 'infinitepay' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                URL da API de agendamento
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.seudominio.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 text-[11.5px] text-white/60 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#34c281]" />
                <span>Integração de checkout</span>
              </div>
              <p>
                Servidor backend que guarda sua InfiniteTag, cria o link de checkout e valida os pagamentos.
              </p>
            </div>
          </div>
        )}

        {/* MODAL 3: PAGAMENTO PIX */}
        {type === 'pix' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                Chave Pix
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => handlePixKeyChange(e.target.value)}
                placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-semibold focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">
                  Nome do favorecido
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={pixName}
                  onChange={(e) => setPixName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={pixCity}
                  onChange={(e) => setPixCity(e.target.value.toUpperCase())}
                  placeholder="SAO PAULO"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white uppercase font-medium focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/5 text-[11.5px] text-white/60 leading-relaxed">
              O código Pix é gerado com sua chave e o valor que a cliente digitar. Se colar um código Pix completo no campo, ele é lido automaticamente.
            </div>
          </div>
        )}

        {/* MODAL 4: INFORMAÇÕES DE CONTATO */}
        {type === 'contact' && (
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">
                  Link do WhatsApp
                </label>
                <input
                  type="text"
                  value={whats}
                  onChange={(e) => setWhats(e.target.value)}
                  placeholder="https://wa.me/5511999999999"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">
                  Link do Instagram
                </label>
                <input
                  type="text"
                  value={insta}
                  onChange={(e) => setInsta(e.target.value)}
                  placeholder="https://www.instagram.com/suabarbearia/"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@marinaravi.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">
                Link da localização
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="https://www.google.com/maps?q=-23.5505,-46.6333"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-medium focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <button
            type="button"
            disabled={type === "infinitepay"} onClick={handleSave}
            className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-98 transition-transform shadow-lg flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Salvar alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
