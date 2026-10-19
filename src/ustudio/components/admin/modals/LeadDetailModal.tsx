import React from 'react';
import { ProspectLead } from '../adminTypes';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Car,
  Scissors,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: ProspectLead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: ProspectLead['status']) => void;
  onConvertToSubscriber: (lead: ProspectLead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onConvertToSubscriber,
}) => {
  if (!lead) return null;

  const isAuto = lead.category === 'estetica_automotiva';
  const cleanPhone = lead.phone.replace(/\D/g, '');
  const whatsUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá ${lead.contactPerson}! Sou da equipe Ustudio em Campinas. Vi o trabalho excelente do ${lead.name} no bairro ${lead.bairro} e gostaria de apresentar a plataforma mobile de agendamentos.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0]">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f3] text-[#141414] text-[10px] font-semibold flex items-center gap-1">
                {isAuto ? <Car className="w-3 h-3" /> : <Scissors className="w-3 h-3" />}
                <span>{isAuto ? 'Estética automotiva' : 'Barbearia'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f3f3f3] text-[#707070] text-[10px] font-semibold">
                {lead.bairro}
              </span>
              {lead.isSubscriber && (
                <span className="px-2 py-0.5 rounded-full bg-[#0066ff] text-white text-[9px] font-extrabold uppercase">
                  Assinante Ativo
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#141414] tracking-tight">
              {lead.name}
            </h3>
            <p className="text-xs text-[#707070]">
              Responsável: <b className="text-[#141414]">{lead.contactPerson}</b>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#707070] hover:text-[#141414] flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Status Selector */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#707070] block mb-1.5">
            Status no funil de prospecção
          </label>
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {[
              { id: 'novo', label: 'Novo' },
              { id: 'em_contato', label: 'Em Contato' },
              { id: 'apresentacao', label: 'Apresentação' },
              { id: 'proposta', label: 'Proposta' },
              { id: 'convertido', label: 'Convertido' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onUpdateStatus(lead.id, st.id as any)}
                className={`h-8 rounded-full font-semibold transition-all ${
                  lead.status === st.id
                    ? 'bg-[#141414] text-white'
                    : 'bg-[#f3f3f3] text-[#707070] hover:text-[#141414]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-[16px] bg-[#f9f9f9] border border-[#f0f0f0] space-y-1">
            <span className="text-[10px] font-semibold text-[#707070] uppercase">
              Endereço em Campinas
            </span>
            <p className="font-medium text-[#141414]">{lead.address}</p>
            <span className="text-[10px] text-[#707070] block">
              Coordenadas: {lead.coordinates[1].toFixed(4)}, {lead.coordinates[0].toFixed(4)}
            </span>
          </div>

          <div className="p-3 rounded-[16px] bg-[#f9f9f9] border border-[#f0f0f0] space-y-1">
            <span className="text-[10px] font-semibold text-[#707070] uppercase">
              Diagnóstico / Oportunidade
            </span>
            <p className="text-[#262626] leading-relaxed">{lead.potential}</p>
          </div>

          {lead.notes && (
            <div className="p-3 rounded-[16px] bg-[#f9f9f9] border border-[#f0f0f0] space-y-1">
              <span className="text-[10px] font-semibold text-[#707070] uppercase">
                Anotações comerciais
              </span>
              <p className="text-[#707070] leading-relaxed italic">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <a
            href={whatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-full bg-[#141414] text-[#ffffff] font-semibold text-xs hover:bg-[#262626] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Conversar no WhatsApp ({lead.phone})</span>
          </a>

          {!lead.isSubscriber ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onConvertToSubscriber(lead);
              }}
              className="w-full h-11 rounded-full bg-[#0066ff] hover:bg-[#0055dd] text-[#ffffff] font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ativar Assinatura & Gerar Pix SyncPay</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-center font-bold text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assinante Ativo ({lead.planName || 'Plano Pro Studio'})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
