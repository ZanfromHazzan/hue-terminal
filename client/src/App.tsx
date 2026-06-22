import { useState } from 'react';
import { Header } from './components/Header';
import { TransactionsPage } from './pages/TransactionsPage';
import { FleetPage } from './pages/FleetPage';
import { TerminalDetailPage } from './pages/TerminalDetailPage';
import { useTheme } from './useTheme';
import type { FleetTerminal } from './types';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'transactions' | 'fleet'>('transactions');
  const [selectedTerminal, setSelectedTerminal] = useState<FleetTerminal | null>(null);

  function handleTabChange(next: 'transactions' | 'fleet') {
    setSelectedTerminal(null);
    setTab(next);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0b0f] dark:text-zinc-200">
      <Header theme={theme} onToggleTheme={toggleTheme} activeTab={tab} onTabChange={handleTabChange} />

      <main className="mx-auto max-w-6xl px-6 py-6">
        {selectedTerminal ? (
          <TerminalDetailPage terminal={selectedTerminal} onBack={() => setSelectedTerminal(null)} />
        ) : tab === 'transactions' ? (
          <TransactionsPage />
        ) : (
          <FleetPage onSelectTerminal={setSelectedTerminal} />
        )}
      </main>
    </div>
  );
}
