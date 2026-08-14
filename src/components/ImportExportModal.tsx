import React, { useState } from 'react';
import { X, HardDriveDownload, HardDriveUpload, AlertTriangle, FileSpreadsheet, Shield } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportOpen,
    setIsImportExportOpen,
    exportBackup,
    importBackup,
    exportCsv,
    importCsv,
  } = useVault();

  const [exportPath, setExportPath] = useState('/tmp/my_vault_backup.vlock');
  const [importPath, setImportPath] = useState('');
  const [importPass, setImportPass] = useState('');

  const [csvExportPath, setCsvExportPath] = useState('/tmp/passwords_export.csv');
  const [csvImportPath, setCsvImportPath] = useState('');

  const [activeTab, setActiveTab] = useState<'backup' | 'csv'>('backup');

  if (!isImportExportOpen) return null;

  const handleExportBackup = async () => {
    if (!exportPath) return;
    await exportBackup(exportPath);
  };

  const handleImportBackup = async () => {
    if (!importPath || !importPass) return;
    await importBackup(importPath, importPass);
  };

  const handleExportCsv = async () => {
    if (!csvExportPath) return;
    if (confirm('WARNING: Exporting to CSV will save your passwords in UNENCRYPTED PLAINTEXT. Are you sure you want to proceed?')) {
      await exportCsv(csvExportPath);
    }
  };

  const handleImportCsv = async () => {
    if (!csvImportPath) return;
    await importCsv(csvImportPath);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Vault Backup & Import / Export</h2>
          </div>
          <button
            onClick={() => setIsImportExportOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 my-4 text-xs">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'backup' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Encrypted Backup (.vlock)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'csv' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plaintext CSV
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 text-xs">
          {activeTab === 'backup' ? (
            <>
              {/* Encrypted Export */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Export Encrypted Vault Backup</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Generates an encrypted portable <code>.vlock</code> file containing all items and your KDF salt. Recommended for backups.
                </p>
                <input
                  type="text"
                  value={exportPath}
                  onChange={(e) => setExportPath(e.target.value)}
                  placeholder="Destination path..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow transition-colors"
                >
                  Export Encrypted Backup
                </button>
              </div>

              {/* Encrypted Import */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <HardDriveUpload className="w-4 h-4 text-brand-400" />
                  <span>Restore from Encrypted Backup</span>
                </h3>
                <input
                  type="text"
                  value={importPath}
                  onChange={(e) => setImportPath(e.target.value)}
                  placeholder="Source .vlock file path..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <input
                  type="password"
                  value={importPass}
                  onChange={(e) => setImportPass(e.target.value)}
                  placeholder="Master password for backup file..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
                <button
                  onClick={handleImportBackup}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors"
                >
                  Restore Backup
                </button>
              </div>
            </>
          ) : (
            <>
              {/* CSV Export Warning */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Plaintext CSV Export Security Warning</span>
                </div>
                <p className="leading-relaxed">
                  Exporting to CSV produces an unencrypted file containing all passwords in plaintext. Anyone who accesses this file can read your secrets. Delete the file immediately after use.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Export Plaintext CSV</span>
                </h3>
                <input
                  type="text"
                  value={csvExportPath}
                  onChange={(e) => setCsvExportPath(e.target.value)}
                  placeholder="Export CSV file path..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={handleExportCsv}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow transition-colors"
                >
                  Export Plaintext CSV
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                  <span>Import Plaintext CSV</span>
                </h3>
                <input
                  type="text"
                  value={csvImportPath}
                  onChange={(e) => setCsvImportPath(e.target.value)}
                  placeholder="CSV file path to import..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={handleImportCsv}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors"
                >
                  Import Credentials from CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
