import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { calculatePasswordStrength, calculateEntropy } from '../utils/cryptoUtils';

interface SetupVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupVaultModal: React.FC<SetupVaultModalProps> = ({ isOpen, onClose }) => {
  const { createVault } = useVault();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  if (!isOpen) return null;

  const strength = calculatePasswordStrength(password);
  const entropy = calculateEntropy(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Master password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await createVault(password);
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-900">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Create Local Vault</h2>
            <p className="text-[11px] text-slate-400">Secure your database using a local master password</p>
          </div>
        </div>

        {/* Security Alert Warning */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs mb-5 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Important Offline Notice</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-200/80">
            Veylock is 100% offline. There is no cloud recovery or password reset. If you lose your master password, your vault cannot be recovered.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Choose Master Password <span className="text-rose-400">*</span>
              </label>
              {capsLockOn && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400 animate-scale-up">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Caps Lock ON</span>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                placeholder="Choose a strong password (min. 8 characters)..."
                required
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password Strength Visualizer */}
            {password && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#080d1a] border border-slate-850 space-y-1.5 animate-scale-up">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Complexity:</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-white text-[9px] ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-cyan-300">
                    {entropy.bits} bits • {entropy.crackTimeDisplay}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
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
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
              Confirm Master Password <span className="text-rose-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
              onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
              placeholder="Confirm master password..."
              required
              className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {error && <p className="text-[11px] text-rose-400 leading-tight">{error}</p>}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password || password !== confirmPassword}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Initialize Vault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
