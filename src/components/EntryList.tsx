import React from 'react';
import {
  KeyRound,
  FileText,
  CreditCard,
  Server,
  Star,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const EntryList: React.FC = () => {
  const {
    entries,
    selectedEntryId,
    setSelectedEntryId,
    activeCategory,
    searchQuery,
    openEditor,
  } = useVault();

  // Filter entries based on active category & search query
  const filteredEntries = entries.filter((item) => {
    // Category match
    if (activeCategory === 'favorites' && !item.favorite) return false;
    if (activeCategory === 'totp' && !item.totp_secret) return false;
    if (
      activeCategory !== 'all' &&
      activeCategory !== 'favorites' &&
      activeCategory !== 'totp' &&
      activeCategory !== 'health' &&
      item.category !== activeCategory
    ) {
      return false;
    }

    // Search query match (Title, Username, Email, URL, Category, Tags)
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'secure_notes':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cards':
        return <CreditCard className="w-3.5 h-3.5 text-indigo-400" />;
      case 'servers':
        return <Server className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <KeyRound className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="w-72 border-r border-slate-900 bg-[#070a13]/30 flex flex-col h-full select-none">
      <div className="px-4 py-2 border-b border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span>{filteredEntries.length} Items</span>
        <span>{activeCategory.replace('_', ' ')}</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center h-60 text-slate-500">
            <KeyRound className="w-6 h-6 mb-3 stroke-[1.5] text-slate-600" />
            <p className="text-xs font-semibold text-slate-400 mb-1">No credentials found</p>
            <p className="text-[10px] text-slate-600 mb-4">Add your first secret or adjust your search.</p>
            <button
              onClick={() => openEditor()}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        ) : (
          filteredEntries.map((item) => {
            const isSelected = selectedEntryId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEntryId(item.id)}
                className={`p-3.5 cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-slate-900/80 border-l-2 border-blue-500 text-white'
                    : 'hover:bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-slate-950 border border-blue-900/30'
                        : 'bg-[#0d1222] border border-slate-800'
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-semibold truncate text-white leading-tight">{item.title}</h3>
                      {item.favorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.username || item.email || item.url || (item.notes ? 'Secure Note' : 'Empty')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {item.totp_secret && (
                    <span title="Has TOTP 2FA">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-slate-700 group-hover:translate-x-0.5 transition-transform ${
                      isSelected ? 'text-blue-400' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
