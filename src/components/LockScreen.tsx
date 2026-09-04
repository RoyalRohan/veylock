import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, ArrowRight, AlertTriangle } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import logoImg from '../assets/logo.png';

interface LockScreenProps {
  onOpenSetup: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onOpenSetup }) => {
  const { status, unlockVault } = useVault();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError('');
    setIsSubmitting(true);

    const success = await unlockVault(password);
    setIsSubmitting(false);
    setPassword('');

    if (!success) {
      setError('Incorrect master password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleKeyModifier = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070a13] p-4 sm:p-6 overflow-hidden select-none pt-safe pb-safe">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-[400px] glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10 border border-slate-800/80 ${
          shake ? 'animate-shake border-rose-500/60 shadow-rose-500/10' : 'animate-scale-up'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl shadow-2xl shadow-cyan-500/15 mb-4 flex items-center justify-center p-0.5 border border-cyan-500/30 bg-[#0d1222]/80 backdrop-blur-sm group">
            <img
              src={logoImg}
              alt="Veylock Official Logo"
              className="w-full h-full object-cover rounded-[14px] drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Veylock</h1>
          <p className="text-sm text-slate-400 font-medium">Local Password Manager</p>
        </div>

        {!status.exists ? (
          <div className="text-center space-y-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              Your encrypted vault is stored exclusively on this device and never leaves your control.
            </p>
            <button
              onClick={onOpenSetup}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <KeyRound className="w-4.5 h-4.5 text-cyan-200" />
              <span>Initialize Local Vault</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform text-cyan-200" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-slate-800 text-xs text-slate-300 font-medium shadow-sm">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vault Locked</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Master Password
                </label>
                {capsLockOn && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 animate-scale-up">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Caps Lock ON</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  placeholder="Enter master password..."
                  autoFocus
                  className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm sm:text-base text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1.5 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-rose-400 mt-1 leading-tight">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-cyan-200" />
                  <span>Unlock Vault</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
