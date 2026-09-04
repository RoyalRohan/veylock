import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopySecretButtonProps {
  value: string;
  label?: string;
  onCopy?: (text: string, label: string) => void;
  className?: string;
}

export const CopySecretButton: React.FC<CopySecretButtonProps> = ({
  value,
  label = 'Value',
  onCopy,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    if (onCopy) {
      onCopy(value, label);
    } else {
      navigator.clipboard.writeText(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!value}
      className={`p-2 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-hover text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer disabled:opacity-40 shrink-0 ${className}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};
