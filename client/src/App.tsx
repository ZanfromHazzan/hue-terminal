import { useState } from 'react';
import { Header } from './components/Header';
import { TransactionsPage } from './pages/TransactionsPage';
import { FleetPage } from './pages/FleetPage';
import { useTheme } from './useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'transactions' | 'fleet'>('transactions');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0b0f] dark:text-zinc-200">
      <Header theme={theme} onToggleTheme={toggleTheme} activeTab={tab} onTabChange={setTab} />

      <main className="mx-auto max-w-6xl px-6 py-6">
        {tab === 'transactions' ? <TransactionsPage /> : <FleetPage />}
      </main>
    </div>
  );
}
