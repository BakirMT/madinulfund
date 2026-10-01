import React from 'react';
import { LayoutDashboard, Users, PlusCircle, MinusCircle, Menu } from 'lucide-react';
import { NavPage } from './Sidebar';

interface MobileBottomNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage, data?: any) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
}) => {
  const isDashboard = currentPage === 'dashboard';
  const isStudents =
    currentPage === 'students' ||
    currentPage === 'search-students' ||
    currentPage === 'student-detail' ||
    currentPage === 'student-financial' ||
    currentPage === 'add-student';
  const isIncome = currentPage === 'add-income' || currentPage === 'income';
  const isExpense = currentPage === 'add-expense' || currentPage === 'expenses';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom,0px)] no-print shadow-xl">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
            isDashboard
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboard className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Students */}
        <button
          onClick={() => onNavigate('students')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
            isStudents
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="Students Directory"
        >
          <Users className={`w-5 h-5 ${isStudents ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Students</span>
        </button>

        {/* Add Income Center Quick Action */}
        <button
          onClick={() => onNavigate('add-income')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
            isIncome
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
          }`}
          aria-label="Add Income"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-semibold">Income</span>
        </button>

        {/* Add Expense */}
        <button
          onClick={() => onNavigate('add-expense')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
            isExpense
              ? 'text-rose-700 dark:text-rose-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
          }`}
          aria-label="Add Expense"
        >
          <MinusCircle className={`w-5 h-5 ${isExpense ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Expense</span>
        </button>

        {/* Menu Drawer */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
