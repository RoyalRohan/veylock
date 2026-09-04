import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  HardDriveDownload,
  HardDriveUpload,
  Shield,
  FileSpreadsheet,
  FileUp,
  Check,
  Lock,
  Folder,
  AlertTriangle,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { documentDir, downloadDir } from '@tauri-apps/api/path';

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

  // Mode: 'export' or 'import'
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'vlock' | 'csv'>('vlock');
  const [saveLocation, setSaveLocation] = useState<'downloads' | 'documents'>('downloads');

  // Import state
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importPath, setImportPath] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importPass, setImportPass] = useState('');
  const [detectedType, setDetectedType] = useState<'vlock' | 'csv' | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [docDir, setDocDir] = useState('');
  const [dlDir, setDlDir] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve system paths on mount
  useEffect(() => {
    const resolve = async () => {
      try {
        const [doc, dl] = await Promise.all([documentDir(), downloadDir()]);
        setDocDir(doc);
        setDlDir(dl);
      } catch (err) {
        console.warn('Directory fallback:', err);
      }
    };
    resolve();
  }, []);

  if (!isImportExportOpen) return null;

  const getExportPath = (format: 'vlock' | 'csv') => {
    const dir = saveLocation === 'downloads' ? (dlDir || docDir) : (docDir || dlDir);
    const date = new Date().toISOString().slice(0, 10);
    const name = format === 'vlock' ? `veylock_backup_${date}.vlock` : `veylock_export_${date}.csv`;
    return dir ? `${dir}/${name}` : name;
  };

  // Handle Export
  const handleExport = async () => {
    setIsProcessing(true);
    const targetPath = getExportPath(exportFormat);

    try {
      if (exportFormat === 'vlock') {
        await exportBackup(targetPath);
      } else {
        if (!confirm('Exporting to CSV saves passwords unencrypted. Proceed?')) {
          setIsProcessing(false);
          return;
        }
        await exportCsv(targetPath);
      }
      setIsImportExportOpen(false);
    } catch (err: any) {
      showToast(err?.toString() || 'Export failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Selection for Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const fullPath = (file as any).path || '';
    setImportPath(fullPath);

    // Auto-detect format
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
      setDetectedType('csv');
    } else {
      setDetectedType('vlock');
    }

    try {
      const text = await file.text();
      setImportContent(text);
    } catch (err) {
      console.error('File read error:', err);
    }
  };

  // Handle Import
  const handleImport = async () => {
    const source = importContent || importPath;
    if (!source) {
      showToast('Please select a file to import', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (detectedType === 'csv') {
        const count = await importCsv(source);
        if (count > 0) {
          setIsImportExportOpen(false);
          resetImportState();
        }
      } else {
        if (!importPass) {
          showToast('Enter the master password for this backup', 'error');
          setIsProcessing(false);
          return;
        }
        await importBackup(source, importPass);
        setIsImportExportOpen(false);
        resetImportState();
      }
    } catch (err: any) {
      showToast(err?.toString() || 'Import failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImportState = () => {
    setSelectedFileName('');
    setImportPath('');
    setImportContent('');
    setImportPass('');
    setDetectedType(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-800 animate-scale-up max-h-[92vh] flex flex-col overflow-hidden">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".vlock,.csv,.json,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm shrink-0">
              {mode === 'export' ? <HardDriveDownload className="w-4 h-4" /> : <HardDriveUpload className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                {mode === 'export' ? 'Export Vault' : 'Import Vault'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {mode === 'export' ? 'Save a local backup of your vault' : 'Restore credentials from a backup file'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsImportExportOpen(false);
              resetImportState();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export / Import Mode Selector */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 my-4 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setMode('export')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'export'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('import')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'import'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDriveUpload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
          {mode === 'export' ? (
            /* EXPORT SECTION */
            <div className="space-y-4">
              {/* Format Choice */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Choose Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportFormat('vlock')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'vlock'
                        ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className={`w-4 h-4 ${exportFormat === 'vlock' ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold">Encrypted</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">.vlock (Safe Backup)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'csv'
                        ? 'bg-amber-600/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className={`w-4 h-4 ${exportFormat === 'csv' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold">CSV</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">.csv (Spreadsheet)</span>
                  </button>
                </div>
              </div>

              {/* Save Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Save To
                </label>
                <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSaveLocation('downloads')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      saveLocation === 'downloads'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Downloads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveLocation('documents')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      saveLocation === 'documents'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Documents</span>
                  </button>
                </div>
              </div>

              {/* Security Hint */}
              {exportFormat === 'csv' ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>CSV files are unencrypted. Anyone who opens the file can see your passwords.</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Protected with your current master password using AES-256-GCM.</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExport}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>{isProcessing ? 'Exporting...' : `Export ${exportFormat === 'vlock' ? 'Encrypted Backup' : 'CSV File'}`}</span>
              </button>
            </div>
          ) : (
            /* IMPORT SECTION */
            <div className="space-y-4">
              {/* File Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Backup or CSV File
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/40 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-colors">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-slate-200 block">
                      {selectedFileName || 'Tap to choose file'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports .vlock (encrypted backup) and .csv
                    </span>
                  </div>
                </button>
              </div>

              {/* Password Field (Only for .vlock files) */}
              {detectedType !== 'csv' && selectedFileName && (
                <div className="space-y-1.5 animate-scale-up">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Backup Master Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={importPass}
                      onChange={(e) => setImportPass(e.target.value)}
                      placeholder="Enter password for this backup..."
                      className="w-full bg-[#0d1222] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleImport}
                disabled={isProcessing || !selectedFileName || (detectedType === 'vlock' && !importPass)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Importing...'
                    : detectedType === 'csv'
                    ? 'Import Credentials from CSV'
                    : 'Restore Encrypted Backup'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
