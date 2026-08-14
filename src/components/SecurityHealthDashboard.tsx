import React, { useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  KeyRound,
  Edit3,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { calculatePasswordStrength } from '../utils/cryptoUtils';

export const SecurityHealthDashboard: React.FC = () => {
  const { entries, healthReport, fetchHealthReport, openEditor } = useVault();

  useEffect(() => {
    fetchHealthReport();
  }, [entries]);

  if (!healthReport) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-400 mb-2" />
        <p className="text-xs font-medium">Auditing local vault health...</p>
      </div>
    );
  }

  const weakEntries = entries.filter((e) => calculatePasswordStrength(e.password).score < 2);

  // Group passwords to find local duplicates
  const passCounts = new Map<string, number>();
  entries.forEach((e) => {
    if (e.password) {
      passCounts.set(e.password, (passCounts.get(e.password) || 0) + 1);
    }
  });
  const reusedEntries = entries.filter((e) => e.password && (passCounts.get(e.password) || 0) > 1);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none bg-slate-950/30">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            <span>Vault Security Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Local offline audit of password strength, password reuse, and 2FA coverage
          </p>
        </div>
        <button
          onClick={fetchHealthReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-audit Vault</span>
        </button>
      </div>

      {/* Main Score & Metrics Section */}
      <div className="grid grid-cols-4 gap-4">
        {/* Score Ring Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center col-span-1">
          <div className="relative w-24 h-24 flex items-center justify-center mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  healthReport.total_score >= 80
                    ? 'text-emerald-400'
                    : healthReport.total_score >= 50
                    ? 'text-amber-400'
                    : 'text-rose-500'
                } transition-all duration-1000 ease-out`}
                strokeDasharray={`${healthReport.total_score}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-2xl font-bold font-mono text-white">
              {healthReport.total_score}
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {healthReport.total_score >= 80 ? 'Vault Healthy' : healthReport.total_score >= 50 ? 'Needs Attention' : 'Vulnerable Vault'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">Calculated 100% locally</span>
        </div>

        {/* Metrics Grid */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Weak Passwords</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.weak_passwords}</span>
              <span className="text-[11px] text-rose-400 block mt-1">Short or predictable</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Reused Passwords</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.reused_passwords}</span>
              <span className="text-[11px] text-amber-400 block mt-1">Duplicates across sites</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Missing 2FA (TOTP)</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.missing_totp}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Logins without 2FA key</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Weak / Reused List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flagged Security Vulnerabilities</h3>

        {weakEntries.length === 0 && reusedEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>No weak or reused passwords detected! All saved credentials meet security standards.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {weakEntries.map((item) => (
              <div
                key={'weak-' + item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[11px] text-rose-400">Weak Password (Less than 10 chars or low complexity)</span>
                  </div>
                </div>
                <button
                  onClick={() => openEditor(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Fix</span>
                </button>
              </div>
            ))}

            {reusedEntries.map((item) => (
              <div
                key={'reused-' + item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[11px] text-amber-400">Reused Password (Identical password used on another site)</span>
                  </div>
                </div>
                <button
                  onClick={() => openEditor(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Fix</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explanatory note */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <strong>How Veylock Audits Your Vault:</strong> Password weakness and reuse checks are performed 100% locally on your device after decryption. Veylock NEVER sends password hashes to remote breach lookup APIs unless explicitly requested by user configuration with k-anonymity prefixes.
      </div>
    </div>
  );
};
