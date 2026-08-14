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
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { TotpViewer } from './TotpViewer';
import { calculatePasswordStrength } from '../utils/cryptoUtils';

export const EntryDetail: React.FC = () => {
  const { entries, selectedEntryId, openEditor, deleteEntry, copyToClipboard, saveEntry } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const entry = entries.find((e) => e.id === selectedEntryId);

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-950/20 select-none">
        <Shield className="w-12 h-12 mb-4 text-slate-700 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-slate-400 mb-1">No Item Selected</h3>
        <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
          Select an entry from the list to view decrypted details or create a new credential.
        </p>
      </div>
    );
  }

  const strength = calculatePasswordStrength(entry.password);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleFavorite = () => {
    saveEntry({ ...entry, favorite: !entry.favorite });
  };

  const handleOpenUrl = () => {
    if (!entry.url) return;
    let validUrl = entry.url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    window.open(validUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/20 overflow-y-auto select-none">
      {/* Detail Top Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-blue-500/20 border border-brand-500/30 flex items-center justify-center shadow-lg">
            <KeyRound className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">{entry.title}</h2>
              <button
                onClick={toggleFavorite}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-4 h-4 ${
                    entry.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                  }`}
                />
              </button>
            </div>
            <span className="text-xs text-slate-400 capitalize">{entry.category.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditor(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/50 text-rose-300 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="p-6 space-y-6 max-w-3xl">
        {/* TOTP Authenticator Section if active */}
        {entry.totp_secret && (
          <TotpViewer secret={entry.totp_secret} onCopy={copyToClipboard} />
        )}

        {/* Credential Fields Card */}
        <div className="glass-panel rounded-2xl p-5 space-y-4 border border-slate-800/80">
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
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === 'Username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Email */}
          {entry.email && (
            <div className="flex items-center justify-between group pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email</span>
                  <span className="text-xs font-mono text-slate-200">{entry.email}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.email, 'Email')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Password */}
          {entry.password && (
            <div className="pt-3 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Password</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${strength.color} text-white font-bold`}>
                        {strength.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-200">
                      {showPassword ? entry.password : '••••••••••••••••'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(entry.password, 'Password')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
            <div className="flex items-center justify-between group pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Website URL</span>
                  <span className="text-xs font-mono text-brand-400 truncate block hover:underline cursor-pointer" onClick={handleOpenUrl}>
                    {entry.url}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenUrl}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {entry.custom_fields && entry.custom_fields.length > 0 && (
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Custom Fields</h3>
            {entry.custom_fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">{field.name}</span>
                  <span className="text-xs font-mono text-slate-200">
                    {field.fieldType === 'sensitive' ? '••••••••' : field.value}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(field.value, field.name)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Secure Notes Section */}
        {entry.notes && (
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure Notes</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 font-mono">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Item Metadata */}
        <div className="flex items-center gap-6 text-[11px] text-slate-500 font-mono pt-2">
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
