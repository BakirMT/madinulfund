import React from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  UserPlus,
  PlusCircle,
  MinusCircle,
  Search,
  ArrowRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { FinancialChart } from './FinancialChart';
import { NavPage } from '../navigation/Sidebar';

interface DashboardProps {
  onNavigate: (page: NavPage, data?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { stats, students, formatCurrency, formatDate, settings } = useDars();

  const isEmpty = students.length === 0;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-16 md:pb-0">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-emerald-950/10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-10 hidden lg:block pointer-events-none">
          <Scale className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] sm:text-xs font-bold tracking-wide uppercase mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Islamic DARS Fund System</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {settings.dars_name}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-emerald-100/90 leading-relaxed">
            Centralized fund accounting for DARS students. Manage contributions, welfare grants, kitab allocations, and running balances.
          </p>

          {/* Quick-action buttons: Mobile-optimized 2x2 grid on phones, horizontal wrap on tablets/desktops */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('add-student')}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => onNavigate('add-income')}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Add Income</span>
            </button>

            <button
              onClick={() => onNavigate('add-expense')}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition-all active:scale-95"
            >
              <MinusCircle className="w-4 h-4 shrink-0" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => onNavigate('search-students')}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition-all active:scale-95"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Banner if no students */}
      {isEmpty && (
        <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No student records yet.</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Get started by registering your first student in the DARS fund system. You can then record individual contributions or distribute bulk funds.
            </p>
          </div>
          <button
            onClick={() => onNavigate('add-student')}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Your First Student</span>
          </button>
        </div>
      )}

      {/* Summary Metrics Grid: 2 columns on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.total_students}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">Enrolled</p>
        </div>

        {/* Total Income */}
        <div
          onClick={() => onNavigate('income')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono truncate">
            {formatCurrency(stats.total_income)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">All-time received</p>
        </div>

        {/* Total Expenses */}
        <div
          onClick={() => onNavigate('expenses')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-rose-500/50 cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Expense</span>
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono truncate">
            {formatCurrency(stats.total_expenses)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">Disbursed to date</p>
        </div>

        {/* Total Balance */}
        <div
          onClick={() => onNavigate('reports')}
          className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs cursor-pointer transition-all active:scale-98 ${
            stats.total_balance >= 0
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Total Balance
            </span>
            <Scale className={`w-4 h-4 ${stats.total_balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono truncate ${
              stats.total_balance >= 0
                ? 'text-emerald-800 dark:text-emerald-300'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {formatCurrency(stats.total_balance)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Net In Hand</p>
        </div>

        {/* This Month's Income */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Month Inc.</span>
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
            {formatCurrency(stats.this_month_income)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">Current month</p>
        </div>

        {/* This Month's Expenses */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Month Exp.</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
            {formatCurrency(stats.this_month_expenses)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">Current month</p>
        </div>
      </div>

      {/* Main Grid: Financial Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Financial Chart Column (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Financial Trends & Analysis</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Monthly breakdown of income, expenses, and net balance</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 self-start xs:self-auto py-1"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <FinancialChart monthlyData={stats.monthly_data} />
        </div>

        {/* Recent Activity Column (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Latest transactions & registrations</p>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 py-1"
              >
                View All
              </button>
            </div>

            {stats.recent_activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats.recent_activities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (act.student_id) {
                        onNavigate('student-detail', { studentId: act.student_id });
                      }
                    }}
                    className="py-3 min-h-[50px] flex items-start justify-between gap-2.5 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors active:scale-99"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          act.type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : act.type === 'expense'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {act.type === 'income' && <TrendingUp className="w-4 h-4" />}
                        {act.type === 'expense' && <TrendingDown className="w-4 h-4" />}
                        {act.type === 'student' && <Users className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {act.student_name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{formatDate(act.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{act.type}</span>
                        </div>
                      </div>
                    </div>

                    {act.amount !== undefined && (
                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold text-xs sm:text-sm ${
                            act.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {act.type === 'income' ? '+' : '-'}
                          {formatCurrency(act.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('search-students')}
              className="w-full min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>Search All Students</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
