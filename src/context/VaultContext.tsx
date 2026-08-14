import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CategoryType, DecryptedEntry, PwGenConfig, VaultHealthReport, VaultStatus } from '../types';

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

  // Actions
  refreshStatus: () => Promise<void>;
  createVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  lockVault: () => Promise<void>;
  saveEntry: (entry: DecryptedEntry) => Promise<void>;
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
  exportBackup: (path: string) => Promise<void>;
  importBackup: (path: string, password: string) => Promise<void>;
  changeMasterPassword: (oldP: string, newP: string) => Promise<void>;
  exportCsv: (path: string) => Promise<void>;
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
  const [healthReport, setHealthReport] = useState<VaultHealthReport | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
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

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

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
  }, []);

  const createVault = async (password: string) => {
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
  };

  const unlockVault = async (password: string): Promise<boolean> => {
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
  };

  const lockVault = async () => {
    try {
      await invoke('lock_vault');
    } catch (err: any) {
      console.error('Lock vault failed:', err);
    }
    setStatus((prev) => ({ ...prev, unlocked: false }));
    setEntries([]);
    setSelectedEntryId(null);
    showToast('Vault locked', 'info');
  };

  const saveEntry = async (entry: DecryptedEntry) => {
    try {
      const id = await invoke<string>('save_entry', { entry });
      showToast('Entry saved securely', 'success');
      await refreshStatus();
      setSelectedEntryId(id);
      setIsEditorOpen(false);
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await invoke('delete_entry', { id });
      showToast('Entry deleted', 'info');
      if (selectedEntryId === id) setSelectedEntryId(null);
      await refreshStatus();
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const openEditor = (entry?: DecryptedEntry) => {
    setEditingEntry(entry || null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingEntry(null);
    setIsEditorOpen(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied! Will auto-clear in 30s.`, 'success');
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const generatePassword = async (config: PwGenConfig): Promise<string> => {
    try {
      return await invoke<string>('generate_password', { config });
    } catch (err: any) {
      showToast(err.toString(), 'error');
      return '';
    }
  };

  const setAutoLockTimer = async (minutes: number) => {
    try {
      await invoke('set_auto_lock_timer', { minutes });
      setStatus((prev) => ({ ...prev, auto_lock_minutes: minutes }));
      showToast(`Auto-lock set to ${minutes === 0 ? 'Never' : minutes + ' minute(s)'}`, 'info');
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const fetchHealthReport = async () => {
    try {
      const report = await invoke<VaultHealthReport>('get_vault_health');
      setHealthReport(report);
    } catch (err: any) {
      console.error('Fetch health report failed:', err);
    }
  };

  const exportBackup = async (path: string) => {
    try {
      await invoke('export_vault_backup', { destPath: path });
      showToast('Encrypted vault backup exported successfully!', 'success');
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const importBackup = async (path: string, password: string) => {
    try {
      await invoke('import_vault_backup', { srcPath: path, masterPassword: password });
      showToast('Backup restored successfully!', 'success');
      await refreshStatus();
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const changeMasterPassword = async (oldP: string, newP: string) => {
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
  };

  const exportCsv = async (path: string) => {
    try {
      await invoke('export_plaintext_csv', { destPath: path });
      showToast('CSV exported. WARNING: File contains plaintext passwords!', 'warning');
    } catch (err: any) {
      showToast(err.toString(), 'error');
    }
  };

  const importCsv = async (path: string): Promise<number> => {
    try {
      const count = await invoke<number>('import_plaintext_csv', { srcPath: path });
      showToast(`Imported ${count} credentials from CSV`, 'success');
      await refreshStatus();
      return count;
    } catch (err: any) {
      showToast(err.toString(), 'error');
      return 0;
    }
  };

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
        healthReport,
        toast,
        refreshStatus,
        createVault,
        unlockVault,
        lockVault,
        saveEntry,
        deleteEntry,
        setSelectedEntryId,
        setActiveCategory,
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
