import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  Landmark,
  X,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { useAuth } from '../../context/AuthContext';

export type NavPage =
  | 'dashboard'
  | 'students'
  | 'search-students'
  | 'add-student'
  | 'student-detail'
  | 'student-financial'
  | 'income'
  | 'add-income'
  | 'expenses'
  | 'add-expense'
  | 'transactions'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage, extraData?: any) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { settings, theme, toggleTheme, students, transactions } = useDars();
  const { adminUsername, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'add-student', label: 'Add Student', icon: UserPlus },
    { id: 'income', label: 'Income', icon: ArrowDownLeft },
    { id: 'add-income', label: 'Add Income', icon: ArrowDownLeft, subLabel: 'Single/Bulk' },
    { id: 'expenses', label: 'Expenses', icon: ArrowUpRight },
    { id: 'add-expense', label: 'Add Expense', icon: ArrowUpRight },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: transactions.length },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSelect = (pageId: string) => {
    onNavigate(pageId as NavPage);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white truncate">
              {settings.dars_name || 'Madinul Qutaba'}
            </h1>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
              DARS Student Fund
            </p>
          </div>
        </div>

        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Links with Mobile-friendly touch targets */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.id ||
            (item.id === 'students' &&
              (currentPage === 'student-detail' ||
                currentPage === 'student-financial' ||
                currentPage === 'search-students'));

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.subLabel && (
                  <span className="text-[10px] text-slate-400 font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {item.subLabel}
                  </span>
                )}
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User & Appearance Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 pb-6 md:pb-3">
        {/* Theme Toggle with touch target */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Theme</span>
          <button
            onClick={toggleTheme}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-semibold shadow-xs hover:border-emerald-500 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-emerald-400" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>

        {/* Administrator Profile Card & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Administrator</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">@{adminUsername}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30 no-print">
        {content}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
