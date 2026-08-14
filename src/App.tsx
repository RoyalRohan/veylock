import React, { useState } from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { LockScreen } from './components/LockScreen';
import { SetupVaultModal } from './components/SetupVaultModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EntryList } from './components/EntryList';
import { EntryDetail } from './components/EntryDetail';
import { SecurityHealthDashboard } from './components/SecurityHealthDashboard';
import { EntryEditorModal } from './components/EntryEditorModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SettingsModal } from './components/SettingsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Toast } from './components/Toast';

const MainAppContent: React.FC = () => {
  const { status, activeCategory } = useVault();
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  if (!status.exists || !status.unlocked) {
    return (
      <>
        <LockScreen onOpenSetup={() => setIsSetupOpen(true)} />
        <SetupVaultModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
        <Toast />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-dark-bg text-slate-100 overflow-hidden font-sans select-none">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {activeCategory === 'health' ? (
            <SecurityHealthDashboard />
          ) : (
            <>
              <EntryList />
              <EntryDetail />
            </>
          )}
        </div>
      </div>

      {/* Application Modals */}
      <EntryEditorModal />
      <PasswordGeneratorModal />
      <SettingsModal />
      <ImportExportModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <MainAppContent />
    </VaultProvider>
  );
}
