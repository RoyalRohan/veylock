import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react';
import { useVault } from '../context/VaultContext';

interface LockScreenProps {
  onOpenSetup: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onOpenSetup }) => {
  const { status, unlockVault } = useVault();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError('');
    setIsSubmitting(true);

    const success = await unlockVault(password);
    setIsSubmitting(false);

    if (!success) {
      setError('Incorrect master password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-dark-bg via-dark-surface to-slate-950 p-6 overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-slate-800/80">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 p-[1px] shadow-lg shadow-brand-500/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-dark-surface rounded-[15px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-brand-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Veylock</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Your secrets. Your device. Your control.</p>
        </div>

        {!status.exists ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Welcome to Veylock. No account required. Your vault will be encrypted locally on this device using Argon2id & AES-256-GCM.
            </p>
            <button
              onClick={onOpenSetup}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group"
            >
              <KeyRound className="w-4 h-4" />
              <span>Create Master Password & Vault</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Vault Locked</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password..."
                  autoFocus
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Vault</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 leading-tight">
                Veylock operates 100% offline. Passwords stay on your device and are derived via Argon2id.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
