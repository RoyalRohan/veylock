import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Eye, EyeOff, Lock, Check, ChevronDown, KeyRound, Globe, User, Mail, FileText } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { CustomField, DecryptedEntry } from '../types';

export const EntryEditorModal: React.FC = () => {
  const { isEditorOpen, closeEditor, editingEntry, saveEntry, generatePassword } = useVault();

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('logins');
  const [favorite, setFavorite] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || '');
      setUsername(editingEntry.username || '');
      setEmail(editingEntry.email || '');
      setPassword(editingEntry.password || '');
      setUrl(editingEntry.url || '');
      setNotes(editingEntry.notes || '');
      setCategory(editingEntry.category || 'logins');
      setFavorite(editingEntry.favorite || false);
      setTotpSecret(editingEntry.totp_secret || '');
      setCustomFields(editingEntry.custom_fields || []);
    } else {
      setTitle('');
      setUsername('');
      setEmail('');
      setPassword('');
      setUrl('');
      setNotes('');
      setCategory('logins');
      setFavorite(false);
      setTotpSecret('');
      setCustomFields([]);
    }
  }, [editingEntry, isEditorOpen]);

  if (!isEditorOpen) return null;

  const handleGeneratePw = async () => {
    const pw = await generatePassword({
      length: 18,
      use_uppercase: true,
      use_lowercase: true,
      use_numbers: true,
      use_symbols: true,
      exclude_ambiguous: true,
      passphrase_mode: false,
      word_count: 4,
      separator: '-',
    });
    if (pw) setPassword(pw);
  };

  const handleAddCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: Date.now().toString(), name: '', value: '', fieldType: 'text' },
    ]);
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const entryToSave: DecryptedEntry = {
      id: editingEntry ? editingEntry.id : '',
      title: title.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      url: url.trim(),
      notes: notes.trim(),
      category,
      favorite,
      tags: [],
      custom_fields: customFields.filter((f) => f.name.trim()),
      totp_secret: totpSecret.trim() || undefined,
      created_at: editingEntry ? editingEntry.created_at : '',
      updated_at: '',
    };

    saveEntry(entryToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-slate-800/80 animate-scale-up max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d1222] border border-slate-800 text-blue-400 flex items-center justify-center shadow-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                {editingEntry ? 'Edit Credential' : 'Create New Credential'}
              </h2>
              <p className="text-[10px] text-slate-500">Encrypted locally using AES-256-GCM</p>
            </div>
          </div>
          <button
            onClick={closeEditor}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Category & Title */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-100 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="logins" className="bg-[#070a13] text-slate-100">Login</option>
                  <option value="secure_notes" className="bg-[#070a13] text-slate-100">Secure Note</option>
                  <option value="cards" className="bg-[#070a13] text-slate-100">Card / License</option>
                  <option value="servers" className="bg-[#070a13] text-slate-100">Server / API</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GitHub, AWS Console..."
                required
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-550" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or handle..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-550" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password with Generator Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-550" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePw}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter or generate password..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-550" />
              <span>Website URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* TOTP Secret Key */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
              TOTP Secret Key (2FA Authenticator)
            </label>
            <input
              type="text"
              value={totpSecret}
              onChange={(e) => setTotpSecret(e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PXP (Base32 Key)"
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono uppercase tracking-wider placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="pt-2 border-t border-slate-900">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Fields</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Custom Field</span>
              </button>
            </div>
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Field Name"
                  value={field.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, name: val } : f)));
                  }}
                  className="w-1/3 bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                />
                <input
                  type={field.fieldType === 'sensitive' ? 'password' : 'text'}
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, value: val } : f)));
                  }}
                  className="flex-1 bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newType = field.fieldType === 'sensitive' ? 'text' : 'sensitive';
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, fieldType: newType } : f)));
                  }}
                  className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    field.fieldType === 'sensitive'
                      ? 'bg-rose-950/40 border-rose-900/40 text-rose-300'
                      : 'bg-[#0d1222] border border-slate-800 text-slate-450 hover:text-slate-200'
                  }`}
                  title={field.fieldType === 'sensitive' ? 'Encrypted Sensitive Field' : 'Normal Field'}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Secure Notes */}
          <div className="pt-2 border-t border-slate-900">
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-550" />
              <span>Secure Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional encrypted notes..."
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 font-mono resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-900 shrink-0">
            <button
              type="button"
              onClick={closeEditor}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
