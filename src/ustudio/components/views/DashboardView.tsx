// @ts-nocheck -- ported as-is from the original AI Studio project
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [range, setRange] = useState<'dia' | 'semana' | 'mes'>('dia');

  // Metrics based on range
  const dataMap = {
    dia: {
      revenue: 'R$ 400',
      count: '3',
      avg: 'R$ 133',
      bars: [30, 45, 60, 90, 75, 40],
      labels: ['09h', '11h', '13h', '15h', '17h', '19h'],
      forecast: 'R$ 480 estimado para amanhã (+20% com 4 vagas preenchidas)',
    },
    semana: {
      revenue: 'R$ 2.450',
      count: '18',
      avg: 'R$ 136',
      bars: [45, 70, 85, 60, 95, 80, 20],
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      forecast: 'R$ 2.800 projetado para a próxima semana com campanhas ativas',
    },
    mes: {
      revenue: 'R$ 11.200',
      count: '84',
      avg: 'R$ 133',
      bars: [55, 65, 80, 95],
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      forecast: 'R$ 12.500 no próximo mês com taxa de retorno de 78%',
    },
  };

  const currentData = dataMap[range];

  return (
    <div className="px-5 space-y-5">
      {/* Top Header */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('services')}
            className="w-9 h-9 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Voltar para serviços"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">Dashboard financeiro</h2>
        </div>

        {/* Range Segmented Control */}
        <div className="inline-flex p-1 bg-[#161616] border border-white/10 rounded-full w-full max-w-[280px]">
          <button
            onClick={() => setRange('dia')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              range === 'dia' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setRange('semana')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              range === 'semana' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setRange('mes')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              range === 'mes' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Faturamento
            </span>
            <DollarSign className="w-3.5 h-3.5 text-[#34c281]" />
          </div>
          <span className="text-base font-extrabold text-white tracking-tight">
            {currentData.revenue}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Atendimentos
            </span>
            <Users className="w-3.5 h-3.5 text-[#2f7dff]" />
          </div>
          <span className="text-base font-extrabold text-white tracking-tight">
            {currentData.count}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Ticket médio
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#ffb020]" />
          </div>
          <span className="text-base font-extrabold text-white tracking-tight">
            {currentData.avg}
          </span>
        </div>
      </div>

      {/* Interactive Visual Chart */}
      <div className="p-4 rounded-3xl bg-[#161616] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Volume de vendas & atendimentos
          </span>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            +14% vs período anterior
          </span>
        </div>

        <div className="relative h-40 w-full pt-3">
          <svg viewBox="0 0 320 120" className="h-[120px] w-full overflow-visible" role="img" aria-label="Evolução de vendas e atendimentos em linhas neon">
            <defs>
              <filter id="neon-glow" x="-20%" y="-30%" width="140%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="neon-stroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="neon-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[20, 50, 80, 110].map((y) => (
              <line key={y} x1="8" x2="312" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            ))}

            {/* Neon Area Fill */}
            {(() => {
              const pts = currentData.bars.map(
                (value, index) =>
                  `${8 + index * (304 / Math.max(1, currentData.bars.length - 1))},${112 - value}`
              );
              const firstX = 8;
              const lastX = 312;
              const areaPoints = `${firstX},112 ${pts.join(' ')} ${lastX},112`;
              return <polygon points={areaPoints} fill="url(#neon-area-gradient)" />;
            })()}

            {/* Neon Outer Halo / Glow Line */}
            <polyline
              points={currentData.bars
                .map(
                  (value, index) =>
                    `${8 + index * (304 / Math.max(1, currentData.bars.length - 1))},${112 - value}`
                )
                .join(' ')}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
              filter="url(#neon-glow)"
            />

            {/* Neon Core Crisp Line (Sem pins no gráfico) */}
            <polyline
              points={currentData.bars
                .map(
                  (value, index) =>
                    `${8 + index * (304 / Math.max(1, currentData.bars.length - 1))},${112 - value}`
                )
                .join(' ')}
              fill="none"
              stroke="url(#neon-stroke-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-between px-1 mt-1">
            {currentData.labels.map((label) => (
              <span key={label} className="text-[10px] font-medium text-white/40">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Card */}
      <div className="p-4 rounded-3xl bg-[#1e1e1e] border border-white/10 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#ffb020]/20 text-[#ffb020] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1">
            Previsão inteligente
          </span>
          <p className="text-sm font-semibold text-white leading-snug">
            {currentData.forecast}
          </p>
          <span className="text-xs text-white/50 block mt-1">
            Cálculo baseado no histórico de comparecimento e taxa de retorno dos clientes fidelizados.
          </span>
        </div>
      </div>

      {/* Top Services ranking */}
      <div className="p-4 rounded-3xl bg-[#161616] border border-white/10 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          Mais procurados neste período
        </span>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span className="font-semibold text-white">Limpeza de pele profunda</span>
            </div>
            <span className="font-bold text-white">R$ 1.260 (7 atendimentos)</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span className="font-semibold text-white">Massagem relaxante</span>
            </div>
            <span className="font-bold text-white">R$ 750 (5 atendimentos)</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span className="font-semibold text-white">Design de sobrancelhas</span>
            </div>
            <span className="font-bold text-white">R$ 420 (6 atendimentos)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
