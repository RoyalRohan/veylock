import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, status, setAutoLockTimer, changeMasterPassword } =
    useVault();

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  if (!isSettingsOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Veylock Settings</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Auto-Lock Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Auto-Lock Timer
            </label>
            <p className="text-xs text-slate-500">
              Automatically lock vault after period of user inactivity.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              {[1, 5, 10, 15, 30, 0].map((mins) => {
                const isSelected = status.auto_lock_minutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => setAutoLockTimer(mins)}
                    className={`py-2 px-3 rounded-xl font-medium border transition-all ${
                      isSelected
                        ? 'bg-brand-600/20 text-brand-300 border-brand-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins === 0 ? 'Never' : `${mins} min`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change Master Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Change Master Password
            </label>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Current Master Password</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Current password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">New Master Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="New password..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {passError && <p className="text-xs text-rose-400">{passError}</p>}

            <button
              type="submit"
              disabled={isChanging || !oldPass || !newPass}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isChanging ? 'Updating Password...' : 'Update Master Password'}
            </button>
          </form>

          {/* Cryptographic Spec Overview */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-200 block">Cryptographic Engine Info</span>
            <div className="flex justify-between">
              <span>KDF Algorithm:</span>
              <span className="font-mono text-slate-300">Argon2id (m=64MB, t=3, p=4)</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption Cipher:</span>
              <span className="font-mono text-slate-300">AES-256-GCM (96-bit Nonce)</span>
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
