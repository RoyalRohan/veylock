import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Clock, Copy, Check } from 'lucide-react';
import { TotpResult } from '../types';

interface TotpViewerProps {
  secret: string;
  onCopy: (text: string, label: string) => void;
}

export const TotpViewer: React.FC<TotpViewerProps> = ({ secret, onCopy }) => {
  const [totp, setTotp] = useState<TotpResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchCode = async () => {
      if (!secret) return;
      try {
        const res = await invoke<TotpResult>('generate_totp_code', { secret });
        if (mounted) {
          setTotp(res);
          setError(false);
        }
      } catch (err) {
        if (mounted) setError(true);
      }
    };

    fetchCode();
    const interval = setInterval(fetchCode, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [secret]);

  if (error || !secret) {
    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-rose-400">
        Invalid or corrupt TOTP secret format.
      </div>
    );
  }

  if (!totp) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Calculating TOTP code...</span>
      </div>
    );
  }

  const handleCopyCode = () => {
    onCopy(totp.code, 'TOTP 2FA Code');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = (totp.time_remaining / 30) * 100;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-cyan-500/20 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Countdown Ring */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-cyan-400 transition-all duration-1000 ease-linear"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-mono font-bold text-cyan-300">
            {totp.time_remaining}s
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
            Authenticator 2FA Code
          </span>
          <span className="text-xl font-mono font-bold tracking-widest text-white">
            {totp.code.slice(0, 3)} {totp.code.slice(3)}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopyCode}
        className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1.5 text-xs font-medium"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};
