import { invoke } from '@tauri-apps/api/core';

export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
} {
  if (!password) return { score: 0, label: 'Very Weak', color: 'bg-rose-600' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 14) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  score = Math.min(score, 4);

  const map: Record<number, { label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'; color: string }> = {
    0: { label: 'Very Weak', color: 'bg-rose-600' },
    1: { label: 'Weak', color: 'bg-rose-500' },
    2: { label: 'Fair', color: 'bg-amber-500' },
    3: { label: 'Strong', color: 'bg-emerald-500' },
    4: { label: 'Very Strong', color: 'bg-emerald-400' },
  };

  return { score, ...map[score] };
}

/**
  Fallbacks for local dev / browser preview when Tauri native bindings are mockable
 */
export async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (err) {
    console.warn(`[Tauri IPC Call] ${command}:`, err);
    throw err;
  }
}
