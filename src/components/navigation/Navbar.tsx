import React from 'react';
import { Search, Landmark, Sun, Moon, Sparkles } from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from './Sidebar';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage, data?: any) => void;
  onOpenMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { settings, theme, toggleTheme } = useDars();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'students':
        return 'Student Directory & Fund Balances';
      case 'search-students':
        return 'Search Student Fund Records';
      case 'add-student':
        return 'Register New Student';
      case 'student-detail':
        return 'Student Profile & Ledger';
      case 'student-financial':
        return 'Student Financial Summary';
      case 'income':
      case 'add-income':
        return 'Add Income / Bulk Distribution';
      case 'expenses':
      case 'add-expense':
        return 'Record Student Expense';
      case 'transactions':
        return 'All Fund Transactions';
      case 'reports':
        return 'Financial Reports & Statements';
      case 'settings':
        return 'Institution & Fund Settings';
      default:
        return 'DARS Student Fund';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 no-print transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Institution Branding & Page Title */}
        {/* Top menu button hidden on mobile size per requirement (Mobile navigation is managed via MobileBottomNav) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Institution Emblem */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-emerald-700 transition-colors"
            title="Go to Dashboard"
          >
            <Landmark className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                {settings.dars_name || 'Madinul Qutaba'}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="truncate">Student Fund Management</span>
            </div>
          </div>
        </div>

        {/* Right Section: Compact Actions for Mobile, Extended on Desktop */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => onNavigate('search-students')}
            className="flex items-center justify-center min-h-[40px] px-3 sm:px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all"
            aria-label="Search Students"
            title="Search Students"
          >
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 sm:mr-1.5 shrink-0" />
            <span className="hidden sm:inline">Search...</span>
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
