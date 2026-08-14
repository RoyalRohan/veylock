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
import { calculatePasswordStrength } from '../utils/cryptoUtils';

export const EntryDetail: React.FC = () => {
  const { entries, selectedEntryId, openEditor, deleteEntry, copyToClipboard, saveEntry } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const entry = entries.find((e) => e.id === selectedEntryId);

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-[#070a13]/10 select-none">
        <Shield className="w-10 h-10 mb-3 text-slate-700 stroke-[1.5]" />
        <h3 className="text-xs font-semibold text-slate-400 mb-1">No Item Selected</h3>
        <p className="text-[11px] text-slate-600 max-w-[240px] leading-relaxed">
          Select an entry from the list to view decrypted details or edit credentials.
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
            <span className="text-[10px] text-slate-500 capitalize font-medium">{entry.category.replace('_', ' ')}</span>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Password</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${strength.color} text-white`}>
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
            {entry.custom_fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <div className="pl-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">{field.name}</span>
                  <span className="text-xs font-mono text-slate-200">
                    {field.fieldType === 'sensitive' ? '••••••••' : field.value}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(field.value, field.name)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
