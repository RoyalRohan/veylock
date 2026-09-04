import React from 'react';
import { Layers, Star, Clock, ShieldAlert, Menu } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const MobileBottomBar: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    setSelectedEntryId,
    setIsMobileNavOpen,
    fetchHealthReport,
    healthReport,
  } = useVault();

  const totalVulnerabilities = healthReport
    ? healthReport.weak_passwords + healthReport.reused_passwords
    : 0;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shrink-0 flex items-center justify-around px-2 py-1.5 z-30 pb-safe select-none shadow-lg"
    >
      {/* 1. Vault Items */}
      <button
        onClick={() => {
          setActiveCategory('all');
          setSelectedEntryId(null);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeCategory === 'all'
            ? 'text-blue-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Vault</span>
      </button>

      {/* 2. Favorites */}
      <button
        onClick={() => {
          setActiveCategory('favorites');
          setSelectedEntryId(null);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeCategory === 'favorites'
            ? 'text-amber-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Star className={`w-4 h-4 ${activeCategory === 'favorites' ? 'fill-amber-400/30' : ''}`} />
        <span className="text-[10px] tracking-tight">Favorites</span>
      </button>

      {/* 3. 2FA Authenticator */}
      <button
        onClick={() => {
          setActiveCategory('totp');
          setSelectedEntryId(null);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeCategory === 'totp'
            ? 'text-cyan-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">2FA</span>
      </button>

      {/* 4. Security Health Audit */}
      <button
        onClick={() => {
          setActiveCategory('health');
          fetchHealthReport();
          setSelectedEntryId(null);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
          activeCategory === 'health'
            ? 'text-rose-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShieldAlert className="w-4 h-4" />
          {totalVulnerabilities > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-slate-950" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">Audit</span>
      </button>

      {/* 5. More / Categories Drawer */}
      <button
        onClick={() => setIsMobileNavOpen(true)}
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
};
