import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { PwGenConfig } from '../types';
import { calculatePasswordStrength } from '../utils/cryptoUtils';

export const PasswordGeneratorModal: React.FC = () => {
  const { isGeneratorOpen, setIsGeneratorOpen, generatePassword, copyToClipboard } = useVault();

  const [generatedPw, setGeneratedPw] = useState('');
  const [copied, setCopied] = useState(false);

  const [config, setConfig] = useState<PwGenConfig>({
    length: 20,
    use_uppercase: true,
    use_lowercase: true,
    use_numbers: true,
    use_symbols: true,
    exclude_ambiguous: true,
    passphrase_mode: false,
    word_count: 4,
    separator: '-',
  });

  const handleGenerate = useCallback(async () => {
    const pw = await generatePassword(config);
    setGeneratedPw(pw);
  }, [config, generatePassword]);

  useEffect(() => {
    if (isGeneratorOpen) {
      handleGenerate();
    }
  }, [isGeneratorOpen, handleGenerate]);

  if (!isGeneratorOpen) return null;

  const strength = calculatePasswordStrength(generatedPw);

  const handleCopy = () => {
    copyToClipboard(generatedPw, 'Generated Password');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-850 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d1222] border border-slate-800 text-blue-400 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">CSPRNG Generator</h2>
              <p className="text-[10px] text-slate-550">Create cryptographically secure credentials</p>
            </div>
          </div>
          <button
            onClick={() => setIsGeneratorOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Generated Password Box */}
        <div className="my-5 space-y-2">
          <div className="p-4 rounded-xl bg-[#0d1222] border border-slate-800 flex items-center justify-between group">
            <span className="font-mono text-sm font-semibold text-blue-300 break-all select-all tracking-wider">
              {generatedPw || 'Generating...'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                onClick={handleGenerate}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-900 transition-colors cursor-pointer"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-blue-600/25 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="text-slate-500">Security Score:</span>
            <span className="font-bold text-slate-200">{strength.label}</span>
          </div>
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-all ${
                  idx <= strength.score ? strength.color : 'bg-slate-900'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Options / Controls */}
        <div className="space-y-4 pt-2">
          {/* Mode Switcher */}
          <div className="flex bg-[#0d1222] p-1 rounded-xl border border-slate-900 text-xs">
            <button
              onClick={() => setConfig({ ...config, passphrase_mode: false })}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                !config.passphrase_mode ? 'bg-slate-900 text-blue-400 border border-slate-800' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Random Password
            </button>
            <button
              onClick={() => setConfig({ ...config, passphrase_mode: true })}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                config.passphrase_mode ? 'bg-slate-900 text-blue-400 border border-slate-800' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Passphrase
            </button>
          </div>

          {!config.passphrase_mode ? (
            <>
              {/* Length Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Password Length</span>
                  <span className="font-mono font-bold text-blue-400">{config.length} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={config.length}
                  onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1222]/60 border border-slate-900 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.use_uppercase}
                    onChange={(e) => setConfig({ ...config, use_uppercase: e.target.checked })}
                    className="rounded text-blue-500 accent-blue-500"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1222]/60 border border-slate-900 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.use_lowercase}
                    onChange={(e) => setConfig({ ...config, use_lowercase: e.target.checked })}
                    className="rounded text-blue-500 accent-blue-500"
                  />
                  <span>Lowercase (a-z)</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1222]/60 border border-slate-900 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.use_numbers}
                    onChange={(e) => setConfig({ ...config, use_numbers: e.target.checked })}
                    className="rounded text-blue-500 accent-blue-500"
                  />
                  <span>Numbers (0-9)</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1222]/60 border border-slate-900 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.use_symbols}
                    onChange={(e) => setConfig({ ...config, use_symbols: e.target.checked })}
                    className="rounded text-blue-500 accent-blue-500"
                  />
                  <span>Symbols (!@#$)</span>
                </label>
              </div>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1222]/60 border border-slate-900 text-xs cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={config.exclude_ambiguous}
                  onChange={(e) => setConfig({ ...config, exclude_ambiguous: e.target.checked })}
                  className="rounded text-blue-500 accent-blue-500"
                />
                <span>Exclude Ambiguous Characters (1, l, I, 0, O, 8)</span>
              </label>
            </>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Word Count</span>
                  <span className="font-mono font-bold text-blue-400">{config.word_count} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={config.word_count}
                  onChange={(e) => setConfig({ ...config, word_count: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Word Separator</label>
                <input
                  type="text"
                  value={config.separator}
                  onChange={(e) => setConfig({ ...config, separator: e.target.value })}
                  maxLength={3}
                  className="w-20 bg-[#0d1222] border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-center text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
