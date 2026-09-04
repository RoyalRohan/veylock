import React, { useRef } from 'react';
import { Search, Plus, Sparkles, X, Menu } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import logoImg from '../assets/logo.png';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, openEditor, setIsGeneratorOpen, setIsMobileNavOpen } = useVault();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="h-14 border-b border-theme-border px-3 sm:px-6 flex items-center justify-between gap-2.5 bg-theme-surface/70 backdrop-blur-xl shrink-0 select-none pt-safe text-theme-text">
      {/* Mobile Drawer Hamburger Button & Brand Logo */}
      <div className="flex items-center gap-2.5 md:hidden shrink-0">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="p-2.5 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-border text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Open Navigation Drawer"
        >
          <Menu className="w-4.5 h-4.5 text-blue-400" />
        </button>
        <img
          src={logoImg}
          alt="Veylock"
          className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-white/10"
        />
      </div>

      {/* Search Input with Clear Button */}
      <div className="relative flex-1 max-w-md lg:w-84 min-w-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
        <input
          ref={searchInputRef}
          id="vault-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search items, tags, usernames..."
          className="w-full input-themed rounded-xl pl-9 pr-8 sm:pr-14 py-2 sm:py-2.5 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner shadow-black/10 min-h-[44px]"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-theme-text-muted hover:text-theme-text hover:bg-theme-hover transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Clear search (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-theme-text-muted bg-theme-surface px-1.5 py-0.5 rounded border border-theme-border pointer-events-none">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setIsGeneratorOpen(true)}
          title={`Generate Password (${isMac ? '⌘G' : 'Ctrl+G'})`}
          className="flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-theme-surface hover:bg-theme-hover border border-theme-border text-theme-text text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer group min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Generator</span>
        </button>

        <button
          onClick={() => openEditor()}
          title={`New Item (${isMac ? '⌘N' : 'Ctrl+N'})`}
          className="flex items-center gap-1.5 p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-98 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Entry</span>
        </button>
      </div>
    </header>
  );
};
