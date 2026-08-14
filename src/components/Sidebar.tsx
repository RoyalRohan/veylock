import React from 'react';
import {
  Shield,
  KeyRound,
  Star,
  FileText,
  Clock,
  ShieldAlert,
  Settings,
  Lock,
  HardDriveDownload,
  CreditCard,
  Layers,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { CategoryType } from '../types';

export const Sidebar: React.FC = () => {
  const {
    entries,
    activeCategory,
    setActiveCategory,
    lockVault,
    setIsSettingsOpen,
    setIsImportExportOpen,
    fetchHealthReport,
  } = useVault();

  const getCount = (cat: CategoryType) => {
    if (cat === 'all') return entries.length;
    if (cat === 'favorites') return entries.filter((e) => e.favorite).length;
    if (cat === 'totp') return entries.filter((e) => Boolean(e.totp_secret)).length;
    return entries.filter((e) => e.category === cat).length;
  };

  const navItems: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Layers className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-4 h-4 text-amber-400" /> },
    { id: 'logins', label: 'Logins', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'secure_notes', label: 'Secure Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'totp', label: 'Authenticator (TOTP)', icon: <Clock className="w-4 h-4 text-cyan-400" /> },
    { id: 'cards', label: 'Cards & Keys', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'health', label: 'Security Audit', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
  ];

  const handleNavClick = (id: CategoryType) => {
    setActiveCategory(id);
    if (id === 'health') {
      fetchHealthReport();
    }
  };

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 p-[1px] shadow-md shadow-brand-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base leading-none">Veylock</h1>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider">LOCAL VAULT</span>
          </div>
        </div>

        <button
          onClick={lockVault}
          title="Lock Vault (Ctrl+L)"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Categories</div>
        {navItems.map((item) => {
          const count = getCount(item.id);
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.id !== 'health' && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-brand-500/30 text-brand-200' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Settings & Backup */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950">
        <button
          onClick={() => setIsImportExportOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <HardDriveDownload className="w-4 h-4 text-slate-400" />
          <span>Backup & Restore</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
