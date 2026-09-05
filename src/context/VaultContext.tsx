import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CategoryType, DecryptedEntry, PwGenConfig, VaultHealthReport, VaultStatus } from '../types';

export interface ExportResult {
  path: string;
  content: string;
}

interface VaultContextType {
  status: VaultStatus;
  entries: DecryptedEntry[];
  selectedEntryId: string | null;
  activeCategory: CategoryType;
  searchQuery: string;
  isGeneratorOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;
  editingEntry: DecryptedEntry | null;
  isImportExportOpen: boolean;
  healthReport: VaultHealthReport | null;
  toast: { message: string; type?: 'info' | 'success' | 'warning' | 'error' } | null;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;

  // Actions
  refreshStatus: () => Promise<void>;
  createVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  lockVault: () => Promise<void>;
  saveEntry: (entry: DecryptedEntry, isFavoriteToggle?: boolean) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSelectedEntryId: (id: string | null) => void;
  setActiveCategory: (cat: CategoryType) => void;
  setSearchQuery: (q: string) => void;
  openEditor: (entry?: DecryptedEntry) => void;
  closeEditor: () => void;
  setIsGeneratorOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsImportExportOpen: (open: boolean) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  generatePassword: (config: PwGenConfig) => Promise<string>;
  setAutoLockTimer: (minutes: number) => Promise<void>;
  fetchHealthReport: () => Promise<void>;
  exportBackup: (path?: string) => Promise<ExportResult>;
  importBackup: (path: string, password: string) => Promise<void>;
  changeMasterPassword: (oldP: string, newP: string) => Promise<void>;
  exportCsv: (path?: string) => Promise<ExportResult>;
  importCsv: (path: string) => Promise<number>;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<VaultStatus>({
    exists: false,
    unlocked: false,
    auto_lock_minutes: 5,
    entry_count: 0,
  });
  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DecryptedEntry | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [healthReport, setHealthReport] = useState<VaultHealthReport | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await invoke<VaultStatus>('get_vault_status');
      setStatus(res);
      if (res.unlocked) {
        const fetchedEntries = await invoke<DecryptedEntry[]>('get_entries');
        setEntries(fetchedEntries);
      } else {
        setEntries([]);
        setSelectedEntryId(null);
      }
    } catch (err) {
      console.error('Tauri IPC call failed:', err);
    }
  }, []);

  const createVault = useCallback(async (password: string) => {
    if (!password || password.trim().length < 8) {
      showToast('Master password must be at least 8 characters long.', 'error');
      throw new Error('Master password too short');
    }

    try {
      const res = await invoke<VaultStatus>('create_vault', { masterPassword: password });
      setStatus(res);
      showToast('Vault created successfully!', 'success');
      await refreshStatus();
    } catch (err: any) {
      showToast(err.toString(), 'error');
      throw err;
    }
  }, [showToast, refreshStatus]);

  const unlockVault = useCallback(async (password: string): Promise<boolean> => {
    if (!password) {
      showToast('Master password is required.', 'error');
      return false;
    }

    try {
      const success = await invoke<boolean>('unlock_vault', { masterPassword: password });
      if (success) {
        showToast('Vault unlocked', 'success');
        await refreshStatus();
        return true;
      } else {
        showToast('Incorrect master password', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.toString(), 'error');
      return false;
    }
  }, [showToast, refreshStatus]);

  const clipboardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipboardClearTimeRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastBackendTouchRef = useRef<number>(Date.now());

  const lockVault = useCallback(async () => {
    if (clipboardTimeoutRef.current) {
      clearTimeout(clipboardTimeoutRef.current);
      clipboardTimeoutRef.current = null;
    }
    clipboardClearTimeRef.current = null;
    try {
      await invoke('lock_vault');
    } catch (err: any) {
      console.error('Lock vault failed:', err);
    }
    try {
      await navigator.clipboard.writeText('');
    } catch {
      // ignore when window does not have clipboard focus
    }
    setStatus((prev) => ({ ...prev, unlocked: false }));
    setEntries([]);
    setSelectedEntryId(null);
    setEditingEntry(null);
    setHealthReport(null);
    showToast('Vault locked', 'info');
  }, [showToast]);

  const saveEntry = useCallback(async (entry: DecryptedEntry, isFavoriteToggle = false) => {
    try {
      const id = await invoke<string>('save_entry', { entry });
      if (isFavoriteToggle) {
        showToast(entry.favorite ? 'Added to favorites' : 'Removed from favorites', 'info');
      } else {
        showToast('Entry saved securely', 'success');
        setIsEditorOpen(false);
      }
      await refreshStatus();
      setSelectedEntryId(id);
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  }, [showToast, refreshStatus]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await invoke('delete_entry', { id });
      showToast('Entry deleted', 'info');
      setSelectedEntryId((prev) => (prev === id ? null : prev));
      await refreshStatus();
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  }, [showToast, refreshStatus]);

  const openEditor = useCallback((entry?: DecryptedEntry) => {
    setEditingEntry(entry || null);
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingEntry(null);
    setIsEditorOpen(false);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied! Will auto-clear in 30s.`, 'success');
      clipboardClearTimeRef.current = Date.now() + 30000;

      if (clipboardTimeoutRef.current) {
        clearTimeout(clipboardTimeoutRef.current);
      }
      clipboardTimeoutRef.current = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // ignore focus errors
        }
        clipboardClearTimeRef.current = null;
      }, 30000);
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [showToast]);

  const generatePassword = useCallback(async (config: PwGenConfig): Promise<string> => {
    try {
      return await invoke<string>('generate_password', { config });
    } catch (err: any) {
      showToast(err.toString(), 'error');
      return '';
    }
  }, [showToast]);

  const setAutoLockTimer = useCallback(async (minutes: number) => {
    try {
      await invoke('set_auto_lock_timer', { minutes });
      setStatus((prev) => ({ ...prev, auto_lock_minutes: minutes }));
      showToast(`Auto-lock set to ${minutes === 0 ? 'Never' : minutes + ' minute(s)'}`, 'info');
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  }, [showToast]);

  const fetchHealthReport = useCallback(async () => {
    try {
      const report = await invoke<VaultHealthReport>('get_vault_health');
      setHealthReport(report);
    } catch (err: any) {
      console.error('Fetch health report failed:', err);
    }
  }, []);

  const exportBackup = useCallback(async (path?: string): Promise<ExportResult> => {
    try {
      const res = await invoke<ExportResult>('export_vault_backup', { destPath: path || null });
      showToast('Encrypted vault backup exported successfully!', 'success');
      return res;
    } catch (err: any) {
      showToast(err.toString(), 'error');
      throw err;
    }
  }, [showToast]);

  const importBackup = useCallback(async (path: string, password: string) => {
    try {
      await invoke('import_vault_backup', { srcPath: path, masterPassword: password });
      showToast('Backup restored successfully!', 'success');
      await refreshStatus();
    } catch (err: any) {
      showToast(err.toString(), 'error');
      throw err;
    }
  }, [showToast, refreshStatus]);

  const changeMasterPassword = useCallback(async (oldP: string, newP: string) => {
    if (!newP || newP.trim().length < 8) {
      showToast('New master password must be at least 8 characters long.', 'error');
      throw new Error('New master password too short');
    }

    try {
      await invoke('change_master_password', { oldPassword: oldP, newPassword: newP });
      showToast('Master password updated!', 'success');
    } catch (err: any) {
      showToast(err.toString(), 'error');
      throw err;
    }
  }, [showToast]);

  const exportCsv = useCallback(async (path?: string): Promise<ExportResult> => {
    try {
      const res = await invoke<ExportResult>('export_plaintext_csv', { destPath: path || null });
      showToast('CSV exported. WARNING: File contains plaintext passwords!', 'warning');
      return res;
    } catch (err: any) {
      showToast(err.toString(), 'error');
      throw err;
    }
  }, [showToast]);

  const importCsv = useCallback(async (path: string): Promise<number> => {
    try {
      const count = await invoke<number>('import_plaintext_csv', { srcPath: path });
      showToast(`Imported ${count} credentials from CSV`, 'success');
      await refreshStatus();
      return count;
    } catch (err: any) {
      showToast(err.toString(), 'error');
      return 0;
    }
  }, [showToast, refreshStatus]);

  // Initial Sync
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Safe category selector that deselects entry if it does not belong to new category
  const handleSetActiveCategory = useCallback((cat: CategoryType) => {
    setActiveCategory(cat);
    setIsMobileNavOpen(false);
    if (selectedEntryId) {
      const selected = entries.find((e) => e.id === selectedEntryId);
      if (selected) {
        if (cat === 'favorites' && !selected.favorite) setSelectedEntryId(null);
        else if (cat === 'totp' && !selected.totp_secret) setSelectedEntryId(null);
        else if (cat !== 'all' && cat !== 'favorites' && cat !== 'totp' && cat !== 'health' && selected.category !== cat) {
          setSelectedEntryId(null);
        }
      }
    }
  }, [selectedEntryId, entries]);

  // Track user activity to determine idle time & sync with Rust backend
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (status.unlocked && Date.now() - lastBackendTouchRef.current > 25000) {
        lastBackendTouchRef.current = Date.now();
        invoke('touch_user_activity').catch(() => {});
      }
    };

    const handleFocus = () => {
      handleActivity();
      if (clipboardClearTimeRef.current && Date.now() >= clipboardClearTimeRef.current) {
        navigator.clipboard.writeText('').catch(() => {});
        clipboardClearTimeRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('focus', handleFocus);
    };
  }, [status.unlocked]);

  // Periodic heartbeat to enforce auto-lock
  useEffect(() => {
    if (!status.unlocked) return;

    const interval = setInterval(async () => {
      const idleMs = Date.now() - lastActivityRef.current;
      const autoLockMs = status.auto_lock_minutes * 60 * 1000;

      if (status.auto_lock_minutes > 0 && idleMs >= autoLockMs) {
        await lockVault();
      } else {
        try {
          const res = await invoke<VaultStatus>('get_vault_status');
          if (!res.unlocked) {
            setStatus(res);
            setEntries([]);
            setSelectedEntryId(null);
            setEditingEntry(null);
          }
        } catch {
          // ignore transient poll error
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status.unlocked, status.auto_lock_minutes, lockVault]);

  // Keyboard Shortcuts Setup (Ctrl/Cmd + K, Ctrl/Cmd + N, Ctrl/Cmd + L, Ctrl/Cmd + G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('vault-search-input');
        if (searchInput) searchInput.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openEditor();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lockVault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGeneratorOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openEditor, lockVault]);

  return (
    <VaultContext.Provider
      value={{
        status,
        entries,
        selectedEntryId,
        activeCategory,
        searchQuery,
        isGeneratorOpen,
        isSettingsOpen,
        isEditorOpen,
        editingEntry,
        isImportExportOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        healthReport,
        toast,
        refreshStatus,
        createVault,
        unlockVault,
        lockVault,
        saveEntry,
        deleteEntry,
        setSelectedEntryId,
        setActiveCategory: handleSetActiveCategory,
        setSearchQuery,
        openEditor,
        closeEditor,
        setIsGeneratorOpen,
        setIsSettingsOpen,
        setIsImportExportOpen,
        copyToClipboard,
        generatePassword,
        setAutoLockTimer,
        fetchHealthReport,
        exportBackup,
        importBackup,
        changeMasterPassword,
        exportCsv,
        importCsv,
        showToast,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
};
