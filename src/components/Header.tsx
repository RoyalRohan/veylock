import React from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, openEditor, setIsGeneratorOpen } = useVault();

  return (
    <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-950/60 backdrop-blur-md shrink-0">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="vault-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search credentials, notes, URLs... (Ctrl+K)"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
          ⌘K
        </kbd>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsGeneratorOpen(true)}
          title="Password Generator (Ctrl+G)"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Generator</span>
        </button>

        <button
          onClick={() => openEditor()}
          title="New Entry (Ctrl+N)"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
};
