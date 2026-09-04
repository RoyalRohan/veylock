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
import { Tag, Command } from 'lucide-react';

export const EntryDetail: React.FC = () => {
  const { entries, selectedEntryId, openEditor, deleteEntry, copyToClipboard, saveEntry } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleCustomFields, setVisibleCustomFields] = useState<Record<string, boolean>>({});

  const entry = entries.find((e) => e.id === selectedEntryId);

  if (!entry) {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const mod = isMac ? '⌘' : 'Ctrl+';

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070a13]/20 select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#0d1222]/80 border border-slate-800/80 flex items-center justify-center mb-4 shadow-inner text-slate-600">
          <Shield className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1 tracking-tight">No Item Selected</h3>
        <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed mb-6">
          Select an entry from the list to view decrypted details or manage credentials.
        </p>

        {/* Keyboard Shortcuts Cheatsheet */}
        <div className="w-full max-w-xs bg-[#0d1222]/60 border border-slate-800/60 rounded-xl p-3.5 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>Quick Shortcuts</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>New Credential</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 font-semibold">{mod}N</kbd>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quick Search</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 font-semibold">{mod}K</kbd>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Password Generator</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 font-semibold">{mod}G</kbd>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lock Vault</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 font-semibold">{mod}L</kbd>
          </div>
        </div>
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
      <div className="p-5 border-b border-slate-900 flex items-start justify-between bg-[#070a13]/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0d1222] border border-slate-800 flex items-center justify-center shadow-md">
            {getCategoryIcon(entry.category)}
          </div>
            <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">{entry.title}</h2>
              <button
                onClick={toggleFavorite}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 transition-colors cursor-pointer"
                title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    entry.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-slate-500 capitalize font-medium">{entry.category.replace('_', ' ')}</span>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-cyan-400/80" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditor(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete '${entry.title}'?`)) {
                deleteEntry(entry.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/40 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="p-6 space-y-5 max-w-2xl">
        {/* TOTP Authenticator Section */}
        {entry.totp_secret && (
          <TotpViewer secret={entry.totp_secret} onCopy={copyToClipboard} />
        )}

        {/* Credential Fields Card */}
        <div className="bg-[#0d1222]/90 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
          {/* Username */}
          {entry.username && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Username</span>
                  <span className="text-xs font-mono text-slate-200">{entry.username}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.username, 'Username')}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
              >
                {copiedField === 'Username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Email */}
          {entry.email && (
            <div className="flex items-center justify-between group pt-3 border-t border-slate-900/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email</span>
                  <span className="text-xs font-mono text-slate-200">{entry.email}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.email, 'Email')}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
              >
                {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Password */}
          {entry.password && (
            <div className="pt-3 border-t border-slate-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${strength.color} text-white`}>
                        {strength.label}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {entropy.bits} bits • {entropy.crackTimeDisplay}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-200 block break-all">
                      {showPassword ? entry.password : '••••••••••••••••'}
                    </span>
                    {/* Visual 4-step strength bar */}
                    <div className="h-1 w-32 bg-slate-900 rounded-full overflow-hidden flex gap-1 mt-2">
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
                    className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(entry.password, 'Password')}
                    className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Website URL */}
          {entry.url && (
            <div className="flex items-center justify-between group pt-3 border-t border-slate-900/60">
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Website URL</span>
                  <span className="text-xs font-mono text-blue-400 truncate block hover:underline cursor-pointer" onClick={handleOpenUrl}>
                    {entry.url}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenUrl}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-900 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {entry.custom_fields && entry.custom_fields.length > 0 && (
          <div className="bg-[#0d1222]/90 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Custom Fields</h3>
            {entry.custom_fields.map((field) => {
              const isSensitive = field.fieldType === 'sensitive' || field.field_type === 'sensitive';
              const isRevealed = visibleCustomFields[field.id];
              return (
                <div key={field.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-900/60">
                  <div className="pl-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">{field.name}</span>
                    <span className="text-xs font-mono text-slate-200">
                      {isSensitive && !isRevealed ? '••••••••' : field.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSensitive && (
                      <button
                        onClick={() =>
                          setVisibleCustomFields((prev) => ({ ...prev, [field.id]: !prev[field.id] }))
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title={isRevealed ? 'Hide Value' : 'Show Value'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(field.value, field.name)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
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
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Secure Notes</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#070a13] p-4 rounded-xl border border-slate-900/80 font-mono">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Item Metadata */}
        <div className="flex items-center gap-5 text-[10px] text-slate-500 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Updated: {new Date(entry.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
