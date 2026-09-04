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
    success: 'border-emerald-500/30 bg-[#071a12]/95 text-emerald-200 shadow-emerald-950/40',
    error: 'border-rose-500/30 bg-[#1c080d]/95 text-rose-200 shadow-rose-950/40',
    warning: 'border-amber-500/30 bg-[#1c1306]/95 text-amber-200 shadow-amber-950/40',
    info: 'border-blue-500/30 bg-[#071324]/95 text-blue-200 shadow-blue-950/40',
  };

  const type = toast.type || 'info';

  return (
    <div className="fixed bottom-5 right-5 z-55 animate-toast-slide-in max-w-sm pointer-events-none">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${borders[type]}`}>
        {icons[type]}
        <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};
