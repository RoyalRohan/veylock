import React, { useRef } from 'react';
import { Search, Plus, Sparkles, X, Menu } from 'lucide-react';
import { useVault } from '../context/VaultContext';

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
    <header className="h-14 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between gap-2.5 bg-slate-950/60 backdrop-blur-xl shrink-0 select-none pt-safe">
      {/* Mobile Drawer Hamburger Button */}
      <button
        onClick={() => setIsMobileNavOpen(true)}
        className="md:hidden p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
        title="Open Navigation Drawer"
      >
        <Menu className="w-4 h-4 text-blue-400" />
      </button>

      {/* Search Input with Clear Button */}
      <div className="relative flex-1 max-w-md lg:w-84 min-w-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          id="vault-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search items, tags, usernames..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8.5 pr-8 sm:pr-14 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner shadow-black/20"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear search (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60 pointer-events-none">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setIsGeneratorOpen(true)}
          title={`Generate Password (${isMac ? '⌘G' : 'Ctrl+G'})`}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium transition-all shadow-sm hover:border-slate-700 cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Generator</span>
        </button>

        <button
          onClick={() => openEditor()}
          title={`New Item (${isMac ? '⌘N' : 'Ctrl+N'})`}
          className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Entry</span>
        </button>
      </div>
    </header>
  );
};
