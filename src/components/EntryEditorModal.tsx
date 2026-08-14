import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Eye, EyeOff, Lock, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {editingEntry ? 'Edit Credential' : 'Create New Credential'}
          </h2>
          <button
            onClick={closeEditor}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Category & Title */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="logins">Login</option>
                <option value="secure_notes">Secure Note</option>
                <option value="cards">Card / License</option>
                <option value="servers">Server / API</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GitHub, AWS Console, Work Email..."
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or handle..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Password with CSPRNG Generator Trigger */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-24 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGeneratePw}
                  className="p-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors"
                  title="Generate CSPRNG Password"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Website URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* TOTP Secret Key */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">TOTP Secret Key (2FA Authenticator)</label>
            <input
              type="text"
              value={totpSecret}
              onChange={(e) => setTotpSecret(e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PXP (Base32)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">Custom Fields</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
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
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type={field.fieldType === 'sensitive' ? 'password' : 'text'}
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, value: val } : f)));
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newType = field.fieldType === 'sensitive' ? 'text' : 'sensitive';
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, fieldType: newType } : f)));
                  }}
                  className={`p-2 rounded-xl border text-xs ${
                    field.fieldType === 'sensitive'
                      ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                  title={field.fieldType === 'sensitive' ? 'Encrypted Sensitive Field' : 'Normal Field'}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-2 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Secure Notes */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Secure Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional encrypted notes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={closeEditor}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md"
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
