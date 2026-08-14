import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const Toast: React.FC = () => {
  const { toast } = useVault();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-200',
    warning: 'border-amber-500/30 bg-amber-950/80 text-amber-200',
    info: 'border-blue-500/30 bg-blue-950/80 text-blue-200',
  };

  const type = toast.type || 'info';

  return (
    <div className="fixed bottom-5 right-5 z-55 animate-toast-slide-in max-w-sm">
      <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-md shadow-lg ${borders[type]}`}>
        {icons[type]}
        <span className="text-xs font-semibold">{toast.message}</span>
      </div>
    </div>
  );
};
