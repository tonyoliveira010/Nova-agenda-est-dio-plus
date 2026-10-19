import { useApp } from '../../context/AppContext';
import { Button } from '@/components/ui/button';
import { X, CreditCard } from 'lucide-react';
export const PaymentConfigModal = () => {
  const { isPaymentConfigOpen, setIsPaymentConfigOpen } = useApp();
  if (!isPaymentConfigOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/90 p-4 sm:items-center" onClick={() => setIsPaymentConfigOpen(false)}><div className="w-full max-w-[430px] space-y-5 rounded-2xl border border-border bg-secondary p-5" onClick={e => e.stopPropagation()}><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /><h3 className="flex-1 font-semibold">Configurar pagamentos</h3><Button variant="ghost" size="icon" aria-label="Fechar" onClick={() => setIsPaymentConfigOpen(false)}><X /></Button></div>{['Pix via API · SyncPayments', 'InfinitePay', 'Sinal de agendamento', 'Cupons'].map(label => <div key={label} className="flex items-center justify-between border-b border-border py-3 text-sm"><span>{label}</span><span className="text-xs text-muted-foreground">Em breve</span></div>)}<p className="text-sm text-muted-foreground">O Pix com valor e código copia e cola está disponível no Perfil. Não há confirmação automática de pagamento.</p><Button className="w-full" onClick={() => setIsPaymentConfigOpen(false)}>Fechar</Button></div></div>;
};
