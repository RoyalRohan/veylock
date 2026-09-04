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
  Server,
  X,
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
    healthReport,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useVault();

  const getCount = (cat: CategoryType) => {
    if (cat === 'all') return entries.length;
    if (cat === 'favorites') return entries.filter((e) => e.favorite).length;
    if (cat === 'totp') return entries.filter((e) => Boolean(e.totp_secret)).length;
    return entries.filter((e) => e.category === cat).length;
  };

  const navItems: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Layers className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" /> },
    { id: 'logins', label: 'Logins', icon: <KeyRound className="w-4 h-4 text-blue-400" /> },
    { id: 'secure_notes', label: 'Secure Notes', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    { id: 'totp', label: 'Authenticator (2FA)', icon: <Clock className="w-4 h-4 text-cyan-400" /> },
    { id: 'cards', label: 'Cards & Licenses', icon: <CreditCard className="w-4 h-4 text-indigo-400" /> },
    { id: 'servers', label: 'Servers & APIs', icon: <Server className="w-4 h-4 text-purple-400" /> },
    { id: 'health', label: 'Security Audit', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
  ];

  const handleNavClick = (id: CategoryType) => {
    setActiveCategory(id);
    setIsMobileNavOpen(false);
    if (id === 'health') {
      fetchHealthReport();
    }
  };

  const totalVulnerabilities = healthReport
    ? healthReport.weak_passwords + healthReport.reused_passwords
    : 0;

  const renderSidebarBody = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm">Veylock</h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              lockVault();
              if (isMobile) setIsMobileNavOpen(false);
            }}
            title="Lock Vault Now"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>

          {isMobile && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Close Menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 block">Categories</span>
        {navItems.map((item) => {
          const count = getCount(item.id);
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-blue-600/15 text-white shadow-sm border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.id === 'health' ? (
                totalVulnerabilities > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
                    {totalVulnerabilities} alert{totalVulnerabilities > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    Secure
                  </span>
                )
              ) : (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                    isActive
                      ? 'bg-blue-500/25 text-blue-200 font-bold border border-blue-500/30'
                      : 'bg-slate-900/60 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status, Backup & Settings */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950/80 pb-safe">
        <button
          onClick={() => {
            setIsImportExportOpen(true);
            if (isMobile) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
        >
          <HardDriveDownload className="w-3.5 h-3.5 text-blue-400" />
          <span>Backup & Restore</span>
        </button>

        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (isMobile) setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Preferences</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex w-64 bg-slate-950/70 backdrop-blur-xl border-r border-slate-800/80 flex-col h-full select-none shrink-0">
        {renderSidebarBody(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] h-full bg-slate-950/95 border-r border-slate-800 shadow-2xl flex flex-col z-10 animate-scale-up">
            {renderSidebarBody(true)}
          </div>
        </div>
      )}
    </>
  );
};
