// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useApp } from '../context/AppContext';
import { Bell, ExternalLink, X, CheckCircle2, Calendar, Sparkles, Compass } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { profile, setIsStorefrontOpen, clients } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { supabase.auth.getSession().then(({data}) => setSignedIn(!!data.session)); const {data} = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session)); return () => data.subscription.unsubscribe(); }, []);
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-[#161616] border border-white/15 flex items-center justify-center font-bold text-lg text-white shadow-inner">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{profile.avatarEmoji || 'M'}</span>
            )}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#2f7dff] border-2 border-black"
              title="Online"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white tracking-tight truncate leading-tight">
              {profile.name}
            </h1>
            <p className="text-xs text-white/45 font-normal tracking-wide">{profile.handle || '@estudio'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/adm"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#162030] border border-sky-500/30 text-xs font-bold text-sky-400 hover:text-white hover:bg-sky-600/30 transition-all shadow-sm"
            title="Abrir mapa de prospecção Campinas (ADM)"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
            <span>Mapa ADM</span>
          </a>

          <button
            onClick={() => setIsStorefrontOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161616] border border-white/10 text-xs font-medium text-white/80 hover:text-white hover:bg-[#1e1e1e] transition-colors"
            title="Abrir site público para clientes"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#2f7dff]" />
            <span>Site público</span>
          </button>

          <button
            onClick={() => setShowNotifications(true)}
            aria-label="Notificações"
            className="relative w-10 h-10 rounded-full bg-[#161616] border border-white/15 flex items-center justify-center text-white/90 hover:bg-[#1e1e1e] hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2563eb]" />
          </button>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-full max-w-[420px] bg-[#161616] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00c2ff]" />
                <h3 className="text-base font-bold text-white">Notificações recentes</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Novo agendamento confirmado
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {clients[0]?.name || 'Ana Ferreira'} confirmou presença para {clients[0]?.service || 'Limpeza de pele'}.
                  </p>
                  <span className="text-[10px] text-white/40 mt-1 block">Há 25 minutos</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2f7dff]/20 text-[#2f7dff] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Lembrete de agenda de hoje</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    Você possui {clients.length} atendimentos agendados para hoje. Primeiro às 09:00.
                  </p>
                  <span className="text-[10px] text-white/40 mt-1 block">Hoje, 07:30</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-white/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffb020]/20 text-[#ffb020] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Studiolite no ar</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    Sua vitrine está pronta para personalizar. InfinitePay e Pix por API ficam em breve.
                  </p>
                  <span className="text-[10px] text-white/40 mt-1 block">Ontem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
