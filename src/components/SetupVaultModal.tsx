import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { calculatePasswordStrength } from '../utils/cryptoUtils';

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

  if (!isOpen) return null;

  const strength = calculatePasswordStrength(password);

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
      onClose();
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl border border-slate-700/60 animate-scale-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Your Local Vault</h2>
            <p className="text-xs text-slate-400">Set up your master password for device-level encryption</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs mb-6 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Important Recovery Warning</span>
          </div>
          <p className="leading-relaxed">
            Veylock is a local-only zero-knowledge application. <strong>Veylock CANNOT recover your master password</strong> if forgotten. Please store it safely.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Master Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Strength:</span>
                  <span className="font-semibold text-slate-200">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
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
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Confirm Master Password <span className="text-rose-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter master password..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {error && <p className="text-xs text-rose-400 leading-tight">{error}</p>}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password || password !== confirmPassword}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
