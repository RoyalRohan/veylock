import React, { useRef } from 'react';
import { Search, Plus, Sparkles, X } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, openEditor, setIsGeneratorOpen } = useVault();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-950/60 backdrop-blur-xl shrink-0 select-none">
      {/* Search Input with Clear Button */}
      <div className="relative w-84">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          id="vault-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search items, tags, usernames, URLs..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9.5 pr-14 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner shadow-black/20"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear search (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60 pointer-events-none">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsGeneratorOpen(true)}
          title={`Generate Password (${isMac ? '⌘G' : 'Ctrl+G'})`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-medium transition-all shadow-sm hover:border-slate-700 cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>Generator</span>
        </button>

        <button
          onClick={() => openEditor()}
          title={`New Item (${isMac ? '⌘N' : 'Ctrl+N'})`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
};
