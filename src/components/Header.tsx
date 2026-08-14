import React from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, openEditor, setIsGeneratorOpen } = useVault();

  return (
    <header className="h-14 border-b border-slate-900 px-6 flex items-center justify-between bg-[#070a13]/80 backdrop-blur-md shrink-0">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="vault-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items, notes, URLs... (⌘K)"
          className="w-full bg-[#0d1222]/90 border border-slate-900 rounded-xl pl-9 pr-10 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
          ⌘K
        </kbd>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsGeneratorOpen(true)}
          title="Password Generator (Ctrl+G)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1222]/90 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Generator</span>
        </button>

        <button
          onClick={() => openEditor()}
          title="New Entry (Ctrl+N)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-medium transition-all shadow-md shadow-blue-600/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
};
