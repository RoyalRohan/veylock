import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Eye, EyeOff, Lock, Check, ChevronDown, KeyRound, Globe, User, Mail, FileText, Star, Tag } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { CustomField, DecryptedEntry } from '../types';
import { calculatePasswordStrength, calculateEntropy } from '../utils/cryptoUtils';

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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
      setTags(editingEntry.tags || []);
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
      setTags([]);
    }
    setTagInput('');
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

  const handleAddTag = (text: string) => {
    const clean = text.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalTags = [...tags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim().toLowerCase())) {
      finalTags.push(tagInput.trim().toLowerCase());
    }

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
      tags: finalTags,
      custom_fields: customFields.filter((f) => f.name.trim()),
      totp_secret: totpSecret.trim() || undefined,
      created_at: editingEntry ? editingEntry.created_at : '',
      updated_at: '',
    };

    saveEntry(entryToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-slate-800/80 animate-scale-up max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-900 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d1222] border border-slate-800 text-blue-400 flex items-center justify-center shadow-sm shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {editingEntry ? 'Edit Credential' : 'Create New Credential'}
              </h2>
              <p className="text-xs text-slate-400">Save encrypted in your vault</p>
            </div>
          </div>
          <button
            onClick={closeEditor}
            className="p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          {/* Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-slate-100 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="logins" className="bg-[#070a13] text-slate-100">Login</option>
                  <option value="secure_notes" className="bg-[#070a13] text-slate-100">Secure Note</option>
                  <option value="cards" className="bg-[#070a13] text-slate-100">Card / License</option>
                  <option value="servers" className="bg-[#070a13] text-slate-100">Server / API</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Title <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFavorite(!favorite)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title={favorite ? 'Favorite item' : 'Mark as favorite'}
                >
                  <Star className={`w-4 h-4 ${favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                  <span className={favorite ? 'text-amber-400 font-semibold' : 'text-slate-500'}>Favorite</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GitHub, AWS Console..."
                required
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or handle..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password with Generator Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePw}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter or generate password..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-3.5 pr-11 py-2.5 text-sm text-white font-mono placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1.5 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Strength & Entropy Meter */}
            {password && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#080d1a] border border-slate-850 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Complexity:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-white text-xs ${calculatePasswordStrength(password).color}`}>
                      {calculatePasswordStrength(password).label}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-cyan-300">
                    {calculateEntropy(password).bits} bits • {calculateEntropy(password).crackTimeDisplay}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((idx) => {
                    const pwStrength = calculatePasswordStrength(password);
                    return (
                      <div
                        key={idx}
                        className={`h-full flex-1 rounded-full transition-all ${
                          idx <= pwStrength.score ? pwStrength.color : 'bg-slate-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Website URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* TOTP Secret Key */}
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
              TOTP Secret Key (2FA Authenticator)
            </label>
            <input
              type="text"
              value={totpSecret}
              onChange={(e) => setTotpSecret(e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PXP (Base32 Key)"
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-mono uppercase tracking-wider placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500" />
              <span>Tags</span>
              <span className="text-slate-500 font-normal lowercase">(press Enter or comma)</span>
            </label>
            <div className="min-h-[42px] w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center gap-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-750 text-cyan-300 text-xs font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                }}
                placeholder={tags.length === 0 ? "Add tags (e.g. work, banking)..." : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-650 focus:outline-none py-0.5"
              />
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="pt-2 border-t border-slate-900">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Fields</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
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
                  className="w-1/3 bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                />
                <input
                  type={field.fieldType === 'sensitive' ? 'password' : 'text'}
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomFields(customFields.map((f) => (f.id === field.id ? { ...f, value: val } : f)));
                  }}
                  className="flex-1 bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
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
                      : 'bg-[#0d1222] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={field.fieldType === 'sensitive' ? 'Encrypted Sensitive Field' : 'Normal Field'}
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Secure Notes */}
          <div className="pt-2 border-t border-slate-900">
            <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Secure Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional encrypted notes..."
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 font-mono resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-900 shrink-0">
            <button
              type="button"
              onClick={closeEditor}
              className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
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
