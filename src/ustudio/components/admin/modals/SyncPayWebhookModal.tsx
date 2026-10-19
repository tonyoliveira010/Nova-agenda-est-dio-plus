import React, { useState, useEffect } from 'react';
import { ProspectLead, SyncPayConfig } from '../adminTypes';
import {
  X,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ShieldCheck,
  Check,
  Send,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface SyncPayWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SyncPayConfig;
  prospects: ProspectLead[];
  onWebhookSuccess: (leadId: string, amount: number) => void;
  onUpdateConfig?: (newConfig: SyncPayConfig) => void;
}

export const SyncPayWebhookModal: React.FC<SyncPayWebhookModalProps> = ({
  isOpen,
  onClose,
  config,
  prospects,
  onWebhookSuccess,
  onUpdateConfig,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [simulatedAmount, setSimulatedAmount] = useState<number>(149.0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [timerCount, setTimerCount] = useState<number>(5);
  const [logResponse, setLogResponse] = useState<string | null>(null);

  useEffect(() => {
    if (prospects.length > 0 && !selectedLeadId) {
      setSelectedLeadId(prospects[0].id);
    }
    setStatus('idle');
    setLogResponse(null);
  }, [isOpen, prospects]);

  if (!isOpen) return null;

  const targetLead = prospects.find((p) => p.id === selectedLeadId) || prospects[0];

  const payload = {
    event: 'cashin.updated',
    identifier: `sync_px_${Date.now().toString(36)}`,
    status: 'PAID',
    transaction_amount: simulatedAmount,
    pix_key: config.pixKey || 'tonyfilho911@gmail.com',
    payer: {
      name: targetLead?.name || 'Estabelecimento Campinas',
      document: '24.912.441/0001-90',
      phone: targetLead?.phone || '(19) 99876-5432',
    },
    callbackUrl: config.webhookUrl,
    timeout_seconds: 5,
    timestamp: new Date().toISOString(),
  };

  const handleRunSimulation = () => {
    setStatus('testing');
    setTimerCount(5);
    setLogResponse(null);

    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setTimerCount(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setStatus('success');
        setLogResponse(
          JSON.stringify(
            {
              status: 200,
              message: 'CashIn OnUpdate webhook processed successfully',
              access_granted: true,
              subscriber_id: targetLead?.id || 'lead_sub',
              plan_activated: 'Plano Pro Studio',
              next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            },
            null,
            2
          )
        );

        if (targetLead) {
          onWebhookSuccess(targetLead.id, simulatedAmount);
        }
      }
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0]">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-[#141414] text-white text-[10px] font-bold">
                Integração SyncPay API Pix
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Ativa
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#141414] tracking-tight">
              Integração SyncPay API Pix
            </h3>
            <a
              href="https://api.syncpayments.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0066ff] hover:underline font-mono inline-flex items-center gap-1"
              title="Acessar documentação oficial da SyncPay"
            >
              <span>https://api.syncpayments.com.br/</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#707070] hover:text-[#141414] flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SyncPay Integration Configuration Fields */}
        <div className="p-4 rounded-[20px] bg-[#f8f8f8] border border-[#ebebeb] space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] block mb-1">
              Chave Pix padrão para recebimento
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={config.pixKey}
                onChange={(e) => {
                  if (onUpdateConfig) {
                    onUpdateConfig({ ...config, pixKey: e.target.value });
                  }
                }}
                className="flex-1 h-9 px-3.5 rounded-full bg-[#ffffff] text-[#141414] font-semibold text-xs border border-[#e0e0e0] focus:outline-none focus:border-[#141414]"
                placeholder="tonyfilho911@gmail.com"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(config.pixKey);
                  setCopiedPixKey(true);
                  setTimeout(() => setCopiedPixKey(false), 2000);
                }}
                className="h-9 px-3 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
              >
                {copiedPixKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPixKey ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] block mb-1">
              Webhook URL de Retorno (CashIn OnUpdate)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={config.webhookUrl}
                className="flex-1 h-9 px-3 rounded-full bg-[#ffffff] text-[#555555] font-mono text-[10px] border border-[#e0e0e0] select-all truncate"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(config.webhookUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="h-9 px-3 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Timeout Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Timeout padrão SyncPay: 5 segundos. Aciona evento no CashIn pago.</span>
          </div>

          {/* Automatic Access Release */}
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e0e0e0] cursor-pointer">
            <span className="font-semibold text-[#141414] text-xs">
              Liberar acesso da plataforma automaticamente ao receber webhook
            </span>
            <input
              type="checkbox"
              checked={config.autoActivateOnWebhook}
              onChange={(e) => {
                if (onUpdateConfig) {
                  onUpdateConfig({ ...config, autoActivateOnWebhook: e.target.checked });
                }
              }}
              className="w-4 h-4 rounded accent-[#141414] cursor-pointer"
            />
          </label>
        </div>

        {/* Lead Selection for Testing */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#141414] block mb-1">
              Selecionar Estabelecimento para o Teste
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              disabled={status === 'testing'}
              className="w-full h-10 px-3.5 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium focus:outline-none"
            >
              {prospects.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.bairro}) {lead.isSubscriber ? '· Já Assinante' : '· Prospect'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#141414] block mb-1">
              Valor da Transação Pix (R$)
            </label>
            <input
              type="number"
              value={simulatedAmount}
              onChange={(e) => setSimulatedAmount(parseFloat(e.target.value) || 0)}
              disabled={status === 'testing'}
              className="w-full h-10 px-3.5 rounded-full bg-[#f5f5f5] text-[#141414] border border-[#e5e5e5] text-xs font-medium"
            />
          </div>

          {/* Code Payload Viewer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-[#707070] flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                Payload do Webhook (JSON)
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                  alert('Payload copiado!');
                }}
                className="text-[10px] text-[#0066ff] font-semibold hover:underline"
              >
                Copiar JSON
              </button>
            </div>
            <pre className="p-3 rounded-[16px] bg-[#141414] text-[#a0ffa0] font-mono text-[10px] overflow-x-auto max-h-36">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Live Simulation Progress */}
        {status === 'testing' && (
          <div className="p-3.5 rounded-[18px] bg-[#f0f6ff] border border-[#0066ff]/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0066ff] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0066ff]" />
                Aguardando resposta do Webhook...
              </span>
              <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded-full border border-[#0066ff]/20 text-[#0066ff]">
                {timerCount}s restantes
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#dbeafe] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0066ff] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - timerCount) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#707070]">
              Disparando requisição POST para o webhook com status: "PAID".
            </p>
          </div>
        )}

        {/* Success Output */}
        {status === 'success' && (
          <div className="p-3.5 rounded-[18px] bg-emerald-50 border border-emerald-300 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Webhook Processado com Sucesso (HTTP 200 OK)</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-snug">
              O pagamento via Pix foi validado e o estabelecimento{' '}
              <b>{targetLead?.name}</b> agora possui o selo de <b>Assinante Ativo</b> na plataforma!
            </p>
            {logResponse && (
              <pre className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-mono text-[9px] overflow-x-auto">
                {logResponse}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#f0f0f0]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-[#f3f3f3] hover:bg-[#e0e0e0] text-[#141414] font-semibold text-xs transition-colors"
          >
            {status === 'success' ? 'Fechar' : 'Cancelar'}
          </button>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={status === 'testing'}
            className="flex-1 h-11 rounded-full bg-[#141414] hover:bg-[#262626] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {status === 'testing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulando ({timerCount}s)...</span>
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Testar Novamente</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Disparar Webhook</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
