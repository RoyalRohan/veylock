import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  KeyRound,
  Edit3,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { isWeakPassword, calculateEntropy } from '../utils/cryptoUtils';

export const SecurityHealthDashboard: React.FC = () => {
  const { entries, healthReport, fetchHealthReport, openEditor, setActiveCategory } = useVault();
  const [activeTab, setActiveTab] = useState<'all' | 'weak' | 'reused' | 'totp'>('all');

  useEffect(() => {
    fetchHealthReport();
  }, [entries, fetchHealthReport]);

  if (!healthReport) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mb-2" />
        <p className="text-xs font-semibold">Auditing local vault health...</p>
      </div>
    );
  }

  const weakEntries = entries.filter((e) => {
    const isLogin = e.category === 'logins' || !e.category;
    if (isLogin) {
      return !e.password || isWeakPassword(e.password);
    }
    return Boolean(e.password && isWeakPassword(e.password));
  });

  // Group passwords to find local duplicates
  const passCounts = new Map<string, number>();
  entries.forEach((e) => {
    if (e.password) {
      passCounts.set(e.password, (passCounts.get(e.password) || 0) + 1);
    }
  });
  const reusedEntries = entries.filter((e) => e.password && (passCounts.get(e.password) || 0) > 1);

  const missingTotpEntries = entries.filter((e) => {
    const isLogin = e.category === 'logins' || !e.category;
    return isLogin && !e.totp_secret;
  });

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 select-none bg-[#070a13]/10 pb-safe">
      {/* Dashboard Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Mobile Back Button */}
          <button
            onClick={() => setActiveCategory('all')}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Back to vault items"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Vault Security Dashboard</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Local offline audit of credential strength, duplication, and 2FA coverage
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealthReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1222]/90 hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer ml-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-audit</span>
        </button>
      </div>

      {/* Main Score & Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Score Ring Card */}
        <div className="bg-[#0d1222]/90 border border-slate-900 p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center col-span-1 shadow-sm">
          <div className="relative w-20 h-20 flex items-center justify-center mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  healthReport.total_score >= 80
                    ? 'text-emerald-500'
                    : healthReport.total_score >= 50
                    ? 'text-amber-500'
                    : 'text-rose-500'
                } transition-all duration-1000 ease-out`}
                strokeDasharray={`${healthReport.total_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-bold font-mono text-white">
              {healthReport.total_score}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {healthReport.total_score >= 80 ? 'Vault Healthy' : healthReport.total_score >= 50 ? 'Attention Needed' : 'Vulnerable Vault'}
          </span>
          <span className="text-[9px] text-slate-550 mt-1">Calculated locally</span>
        </div>

        {/* Metrics Grid */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#0d1222]/90 border border-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Weak Passwords</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-3 sm:mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.weak_passwords}</span>
              <span className="text-[10px] text-rose-450 block mt-1">Low complexity</span>
            </div>
          </div>

          <div className="bg-[#0d1222]/90 border border-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Reused Passwords</span>
              <KeyRound className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 sm:mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.reused_passwords}</span>
              <span className="text-[10px] text-amber-450 block mt-1">Reused on multiple sites</span>
            </div>
          </div>

          <div className="bg-[#0d1222]/90 border border-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Missing 2FA</span>
              <Clock className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="mt-3 sm:mt-4">
              <span className="text-2xl font-bold font-mono text-white">{healthReport.missing_totp}</span>
              <span className="text-[10px] text-slate-550 block mt-1">Without TOTP keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Vulnerabilities with Category Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Flagged Vault Vulnerabilities
          </h3>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center bg-[#0d1222] p-1 rounded-xl border border-slate-900 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {weakEntries.length + reusedEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('weak')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'weak'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50 shadow-sm'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <span>Weak</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950/60 text-rose-300 font-mono">
                {weakEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reused')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reused'
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>Reused</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/60 text-amber-300 font-mono">
                {reusedEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('totp')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'totp'
                  ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-900/50 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <span>Missing 2FA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 font-mono">
                {missingTotpEntries.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'all' && weakEntries.length === 0 && reusedEntries.length === 0 && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span>No weak or reused passwords detected! Your credentials meet high strength standards.</span>
          </div>
        )}

        {activeTab === 'weak' && weakEntries.length === 0 && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span>All vault passwords meet complexity and entropy standards.</span>
          </div>
        )}

        {activeTab === 'reused' && reusedEntries.length === 0 && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span>No duplicated passwords found across your stored accounts.</span>
          </div>
        )}

        {activeTab === 'totp' && missingTotpEntries.length === 0 && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span>All login credentials have two-factor authenticator keys configured.</span>
          </div>
        )}

        <div className="space-y-2">
          {(activeTab === 'all' || activeTab === 'weak') &&
            weakEntries.map((item) => {
              const entropy = calculateEntropy(item.password || '');
              return (
                <div
                  key={'weak-' + item.id}
                  className="p-3.5 rounded-xl bg-[#0d1222]/90 border border-slate-900 flex items-center justify-between shadow-sm animate-scale-up"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-rose-450 font-medium">Weak Password</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {entropy.bits} bits • Crack time: {entropy.crackTimeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditor(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Fix</span>
                  </button>
                </div>
              );
            })}

          {(activeTab === 'all' || activeTab === 'reused') &&
            reusedEntries.map((item) => {
              const timesReused = passCounts.get(item.password) || 2;
              return (
                <div
                  key={'reused-' + item.id}
                  className="p-3.5 rounded-xl bg-[#0d1222]/90 border border-slate-900 flex items-center justify-between shadow-sm animate-scale-up"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-450 border border-amber-500/20">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                      <span className="text-[10px] text-amber-450 block mt-0.5">
                        Reused Password (Shared across {timesReused} accounts)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditor(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fix</span>
                  </button>
                </div>
              );
            })}

          {activeTab === 'totp' &&
            missingTotpEntries.map((item) => (
              <div
                key={'totp-' + item.id}
                className="p-3.5 rounded-xl bg-[#0d1222]/90 border border-slate-900 flex items-center justify-between shadow-sm animate-scale-up"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-450 border border-cyan-500/20">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    <span className="text-[10px] text-cyan-400 block mt-0.5">
                      Missing 2FA Authenticator TOTP Key
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEditor(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add 2FA</span>
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Explanatory note */}
      <div className="p-4 rounded-xl bg-[#0d1222]/90 border border-slate-900 text-[10px] text-slate-550 leading-relaxed shadow-sm">
        <strong>Veylock Vault Security Auditing Policy:</strong> Strength indicators and reuse metrics are evaluated 100% locally on your machine. Decrypted credential material never crosses network bounds.
      </div>
    </div>
  );
};
