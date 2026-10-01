import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';
import { exportToCSV } from '../../utils/formatters';

interface StudentFinancialSummaryProps {
  studentId: string;
  onNavigate: (page: NavPage, data?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StudentFinancialSummary: React.FC<StudentFinancialSummaryProps> = ({
  studentId,
  onNavigate,
  showToast,
}) => {
  const { students, getStudentFinancials, getStudentLedger, formatCurrency, formatDate, settings } = useDars();

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  const student = students.find((s) => s.id === studentId);
  const financials = getStudentFinancials(studentId);
  const allLedger = getStudentLedger(studentId);

  const filteredTransactions = useMemo(() => {
    return allLedger.filter((tx) => {
      if (activeTab === 'income' && tx.type !== 'income') return false;
      if (activeTab === 'expense' && tx.type !== 'expense') return false;
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      if (minAmount && tx.amount < parseFloat(minAmount)) return false;
      if (maxAmount && tx.amount > parseFloat(maxAmount)) return false;
      return true;
    });
  }, [allLedger, activeTab, dateFrom, dateTo, minAmount, maxAmount]);

  const incomeTx = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTx = filteredTransactions.filter((t) => t.type === 'expense');

  if (!student || !financials) {
    return (
      <div className="p-8 text-center text-slate-500">
        Student not found.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount'];
    const rows = filteredTransactions.map((tx) => [
      formatDate(tx.date),
      tx.type.toUpperCase(),
      tx.description,
      tx.amount,
    ]);
    exportToCSV(`${student.student_id}_Financial_Summary`, rows, headers);
    showToast('info', 'Export Successful', 'Financial summary downloaded as CSV.');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-16 md:pb-0">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <button
          onClick={() => onNavigate('student-detail', { studentId: student.id })}
          className="min-h-[40px] inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Official Printable Header */}
      <div className="hidden print-only text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold">{settings.dars_name}</h1>
        <p className="text-xs text-slate-600">{settings.dars_address}</p>
        <p className="text-xs text-slate-600">Contact: {settings.phone} · {settings.email}</p>
        <h2 className="text-sm font-bold uppercase mt-2">Student Fund Statement</h2>
      </div>

      {/* Prominent Student Name Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
              Student Financial Account
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {student.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
              ID: {student.student_id} · {student.district}, {student.state} · Ph: {student.phone}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Statement Date</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>
        </div>

        {/* Big 3 Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-5 pt-5 sm:mt-6 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Total Fund Income
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {formatCurrency(financials.total_income)}
            </div>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Sum of all contributions</p>
          </div>

          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              Total Fund Expenses
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(financials.total_expense)}
            </div>
            <p className="text-[10px] text-rose-600/80 mt-0.5">Sum of books, mess & fees</p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              financials.balance >= 0
                ? 'bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700'
                : 'bg-rose-100/60 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-800 dark:text-slate-200">
              Current Net Balance
            </span>
            <div
              className={`text-xl sm:text-2xl font-mono font-black mt-1 ${
                financials.balance >= 0
                  ? 'text-emerald-900 dark:text-emerald-200'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {formatCurrency(financials.balance)}
            </div>
            <p className="text-[10px] opacity-80 mt-0.5">Balance = Income - Expense</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Selector */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({allLedger.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
          </div>

          {(dateFrom || dateTo || minAmount || maxAmount) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setMinAmount('');
                setMaxAmount('');
              }}
              className="text-xs text-rose-500 hover:underline font-bold self-end sm:self-auto py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Date From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Date To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Min (₹):</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Max (₹):</label>
            <input
              type="number"
              placeholder="10000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
            />
          </div>
        </div>
      </div>

      {/* Income History Section */}
      {(activeTab === 'all' || activeTab === 'income') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden print-card space-y-3">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Income History</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {incomeTx.length} records · {formatCurrency(incomeTx.reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>

          {incomeTx.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No income records match filter.</div>
          ) : (
            <>
              {/* Mobile Card List for Income History */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 px-4">
                {incomeTx.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{formatDate(tx.date)}</p>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {incomeTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Expense History Section */}
      {(activeTab === 'all' || activeTab === 'expense') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden print-card space-y-3">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Expense History</h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600">
              {expenseTx.length} records · {formatCurrency(expenseTx.reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>

          {expenseTx.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No expense records match filter.</div>
          ) : (
            <>
              {/* Mobile Card List for Expense History */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 px-4">
                {expenseTx.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{formatDate(tx.date)}</p>
                    </div>
                    <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400 shrink-0">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {expenseTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                          -{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
