import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { calculatePasswordStrength, calculateEntropy } from '../utils/cryptoUtils';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, status, setAutoLockTimer, changeMasterPassword } =
    useVault();

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  if (!isSettingsOpen) return null;

  const newPassStrength = calculatePasswordStrength(newPass);
  const newPassEntropy = calculateEntropy(newPass);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setPassError('New master password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassError('');
    setIsChanging(true);
    try {
      await changeMasterPassword(oldPass, newPass);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setPassError(err.toString());
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-850 animate-scale-up max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d1222] border border-slate-800 text-blue-400 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Veylock Settings</h2>
              <p className="text-[10px] text-slate-550">Manage local vault policies</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Auto-Lock Settings */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Auto-Lock Timer
            </label>
            <p className="text-[11px] text-slate-500">
              Automatically lock vault after a period of user inactivity.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              {[1, 5, 10, 15, 30, 0].map((mins) => {
                const isSelected = status.auto_lock_minutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => setAutoLockTimer(mins)}
                    className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-blue-400 border-slate-800 shadow-sm'
                        : 'bg-[#0d1222] border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins === 0 ? 'Never' : `${mins} min`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change Master Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-4 border-t border-slate-900">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Change Master Password
            </label>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Current Master Password</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Enter current password..."
                className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">New Master Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="At least 8 chars..."
                  className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* New Password Strength Indicator */}
            {newPass && (
              <div className="p-2 rounded-xl bg-[#080d1a] border border-slate-850 space-y-1.5 animate-scale-up">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Complexity:</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-white text-[9px] ${newPassStrength.color}`}>
                      {newPassStrength.label}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-cyan-300">
                    {newPassEntropy.bits} bits • {newPassEntropy.crackTimeDisplay}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 rounded-full transition-all ${
                        idx <= newPassStrength.score ? newPassStrength.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {passError && <p className="text-[11px] text-rose-450 leading-tight">{passError}</p>}

            <button
              type="submit"
              disabled={isChanging || !oldPass || !newPass}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isChanging ? 'Updating Password...' : 'Update Master Password'}
            </button>
          </form>

          {/* Cryptographic Spec Overview */}
          <div className="p-4 rounded-xl bg-[#0d1222]/90 border border-slate-900 text-[10px] text-slate-550 space-y-2">
            <span className="font-bold text-slate-300 block uppercase tracking-wider">Cryptographic Engine Info</span>
            <div className="flex justify-between">
              <span>KDF Algorithm:</span>
              <span className="font-mono text-slate-350">Argon2id (m=64MB, t=3, p=4)</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption Cipher:</span>
              <span className="font-mono text-slate-350">AES-256-GCM (96-bit Nonce)</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Protection:</span>
              <span className="font-mono text-emerald-400">Zeroize Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
