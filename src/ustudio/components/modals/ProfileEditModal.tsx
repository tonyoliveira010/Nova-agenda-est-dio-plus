// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { COVER_PRESETS } from '../../data/initialData';
import { X, Camera, Upload } from 'lucide-react';

const AVATAR_EMOJIS = ['M', '💆', '🌸', '✨', '💇', '💅', '👑', '💄', '🧴', '🌹'];

export const ProfileEditModal: React.FC = () => {
  const { profileEditField, setProfileEditField, profile, saveProfile, showToast } = useApp();

  const [coverIdx, setCoverIdx] = useState(profile.coverIndex);
  const [customCover, setCustomCover] = useState(profile.customCoverUrl || profile.cover || '');
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji || 'M');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || profile.avatar || '');
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [about, setAbout] = useState(profile.about);
  const [title, setTitle] = useState(profile.title);
  const [sub, setSub] = useState(profile.sub);

  const fileCoverRef = useRef<HTMLInputElement>(null);
  const fileAvatarRef = useRef<HTMLInputElement>(null);

  const handleModalCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomCover(reader.result);
        showToast('Foto carregada! Clique em Salvar');
      }
    };
    reader.readAsDataURL(f);
  };

  const handleModalAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        showToast('Foto carregada! Clique em Salvar');
      }
    };
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    setCoverIdx(profile.coverIndex);
    setCustomCover(profile.customCoverUrl || '');
    setAvatarEmoji(profile.avatarEmoji || 'M');
    setAvatarUrl(profile.avatarUrl || '');
    setName(profile.name);
    setHandle(profile.handle);
    setBio(profile.bio);
    setAbout(profile.about);
  }, [profile, profileEditField]);

  if (!profileEditField) return null;

  const titleMap = {
    cover: 'Editar capa',
    avatar: 'Editar avatar',
    name: 'Editar nome e bio',
    about: 'Editar sobre mim',
  };

  const handleSave = () => {
    if (profileEditField === 'cover') {
      saveProfile({
        coverIndex: coverIdx,
        customCoverUrl: customCover.trim() || undefined,
        cover: customCover.trim(),
        coverType: customCover.startsWith('data:video/') ? 'video' : 'image',
      });
    } else if (profileEditField === 'avatar') {
      saveProfile({
        avatarEmoji,
        avatarUrl: avatarUrl.trim() || undefined,
      });
    } else if (profileEditField === 'name') {
      saveProfile({
        name: name.trim() || profile.name,
        handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
        bio: bio.trim(),
        title: title.trim(),
        sub: sub.trim(),
      });
    } else if (profileEditField === 'about') {
      saveProfile({
        about: about.trim(),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setProfileEditField(null)}
    >
      <div
        className="w-full max-w-[430px] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">{titleMap[profileEditField]}</h3>
          <button
            onClick={() => setProfileEditField(null)}
            className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COVER EDIT */}
        {profileEditField === 'cover' && (
          <div className="space-y-4 text-xs">
            {/* Direct Upload Option */}
            <input
              ref={fileCoverRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleModalCoverUpload}
            />
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                Foto do seu dispositivo
              </label>
              <button
                type="button"
                onClick={() => fileCoverRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-[#1e1e1e] hover:bg-[#262626] border border-white/15 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#2f7dff]" />
                <span>Escolher foto ou vídeo</span>
              </button>
              {customCover && (
                <div className="mt-2.5 h-20 rounded-xl overflow-hidden border border-white/10 relative">
                  {customCover.startsWith("data:video/") ? <video src={customCover} muted controls className="w-full h-full object-cover" /> : <img src={customCover} alt="Prévia da capa" className="w-full h-full object-cover" />}
                  <span className="absolute bottom-1 right-2 text-[10px] text-white/70 bg-black/60 px-1.5 py-0.5 rounded">
                    Foto selecionada
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                Paletas gradientes exclusivas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COVER_PRESETS.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCoverIdx(i);
                      setCustomCover('');
                    }}
                    className={`h-12 rounded-xl transition-all border-2 ${
                      coverIdx === i && !customCover ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-80'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]}, ${grad[2]})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Ou digite URL da foto
              </label>
              <input
                type="url"
                value={customCover}
                onChange={(e) => setCustomCover(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        {/* AVATAR EDIT */}
        {profileEditField === 'avatar' && (
          <div className="space-y-4 text-xs">
            {/* Direct Upload Option */}
            <input
              ref={fileAvatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleModalAvatarUpload}
            />
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                Foto do seu dispositivo
              </label>
              <button
                type="button"
                onClick={() => fileAvatarRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-[#1e1e1e] hover:bg-[#262626] border border-white/15 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#2f7dff]" />
                <span>Escolher foto de perfil (galeria / câmera)</span>
              </button>
              {avatarUrl && (
                <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-[#1e1e1e] border border-white/10">
                  <img src={avatarUrl} alt="Prévia" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-xs text-white/70">Foto selecionada pronta para salvar</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                Escolha um ícone / emoji
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {AVATAR_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setAvatarEmoji(em);
                      setAvatarUrl('');
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                      avatarEmoji === em && !avatarUrl
                        ? 'bg-white text-black scale-110 shadow-md font-bold'
                        : 'bg-[#1e1e1e] border border-white/10 text-white hover:bg-[#262626]'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Ou digite URL da foto
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        {/* NAME & BIO EDIT */}
        {profileEditField === 'name' && (
          <div className="space-y-3 text-xs">
            <label className="block">Título da página<input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground" /></label>
            <label className="block">Subtítulo<input value={sub} onChange={e => setSub(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground" /></label>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Nome do profissional ou estúdio
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white font-semibold focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Handle (@)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Bio curta
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Especialista em estética facial e visagismo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        {/* ABOUT EDIT */}
        {profileEditField === 'about' && (
          <div className="space-y-2 text-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
              Conte sua trajetória profissional e valores
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              placeholder="Descreva sua experiência, cursos, certificações e metodologia..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white leading-relaxed focus:outline-none focus:border-white/30 resize-none"
            />
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex gap-2 pt-4 border-t border-white/10 mt-5">
          <button
            type="button"
            onClick={() => setProfileEditField(null)}
            className="flex-1 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#262626] text-white/70 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
