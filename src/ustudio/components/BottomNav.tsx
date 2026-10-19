// @ts-nocheck -- ported as-is from the original AI Studio project
import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Sparkles, Plus, Calendar, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickActionOpen } = useApp();

  return (
    <div className="sticky bottom-4 z-40 px-4 mt-8 pointer-events-none">
      <nav className="pointer-events-auto max-w-[400px] mx-auto bg-[#161616]/95 backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5 flex items-center justify-between shadow-2xl shadow-black/80">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-full flex-1 transition-all ${
            activeTab === 'home'
              ? 'text-white bg-[#1e1e1e] font-semibold'
              : 'text-white/45 hover:text-white/80'
          }`}
        >
          <Home className="w-[18px] h-[18px]" />
          <span className="text-[10px] tracking-tight">Início</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-full flex-1 transition-all ${
            activeTab === 'services' || activeTab === 'dashboard'
              ? 'text-white bg-[#1e1e1e] font-semibold'
              : 'text-white/45 hover:text-white/80'
          }`}
        >
          <Sparkles className="w-[18px] h-[18px]" />
          <span className="text-[10px] tracking-tight">Serviços</span>
        </button>

        <button
          onClick={() => setIsQuickActionOpen(true)}
          aria-label="Ações rápidas"
          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 mx-1 shadow-lg hover:bg-white/90 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-full flex-1 transition-all ${
            activeTab === 'agenda'
              ? 'text-white bg-[#1e1e1e] font-semibold'
              : 'text-white/45 hover:text-white/80'
          }`}
        >
          <Calendar className="w-[18px] h-[18px]" />
          <span className="text-[10px] tracking-tight">Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-full flex-1 transition-all ${
            activeTab === 'profile'
              ? 'text-white bg-[#1e1e1e] font-semibold'
              : 'text-white/45 hover:text-white/80'
          }`}
        >
          <User className="w-[18px] h-[18px]" />
          <span className="text-[10px] tracking-tight">Perfil</span>
        </button>
      </nav>
    </div>
  );
};
