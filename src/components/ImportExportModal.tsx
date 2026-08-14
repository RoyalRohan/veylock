import React, { useState, useRef } from 'react';
import { X, HardDriveDownload, HardDriveUpload, AlertTriangle, FileSpreadsheet, Shield, FileUp, CheckCircle, FileText } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportOpen,
    setIsImportExportOpen,
    exportBackup,
    importBackup,
    exportCsv,
    importCsv,
    showToast,
  } = useVault();

  // Preset paths for Linux/Windows user directories
  const homeDir = typeof window !== 'undefined' ? '/home/' + (window.navigator.userAgent.includes('Linux') ? 'user' : 'User') : '';
  const defaultBackupPath = `${homeDir}/Documents/veylock_backup_${new Date().toISOString().slice(0, 10)}.vlock`;
  const defaultCsvPath = `${homeDir}/Documents/veylock_export_${new Date().toISOString().slice(0, 10)}.csv`;

  const [exportPath, setExportPath] = useState(defaultBackupPath);
  const [importPath, setImportPath] = useState('');
  const [importPass, setImportPass] = useState('');
  const [importFileName, setImportFileName] = useState('');

  const [csvExportPath, setCsvExportPath] = useState(defaultCsvPath);
  const [csvImportPath, setCsvImportPath] = useState('');
  const [csvImportFileName, setCsvImportFileName] = useState('');

  const [activeTab, setActiveTab] = useState<'backup' | 'csv'>('backup');
  const [isProcessing, setIsProcessing] = useState(false);

  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportExportOpen) return null;

  // Handle file select for Backup Import
  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In webkit/tauri environment, file.path contains the absolute system path
      const fullPath = (file as any).path || file.name;
      setImportPath(fullPath);
      setImportFileName(file.name);
    }
  };

  // Handle file select for CSV Import
  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fullPath = (file as any).path || file.name;
      setCsvImportPath(fullPath);
      setCsvImportFileName(file.name);
    }
  };

  const handleExportBackup = async () => {
    if (!exportPath.trim()) {
      showToast('Please specify a destination file path', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      await exportBackup(exportPath.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportBackup = async () => {
    if (!importPath) {
      showToast('Please select a .vlock backup file to restore', 'error');
      return;
    }
    if (!importPass) {
      showToast('Please enter the master password for the backup file', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      await importBackup(importPath.trim(), importPass);
      setIsImportExportOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = async () => {
    if (!csvExportPath.trim()) {
      showToast('Please specify a destination file path', 'error');
      return;
    }
    if (confirm('WARNING: Exporting to CSV will save all passwords in UNENCRYPTED PLAINTEXT. Are you sure you want to proceed?')) {
      setIsProcessing(true);
      try {
        await exportCsv(csvExportPath.trim());
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleImportCsv = async () => {
    if (!csvImportPath) {
      showToast('Please select a CSV file to import', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const count = await importCsv(csvImportPath.trim());
      if (count > 0) setIsImportExportOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[92vh] flex flex-col overflow-hidden">
        {/* Hidden Native File Inputs */}
        <input
          type="file"
          ref={backupFileInputRef}
          accept=".vlock,.json"
          onChange={handleBackupFileSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={csvFileInputRef}
          accept=".csv,.txt"
          onChange={handleCsvFileSelect}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Vault Import & Export</h2>
              <p className="text-[11px] text-slate-400">Backup your vault locally or migrate credentials</p>
            </div>
          </div>
          <button
            onClick={() => setIsImportExportOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 my-4 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Encrypted Backup (.vlock)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'csv'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plaintext CSV
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 text-xs pr-1">
          {activeTab === 'backup' ? (
            <>
              {/* Encrypted Export Section */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Export Encrypted Vault (.vlock)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                    AES-256-GCM
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Saves your complete vault data encrypted with your master key. Recommended for offline backups.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300">Save Destination File Path</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exportPath}
                      onChange={(e) => setExportPath(e.target.value)}
                      placeholder="/home/user/Documents/veylock_backup.vlock"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {/* Preset quick paths */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">Quick Preset:</span>
                    <button
                      type="button"
                      onClick={() => setExportPath(`${homeDir}/Documents/veylock_backup.vlock`)}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportPath(`${homeDir}/Downloads/veylock_backup.vlock`)}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      Downloads
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportPath(`${homeDir}/Desktop/veylock_backup.vlock`)}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      Desktop
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleExportBackup}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>{isProcessing ? 'Exporting...' : 'Export Encrypted Backup'}</span>
                </button>
              </div>

              {/* Encrypted Import Section */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <HardDriveUpload className="w-4 h-4 text-blue-400" />
                  <span>Restore Encrypted Backup (.vlock)</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300">Select Backup File</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => backupFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors shrink-0 text-xs"
                    >
                      <FileUp className="w-4 h-4 text-blue-400" />
                      <span>Browse System File...</span>
                    </button>
                    <input
                      type="text"
                      value={importPath}
                      onChange={(e) => setImportPath(e.target.value)}
                      placeholder="Selected file path..."
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {importFileName && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Selected file: {importFileName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300">Backup Master Password</label>
                  <input
                    type="password"
                    value={importPass}
                    onChange={(e) => setImportPass(e.target.value)}
                    placeholder="Enter master password used when creating backup..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleImportBackup}
                  disabled={isProcessing || !importPath || !importPass}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HardDriveUpload className="w-4 h-4" />
                  <span>{isProcessing ? 'Restoring...' : 'Restore Backup File'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* CSV Warning */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Plaintext CSV Security Warning</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-200/90">
                  Exporting to CSV produces an unencrypted file containing all passwords in plaintext. Anyone with access to this file can read your credentials. Delete the file immediately after use.
                </p>
              </div>

              {/* CSV Export */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Export Plaintext CSV</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300">Save CSV Destination Path</label>
                  <input
                    type="text"
                    value={csvExportPath}
                    onChange={(e) => setCsvExportPath(e.target.value)}
                    placeholder="/home/user/Documents/veylock_export.csv"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">Quick Preset:</span>
                    <button
                      type="button"
                      onClick={() => setCsvExportPath(`${homeDir}/Documents/veylock_export.csv`)}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => setCsvExportPath(`${homeDir}/Downloads/veylock_export.csv`)}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      Downloads
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleExportCsv}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isProcessing ? 'Exporting CSV...' : 'Export Plaintext CSV'}</span>
                </button>
              </div>

              {/* CSV Import */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Import Credentials from CSV</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-300">Select CSV File</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => csvFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors shrink-0 text-xs"
                    >
                      <FileUp className="w-4 h-4 text-blue-400" />
                      <span>Browse System File...</span>
                    </button>
                    <input
                      type="text"
                      value={csvImportPath}
                      onChange={(e) => setCsvImportPath(e.target.value)}
                      placeholder="Selected CSV file path..."
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {csvImportFileName && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Selected CSV: {csvImportFileName}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleImportCsv}
                  disabled={isProcessing || !csvImportPath}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HardDriveUpload className="w-4 h-4" />
                  <span>{isProcessing ? 'Importing CSV...' : 'Import Credentials from CSV'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
