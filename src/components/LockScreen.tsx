import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, ArrowRight, Server, ShieldCheck } from 'lucide-react';
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-dark-bg p-6 overflow-hidden">
      <div className="w-full max-w-[400px] glass-panel p-8 rounded-2xl shadow-xl relative z-10 border border-neutral-800 animate-scale-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neutral-700 to-neutral-500 p-[1px] shadow-sm mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#1c1c1e] rounded-[15px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">Veylock</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Zero-Trust Passbook</p>
        </div>

        {!status.exists ? (
          <div className="text-center space-y-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Welcome to Veylock. Your vault data is encrypted 100% locally on this device using <strong>Argon2id KDF & AES-256-GCM</strong>.
            </p>
            <button
              onClick={onOpenSetup}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-cyan-200" />
              <span>Initialize Local Vault</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-cyan-200" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 border border-slate-800 text-[10px] text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Vault Locked</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password..."
                  autoFocus
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {error && <p className="text-[11px] text-rose-400 mt-1 leading-tight">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-cyan-200" />
                  <span>Unlock Passbook</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3 text-slate-600" />
                <span>Local Engine: Active</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Zero-Trust Verified</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
