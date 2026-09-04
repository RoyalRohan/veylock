import React, { useState } from 'react';
import {
  KeyRound,
  Star,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  User,
  Mail,
  Globe,
  Shield,
  Calendar,
  Lock,
  Check,
  FileText,
  CreditCard,
  Server,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { TotpViewer } from './TotpViewer';
import { calculatePasswordStrength, calculateEntropy } from '../utils/cryptoUtils';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Tag, ChevronLeft } from 'lucide-react';

export const EntryDetail: React.FC = () => {
  const { entries, selectedEntryId, setSelectedEntryId, openEditor, deleteEntry, copyToClipboard, saveEntry } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleCustomFields, setVisibleCustomFields] = useState<Record<string, boolean>>({});

  const entry = entries.find((e) => e.id === selectedEntryId);

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070a13]/20 select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#0d1222]/80 border border-slate-800/80 flex items-center justify-center mb-3 shadow-inner text-slate-500">
          <Shield className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1 tracking-tight">No Item Selected</h3>
        <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
          Select an entry from the list to view decrypted details or manage credentials.
        </p>
      </div>
    );
  }

  const strength = calculatePasswordStrength(entry.password);
  const entropy = calculateEntropy(entry.password);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleFavorite = () => {
    saveEntry({ ...entry, favorite: !entry.favorite }, true);
  };

  const handleOpenUrl = async () => {
    if (!entry.url) return;
    let validUrl = entry.url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    try {
      const parsed = new URL(validUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return;
      }
      await openUrl(validUrl);
    } catch {
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'secure_notes':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'cards':
        return <CreditCard className="w-5 h-5 text-indigo-400" />;
      case 'servers':
        return <Server className="w-5 h-5 text-purple-400" />;
      default:
        return <KeyRound className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a13]/10 overflow-y-auto select-none">
      {/* Detail Top Header */}
      <div className="p-3.5 sm:p-5 border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-[#070a13]/40 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back to List Button */}
          <button
            onClick={() => setSelectedEntryId(null)}
            className="md:hidden flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Back to item list"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0d1222] border border-slate-800 flex items-center justify-center shadow-md shrink-0">
            {getCategoryIcon(entry.category)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">{entry.title}</h2>
              <button
                onClick={toggleFavorite}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 transition-colors cursor-pointer shrink-0"
                title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-4 h-4 ${
                    entry.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-400 capitalize font-medium">{entry.category.replace('_', ' ')}</span>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-medium"
                    >
                      <Tag className="w-3 h-3 text-cyan-400/80" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={() => openEditor(entry)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete '${entry.title}'?`)) {
                deleteEntry(entry.id);
                setSelectedEntryId(null);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-2xl pb-28 md:pb-8">
        {/* TOTP Authenticator Section */}
        {entry.totp_secret && (
          <TotpViewer secret={entry.totp_secret} onCopy={copyToClipboard} />
        )}

        {/* Credential Fields Card */}
        <div className="bg-[#0d1222]/90 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
          {/* Username */}
          {entry.username && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                <User className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Username</span>
                  <span className="text-sm sm:text-base font-mono text-slate-100 font-medium select-all block truncate">{entry.username}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.username, 'Username')}
                className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer shrink-0"
              >
                {copiedField === 'Username' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Email */}
          {entry.email && (
            <div className="flex items-center justify-between group pt-3.5 border-t border-slate-900/60">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                <Mail className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email</span>
                  <span className="text-sm sm:text-base font-mono text-slate-100 font-medium select-all block truncate">{entry.email}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.email, 'Email')}
                className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer shrink-0"
              >
                {copiedField === 'Email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Password */}
          {entry.password && (
            <div className="pt-3.5 border-t border-slate-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Lock className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${strength.color} text-white`}>
                        {strength.label}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {entropy.bits} bits • {entropy.crackTimeDisplay}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-mono text-slate-100 block break-all tracking-wider font-medium select-all">
                      {showPassword ? entry.password : '••••••••••••••••'}
                    </span>
                    {/* Visual 4-step strength bar */}
                    <div className="h-1.5 w-36 bg-slate-900 rounded-full overflow-hidden flex gap-1 mt-2.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`h-full flex-1 rounded-full transition-all ${
                            idx <= strength.score ? strength.color : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy(entry.password, 'Password')}
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === 'Password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Website URL */}
          {entry.url && (
            <div className="flex items-center justify-between group pt-3.5 border-t border-slate-900/60">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                <Globe className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Website URL</span>
                  <span className="text-sm font-mono text-blue-400 truncate block hover:underline cursor-pointer" onClick={handleOpenUrl}>
                    {entry.url}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenUrl}
                className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open</span>
              </button>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {entry.custom_fields && entry.custom_fields.length > 0 && (
          <div className="bg-[#0d1222]/90 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Custom Fields</h3>
            {entry.custom_fields.map((field) => {
              const isSensitive = field.fieldType === 'sensitive' || field.field_type === 'sensitive';
              const isRevealed = visibleCustomFields[field.id];
              return (
                <div key={field.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-900/60">
                  <div className="pl-1 min-w-0 flex-1 pr-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">{field.name}</span>
                    <span className="text-sm font-mono text-slate-200 select-all block truncate">
                      {isSensitive && !isRevealed ? '••••••••' : field.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSensitive && (
                      <button
                        onClick={() =>
                          setVisibleCustomFields((prev) => ({ ...prev, [field.id]: !prev[field.id] }))
                        }
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title={isRevealed ? 'Hide Value' : 'Show Value'}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(field.value, field.name)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secure Notes Section */}
        {entry.notes && (
          <div className="bg-[#0d1222]/90 border border-slate-900 rounded-2xl p-5 space-y-2 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure Notes</h3>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-[#070a13] p-4 rounded-xl border border-slate-900/80 font-mono">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Item Metadata */}
        <div className="flex items-center gap-5 text-xs text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Updated: {new Date(entry.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
