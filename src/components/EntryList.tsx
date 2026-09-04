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
  SearchX,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const EntryList: React.FC = () => {
  const {
    entries,
    selectedEntryId,
    setSelectedEntryId,
    activeCategory,
    searchQuery,
    setSearchQuery,
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
      item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'secure_notes':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'cards':
        return <CreditCard className="w-4 h-4 text-indigo-400" />;
      case 'servers':
        return <Server className="w-4 h-4 text-purple-400" />;
      default:
        return <KeyRound className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatSubtitle = (item: (typeof entries)[0]) => {
    if (item.url) {
      try {
        const u = item.url.startsWith('http') ? item.url : `https://${item.url}`;
        const domain = new URL(u).hostname.replace(/^www\./, '');
        if (domain) return domain;
      } catch {
        // fallback
      }
    }
    if (item.username) return item.username;
    if (item.email) return item.email;
    if (item.category === 'secure_notes') return 'Secure Note';
    if (item.category === 'cards') return 'Card / License';
    if (item.category === 'servers') return 'Server / API';
    return 'No details';
  };

  const getCategoryLabel = () => {
    switch (activeCategory) {
      case 'all': return 'All Credentials';
      case 'favorites': return 'Favorites';
      case 'logins': return 'Logins';
      case 'secure_notes': return 'Secure Notes';
      case 'totp': return '2FA Authenticator';
      case 'cards': return 'Cards & Licenses';
      case 'servers': return 'Servers & APIs';
      case 'health': return 'Security Health';
      default: return 'Credentials';
    }
  };

  return (
    <div className="w-full h-full md:border-r border-slate-800/80 bg-slate-950/40 flex flex-col select-none">
      {/* List Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs font-medium bg-slate-950/60">
        <span className="font-semibold text-slate-200">{getCategoryLabel()}</span>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          {filteredEntries.length}
        </span>
      </div>

      {/* Items Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-850/60 pb-28 md:pb-4">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-500">
            {searchQuery ? (
              <>
                <SearchX className="w-8 h-8 mb-3 text-slate-600 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-300 mb-1">No matching results</p>
                <p className="text-xs text-slate-400 mb-4 max-w-[220px]">
                  No items match "{searchQuery}" in this view.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">No entries yet</p>
                <p className="text-xs text-slate-400 mb-4 max-w-[220px]">
                  Add your first credential to this category to get started.
                </p>
                <button
                  onClick={() => openEditor()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Item</span>
                </button>
              </>
            )}
          </div>
        ) : (
          filteredEntries.map((item) => {
            const isSelected = selectedEntryId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEntryId(item.id)}
                className={`p-3.5 sm:p-4 cursor-pointer transition-all flex items-center justify-between group relative min-h-[68px] ${
                  isSelected
                    ? 'bg-blue-600/15 text-white border-l-3 border-blue-500 shadow-sm'
                    : 'hover:bg-slate-900/50 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-slate-900 border border-blue-500/40 shadow-blue-500/10'
                        : 'bg-slate-900/90 border border-slate-800'
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold truncate text-white leading-snug">
                        {item.title}
                      </h3>
                      {item.favorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                      {formatSubtitle(item)}
                    </p>

                    {/* Tag Chips Preview */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
                        {item.tags.slice(0, 2).map((t, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 truncate max-w-[90px]"
                          >
                            #{t}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-xs text-slate-500">+{item.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  {item.totp_secret && (
                    <span title="2FA Authenticator Active">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4.5 h-4.5 text-slate-600 group-hover:translate-x-0.5 transition-all ${
                      isSelected ? 'text-blue-400 opacity-100' : 'opacity-40 group-hover:opacity-100'
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
