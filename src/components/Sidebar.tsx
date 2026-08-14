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
    { id: 'all', label: 'All Items', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" /> },
    { id: 'logins', label: 'Logins', icon: <KeyRound className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'secure_notes', label: 'Secure Notes', icon: <FileText className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'totp', label: 'Authenticator (TOTP)', icon: <Clock className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'cards', label: 'Cards & Keys', icon: <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'health', label: 'Security Audit', icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> },
  ];

  const handleNavClick = (id: CategoryType) => {
    setActiveCategory(id);
    if (id === 'health') {
      fetchHealthReport();
    }
  };

  return (
    <aside className="w-60 bg-[#0d1222]/95 border-r border-slate-900 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-[1px] shadow-sm shadow-blue-500/15">
            <div className="w-full h-full bg-[#070a13] rounded-[11px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm leading-none">Veylock</h1>
            <span className="text-[9px] text-cyan-400 font-mono tracking-wider">LOCAL PASSBOOK</span>
          </div>
        </div>

        <button
          onClick={lockVault}
          title="Lock Vault (Ctrl+L)"
          className="p-1.5 rounded-lg bg-[#070a13] hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const count = getCount(item.id);
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900/90 text-white shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.id !== 'health' && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-blue-950 text-blue-300 border border-blue-900/30' : 'bg-slate-950/60 text-slate-500'
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
      <div className="p-3 border-t border-slate-900 space-y-1 bg-[#0d1222]/90">
        <button
          onClick={() => setIsImportExportOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition-colors cursor-pointer"
        >
          <HardDriveDownload className="w-3.5 h-3.5 text-slate-400" />
          <span>Backup & Restore</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
