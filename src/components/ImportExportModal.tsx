import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  HardDriveDownload,
  HardDriveUpload,
  AlertTriangle,
  FileSpreadsheet,
  Shield,
  FileUp,
  FileText,
  Folder,
  Lock,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { documentDir, downloadDir, desktopDir } from '@tauri-apps/api/path';

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

  // Resolved system directories
  const [docDir, setDocDir] = useState('');
  const [dlDir, setDlDir] = useState('');
  const [dtDir, setDtDir] = useState('');

  // Encrypted Backup States
  const [backupFileName, setBackupFileName] = useState(`veylock_backup_${new Date().toISOString().slice(0, 10)}.vlock`);
  const [backupFolder, setBackupFolder] = useState<'documents' | 'downloads' | 'desktop'>('documents');
  const [importPath, setImportPath] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importPass, setImportPass] = useState('');
  const [importFileName, setImportFileName] = useState('');

  // Plaintext CSV States
  const [csvFileName, setCsvFileName] = useState(`veylock_export_${new Date().toISOString().slice(0, 10)}.csv`);
  const [csvFolder, setCsvFolder] = useState<'documents' | 'downloads' | 'desktop'>('documents');
  const [csvImportPath, setCsvImportPath] = useState('');
  const [csvImportContent, setCsvImportContent] = useState('');
  const [csvImportFileName, setCsvImportFileName] = useState('');

  const [activeTab, setActiveTab] = useState<'backup' | 'csv'>('backup');
  const [isProcessing, setIsProcessing] = useState(false);

  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Resolve user system paths dynamically on mount
  useEffect(() => {
    const resolvePaths = async () => {
      try {
        const doc = await documentDir();
        const dl = await downloadDir();
        const dt = await desktopDir();
        setDocDir(doc);
        setDlDir(dl);
        setDtDir(dt);
      } catch (err) {
        console.warn('System directory resolution fallback:', err);
      }
    };
    resolvePaths();
  }, []);

  if (!isImportExportOpen) return null;

  // Helpers to get active target paths
  const getBackupTargetPath = () => {
    const dir = backupFolder === 'documents' ? docDir : backupFolder === 'downloads' ? dlDir : dtDir;
    return dir ? `${dir}/${backupFileName}` : backupFileName;
  };

  const getCsvTargetPath = () => {
    const dir = csvFolder === 'documents' ? docDir : csvFolder === 'downloads' ? dlDir : dtDir;
    return dir ? `${dir}/${csvFileName}` : csvFileName;
  };

  // Handle file select for Backup Import
  const handleBackupFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fullPath = (file as any).path || '';
      setImportPath(fullPath);
      setImportFileName(file.name);
      try {
        const text = await file.text();
        setImportContent(text);
      } catch (err) {
        console.error('Failed to read backup file:', err);
      }
    }
  };

  // Handle file select for CSV Import
  const handleCsvFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fullPath = (file as any).path || '';
      setCsvImportPath(fullPath);
      setCsvImportFileName(file.name);
      try {
        const text = await file.text();
        setCsvImportContent(text);
      } catch (err) {
        console.error('Failed to read CSV file:', err);
      }
    }
  };

  const handleExportBackup = async () => {
    if (!backupFileName.trim()) {
      showToast('Please enter a file name', 'error');
      return;
    }
    const finalPath = getBackupTargetPath();
    setIsProcessing(true);
    try {
      await exportBackup(finalPath);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportBackup = async () => {
    const source = importContent || importPath;
    if (!source) {
      showToast('Please select a backup file to restore', 'error');
      return;
    }
    if (!importPass) {
      showToast('Please enter the password for this backup file', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      await importBackup(source, importPass);
      setIsImportExportOpen(false);
      setImportPass('');
      setImportContent('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = async () => {
    if (!csvFileName.trim()) {
      showToast('Please enter a file name', 'error');
      return;
    }
    const finalPath = getCsvTargetPath();
    if (confirm('WARNING: Exporting to CSV will save all passwords in UNENCRYPTED PLAINTEXT. Are you sure you want to proceed?')) {
      setIsProcessing(true);
      try {
        await exportCsv(finalPath);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleImportCsv = async () => {
    const source = csvImportContent || csvImportPath;
    if (!source) {
      showToast('Please select a CSV file to import', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const count = await importCsv(source);
      if (count > 0) {
        setIsImportExportOpen(false);
        setCsvImportContent('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800 animate-scale-up max-h-[94vh] flex flex-col overflow-hidden">
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
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Vault Backup & Restore</h2>
              <p className="text-[11px] text-slate-400">Save encrypted backups locally or restore previous vaults</p>
            </div>
          </div>
          <button
            onClick={() => setIsImportExportOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 my-4 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Backup (.vlock)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'csv'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Plaintext CSV</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {activeTab === 'backup' ? (
            <>
              {/* Encrypted Export Section */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Create Safe Backup</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold">
                    AES-256-GCM Encrypted
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Saves your complete vault data encrypted with your master key. Recommended for safe offline archiving.
                </p>

                {/* Simplified Save Settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Backup File Name</label>
                    <input
                      type="text"
                      value={backupFileName}
                      onChange={(e) => setBackupFileName(e.target.value)}
                      placeholder="Backup file name..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Save Location</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 h-[34px]">
                      <button
                        type="button"
                        onClick={() => setBackupFolder('documents')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          backupFolder === 'documents' ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Docs
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackupFolder('downloads')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          backupFolder === 'downloads' ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Downloads
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackupFolder('desktop')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          backupFolder === 'desktop' ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Desktop
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Folder className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Target Destination Path</span>
                    <span className="text-[10px] text-slate-300 font-mono break-all leading-normal">{getBackupTargetPath()}</span>
                  </div>
                </div>

                <button
                  onClick={handleExportBackup}
                  disabled={isProcessing || !backupFileName}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>{isProcessing ? 'Saving Backup...' : 'Save Backup File'}</span>
                </button>
              </div>

              {/* Encrypted Import Section */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3.5 shadow-sm">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <HardDriveUpload className="w-4 h-4 text-blue-400" />
                  <span>Restore From Backup</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Backup File Selection</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => backupFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors shrink-0 text-xs cursor-pointer"
                    >
                      <FileUp className="w-4 h-4 text-blue-400" />
                      <span>Choose File...</span>
                    </button>
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap min-h-[34px]">
                      {importFileName || 'No backup file chosen'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Master Password of the Backup</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={importPass}
                      onChange={(e) => setImportPass(e.target.value)}
                      placeholder="Enter password used when creating backup..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  onClick={handleImportBackup}
                  disabled={isProcessing || (!importPath && !importContent) || !importPass}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>CSV Plaintext Security Warning</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-200/90">
                  Exporting to CSV produces an unencrypted file containing all passwords in plaintext. Anyone with access to this file can read your credentials. Store in an encrypted volume or delete immediately after use.
                </p>
              </div>

              {/* CSV Export */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3.5 shadow-sm">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Export CSV (Plaintext)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CSV File Name</label>
                    <input
                      type="text"
                      value={csvFileName}
                      onChange={(e) => setCsvFileName(e.target.value)}
                      placeholder="Export file name..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Save Location</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 h-[34px]">
                      <button
                        type="button"
                        onClick={() => setCsvFolder('documents')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          csvFolder === 'documents' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Docs
                      </button>
                      <button
                        type="button"
                        onClick={() => setCsvFolder('downloads')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          csvFolder === 'downloads' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Downloads
                      </button>
                      <button
                        type="button"
                        onClick={() => setCsvFolder('desktop')}
                        className={`text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                          csvFolder === 'desktop' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Desktop
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Folder className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Target Destination Path</span>
                    <span className="text-[10px] text-slate-300 font-mono break-all leading-normal">{getCsvTargetPath()}</span>
                  </div>
                </div>

                <button
                  onClick={handleExportCsv}
                  disabled={isProcessing || !csvFileName}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isProcessing ? 'Exporting CSV...' : 'Export Plaintext CSV'}</span>
                </button>
              </div>

              {/* CSV Import */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3.5 shadow-sm">
                <h3 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Import From CSV</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CSV File Selection</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => csvFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors shrink-0 text-xs cursor-pointer"
                    >
                      <FileUp className="w-4 h-4 text-blue-400" />
                      <span>Choose File...</span>
                    </button>
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap min-h-[34px]">
                      {csvImportFileName || 'No CSV file chosen'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleImportCsv}
                  disabled={isProcessing || (!csvImportPath && !csvImportContent)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
