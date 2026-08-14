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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">CSPRNG Password Generator</h2>
          </div>
          <button
            onClick={() => setIsGeneratorOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Generated Password Box */}
        <div className="my-6 space-y-2">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group">
            <span className="font-mono text-base font-semibold text-brand-300 break-all select-all tracking-wider">
              {generatedPw || 'Generating...'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                onClick={handleGenerate}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">Security Score:</span>
            <span className="font-bold text-slate-200">{strength.label}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
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

        {/* Options / Controls */}
        <div className="space-y-4 pt-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setConfig({ ...config, passphrase_mode: false })}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                !config.passphrase_mode ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Random Password
            </button>
            <button
              onClick={() => setConfig({ ...config, passphrase_mode: true })}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                config.passphrase_mode ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Passphrase
            </button>
          </div>

          {!config.passphrase_mode ? (
            <>
              {/* Length Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Password Length</span>
                  <span className="font-mono font-bold text-brand-400">{config.length} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={config.length}
                  onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.use_uppercase}
                    onChange={(e) => setConfig({ ...config, use_uppercase: e.target.checked })}
                    className="rounded text-brand-500 accent-brand-500"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.use_lowercase}
                    onChange={(e) => setConfig({ ...config, use_lowercase: e.target.checked })}
                    className="rounded text-brand-500 accent-brand-500"
                  />
                  <span>Lowercase (a-z)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.use_numbers}
                    onChange={(e) => setConfig({ ...config, use_numbers: e.target.checked })}
                    className="rounded text-brand-500 accent-brand-500"
                  />
                  <span>Numbers (0-9)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.use_symbols}
                    onChange={(e) => setConfig({ ...config, use_symbols: e.target.checked })}
                    className="rounded text-brand-500 accent-brand-500"
                  />
                  <span>Symbols (!@#$)</span>
                </label>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.exclude_ambiguous}
                  onChange={(e) => setConfig({ ...config, exclude_ambiguous: e.target.checked })}
                  className="rounded text-brand-500 accent-brand-500"
                />
                <span>Exclude Ambiguous Characters (1, l, I, 0, O, 8, B)</span>
              </label>
            </>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Word Count</span>
                  <span className="font-mono font-bold text-brand-400">{config.word_count} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={config.word_count}
                  onChange={(e) => setConfig({ ...config, word_count: parseInt(e.target.value) })}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Word Separator</label>
                <input
                  type="text"
                  value={config.separator}
                  onChange={(e) => setConfig({ ...config, separator: e.target.value })}
                  maxLength={3}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-center text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
