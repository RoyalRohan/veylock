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
  Copy,
  CheckCircle2,
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
    copyToClipboard,
    showToast,
  } = useVault();

  // Mode: 'export' or 'import'
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'vlock' | 'csv'>('vlock');
  const [saveLocation, setSaveLocation] = useState<'downloads' | 'documents'>('downloads');

  // Success state after export
  const [exportSuccess, setExportSuccess] = useState<{
    path: string;
    filename: string;
    content: string;
    format: 'vlock' | 'csv';
  } | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);

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

  // Handle Export (Dual-Save: Rust direct disk write + HTML5 Blob download trigger)
  const handleExport = async () => {
    setIsProcessing(true);
    const targetPath = getExportPath(exportFormat);
    const date = new Date().toISOString().slice(0, 10);
    const filename = exportFormat === 'vlock' ? `veylock_backup_${date}.vlock` : `veylock_export_${date}.csv`;

    try {
      let res: { path: string; content: string };
      if (exportFormat === 'vlock') {
        res = await exportBackup(targetPath);
      } else {
        if (!confirm('Exporting to CSV saves passwords unencrypted. Proceed?')) {
          setIsProcessing(false);
          return;
        }
        res = await exportCsv(targetPath);
      }

      // Trigger HTML5 Blob download for 100% reliability on mobile & desktop WebViews
      try {
        const mimeType = exportFormat === 'vlock' ? 'application/json' : 'text/csv;charset=utf-8;';
        const blob = new Blob([res.content], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } catch (dlErr) {
        console.warn('HTML5 download fallback:', dlErr);
      }

      // Show success screen with path and clipboard fallback
      setExportSuccess({
        path: res.path,
        filename,
        content: res.content,
        format: exportFormat,
      });
    } catch (err: any) {
      showToast(err?.toString() || 'Export failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyExportContent = () => {
    if (!exportSuccess) return;
    copyToClipboard(exportSuccess.content, `${exportSuccess.filename} content`);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 3000);
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
    setExportSuccess(null);
    setCopiedContent(false);
  };

  const handleClose = () => {
    setIsImportExportOpen(false);
    resetImportState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl border border-theme-border animate-scale-up max-h-[92vh] flex flex-col overflow-hidden">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".vlock,.csv,.json,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-theme-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-sm shrink-0">
              {mode === 'export' ? <HardDriveDownload className="w-5 h-5" /> : <HardDriveUpload className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-theme-text tracking-tight">
                {exportSuccess ? 'Export Completed' : mode === 'export' ? 'Export Vault' : 'Import Vault'}
              </h2>
              <p className="text-xs text-theme-text-muted">
                {exportSuccess
                  ? 'Backup saved and ready on your device'
                  : mode === 'export'
                  ? 'Save an encrypted backup to your files'
                  : 'Restore credentials from a backup file'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-theme-surface text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Export Success View */}
        {exportSuccess ? (
          <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-0.5 animate-scale-up">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                  File Downloaded & Saved Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-200/80 leading-relaxed">
                  The file has been saved to your device's Downloads folder.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border space-y-2.5">
              <div>
                <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block mb-1">
                  Saved Filename
                </span>
                <span className="text-sm font-mono font-semibold text-theme-text break-all">
                  {exportSuccess.filename}
                </span>
              </div>
              <div className="pt-2 border-t border-theme-border">
                <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block mb-1">
                  Storage Location
                </span>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300 break-all bg-theme-bg px-2.5 py-1.5 rounded-lg block border border-theme-border">
                  {exportSuccess.path}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleCopyExportContent}
                className="w-full py-3 px-4 rounded-xl bg-theme-surface hover:bg-theme-bg border border-theme-border text-theme-text text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedContent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-300">Backup Content Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-theme-text-muted" />
                    <span>Copy Backup Content to Clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Export / Import Mode Selector */}
            <div className="flex bg-theme-surface p-1.5 rounded-xl border border-theme-border my-4 text-sm shrink-0">
              <button
                type="button"
                onClick={() => setMode('export')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'export'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-theme-text-muted hover:text-theme-text'
                }`}
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('import')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'import'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-theme-text-muted hover:text-theme-text'
                }`}
              >
                <HardDriveUpload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>

            {/* Content Area */}
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
              {mode === 'export' ? (
                /* EXPORT SECTION */
                <div className="space-y-4">
                  {/* Format Choice */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block">
                      Choose Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExportFormat('vlock')}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          exportFormat === 'vlock'
                            ? 'bg-blue-600/15 border-blue-500/50 text-blue-600 dark:text-blue-300 shadow-sm font-semibold'
                            : 'bg-theme-surface border-theme-border text-theme-text-muted hover:text-theme-text'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Shield className={`w-4 h-4 ${exportFormat === 'vlock' ? 'text-blue-500' : 'text-theme-text-muted'}`} />
                          <span className="text-sm font-semibold">Encrypted</span>
                        </div>
                        <span className="text-xs text-theme-text-muted block">.vlock (Safe Backup)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExportFormat('csv')}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          exportFormat === 'csv'
                            ? 'bg-amber-600/15 border-amber-500/50 text-amber-600 dark:text-amber-300 shadow-sm font-semibold'
                            : 'bg-theme-surface border-theme-border text-theme-text-muted hover:text-theme-text'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <FileSpreadsheet className={`w-4 h-4 ${exportFormat === 'csv' ? 'text-amber-500' : 'text-theme-text-muted'}`} />
                          <span className="text-sm font-semibold">CSV</span>
                        </div>
                        <span className="text-xs text-theme-text-muted block">.csv (Spreadsheet)</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block">
                      Save Location
                    </label>
                    <div className="flex items-center gap-2 bg-theme-surface p-1.5 rounded-xl border border-theme-border">
                      <button
                        type="button"
                        onClick={() => setSaveLocation('downloads')}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          saveLocation === 'downloads'
                            ? 'bg-theme-bg text-theme-text border border-theme-border font-semibold shadow-sm'
                            : 'text-theme-text-muted hover:text-theme-text'
                        }`}
                      >
                        <Folder className="w-4 h-4 text-blue-500" />
                        <span>Downloads Folder</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaveLocation('documents')}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          saveLocation === 'documents'
                            ? 'bg-theme-bg text-theme-text border border-theme-border font-semibold shadow-sm'
                            : 'text-theme-text-muted hover:text-theme-text'
                        }`}
                      >
                        <Folder className="w-4 h-4 text-blue-500" />
                        <span>Documents Folder</span>
                      </button>
                    </div>
                  </div>

                  {/* Security Hint */}
                  {exportFormat === 'csv' ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>CSV files are unencrypted. Anyone who opens the file can see your passwords in plain text.</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Protected with your current master password using AES-256-GCM.</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <HardDriveDownload className="w-4 h-4" />
                    <span>{isProcessing ? 'Saving to Files...' : `Export ${exportFormat === 'vlock' ? 'Encrypted Backup' : 'CSV File'}`}</span>
                  </button>
                </div>
              ) : (
                /* IMPORT SECTION */
                <div className="space-y-4">
                  {/* File Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block">
                      Select Backup or CSV File
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-5 rounded-xl border border-dashed border-theme-border hover:border-blue-500/60 bg-theme-surface/50 hover:bg-theme-surface transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-theme-surface group-hover:bg-blue-600/20 text-theme-text-muted group-hover:text-blue-500 flex items-center justify-center transition-colors">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-theme-text block">
                          {selectedFileName || 'Tap to choose file'}
                        </span>
                        <span className="text-xs text-theme-text-muted mt-0.5 block">
                          Supports .vlock (encrypted backup) and .csv
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Password Field (Only for .vlock files) */}
                  {detectedType !== 'csv' && selectedFileName && (
                    <div className="space-y-1.5 animate-scale-up">
                      <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block">
                        Backup Master Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={importPass}
                          onChange={(e) => setImportPass(e.target.value)}
                          placeholder="Enter password for this backup..."
                          className="input-themed w-full rounded-xl pl-9 pr-3.5 py-2.5 text-sm"
                        />
                        <Lock className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isProcessing || !selectedFileName || (detectedType === 'vlock' && !importPass)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
          </>
        )}
      </div>
    </div>
  );
};
