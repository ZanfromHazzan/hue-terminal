import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTab: 'transactions' | 'fleet';
  onTabChange: (tab: 'transactions' | 'fleet') => void;
}

const TABS: { key: 'transactions' | 'fleet'; label: string }[] = [
  { key: 'transactions', label: 'Transaction Overview' },
  { key: 'fleet', label: 'Terminal Sync & Status' },
];

export function Header({ theme, onToggleTheme, activeTab, onTabChange }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">OmniPay Terminal</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-500">Transaction Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
            Internal
          </span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
      <nav className="flex gap-1 px-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
