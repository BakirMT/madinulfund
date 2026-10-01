import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Edit2,
  Trash2,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Transaction } from '../../types';
import { exportToCSV } from '../../utils/formatters';

interface TransactionManagementProps {
  onNavigate: (page: NavPage, data?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TransactionManagement: React.FC<TransactionManagementProps> = ({
  onNavigate,
  showToast,
}) => {
  const {
    transactions,
    students,
    deleteTransaction,
    updateTransaction,
    formatCurrency,
    formatDate,
    getStudentLedger,
  } = useDars();

  const [searchDesc, setSearchDesc] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Edit form state
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const studentMap = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  // Pre-calculate running balances per student
  const studentLedgerMap = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s) => {
      const ledger = getStudentLedger(s.id);
      ledger.forEach((tx) => {
        map.set(tx.id, tx.running_balance);
      });
    });
    return map;
  }, [students, getStudentLedger, transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (studentFilter !== 'all' && tx.student_id !== studentFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      if (minAmount && tx.amount < parseFloat(minAmount)) return false;
      if (maxAmount && tx.amount > parseFloat(maxAmount)) return false;
      if (searchDesc.trim() && !tx.description.toLowerCase().includes(searchDesc.toLowerCase()))
        return false;
      return true;
    });
  }, [transactions, studentFilter, typeFilter, dateFrom, dateTo, minAmount, maxAmount, searchDesc]);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteTransaction(deleteTargetId);
      showToast('success', 'Transaction Deleted', 'Recalculated student balance automatically.');
      setDeleteTargetId(null);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount));
    setEditDesc(tx.description);
    setEditDate(tx.date);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amt = parseFloat(editAmount);
    if (amt <= 0) {
      showToast('error', 'Invalid Amount', 'Transaction amount must be greater than zero.');
      return;
    }
    if (!editDesc.trim()) {
      showToast('error', 'Description Required', 'Please enter a valid description.');
      return;
    }

    try {
      updateTransaction(editingTx.id, {
        amount: amt,
        description: editDesc.trim(),
        date: editDate,
      });
      showToast(
        'success',
        'Transaction Updated',
        'Updated record and recalculated student balance automatically.'
      );
      setEditingTx(null);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Student Name', 'Student ID', 'Type', 'Amount', 'Description', 'Running Balance'];
    const rows = filtered.map((tx) => {
      const st = studentMap.get(tx.student_id);
      const rb = studentLedgerMap.get(tx.id) || 0;
      return [
        formatDate(tx.date),
        st?.full_name || 'Unknown',
        st?.student_id || '—',
        tx.type.toUpperCase(),
        tx.amount,
        tx.description,
        rb,
      ];
    });
    exportToCSV('Madinul_Qutaba_All_Transactions', rows, headers);
    showToast('info', 'Export Successful', 'Exported transactions to CSV.');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-16 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Transaction Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Browse, search, edit, or delete all student fund contributions and expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('add-income')}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Income</span>
          </button>

          <button
            onClick={() => onNavigate('add-expense')}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search description */}
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Search Description:</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Kitab, Mess, Monthly fund..."
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Filter by Student:</label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Students ({students.length})</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.student_id})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Transaction Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full min-h-[44px] px-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            {(studentFilter !== 'all' || typeFilter !== 'all' || searchDesc || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setStudentFilter('all');
                  setTypeFilter('all');
                  setSearchDesc('');
                  setDateFrom('');
                  setDateTo('');
                  setMinAmount('');
                  setMaxAmount('');
                }}
                className="min-h-[44px] w-full py-2 px-3 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border border-rose-200 dark:border-rose-900"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Date & Amount Ranges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Date From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Date To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Min (₹):</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Max (₹):</label>
            <input
              type="number"
              placeholder="10000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* When zero transactions exist in database */}
      {transactions.length === 0 ? (
        <div className="p-8 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <Receipt className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No Transactions Recorded Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              The fund ledger is clean. Record an income contribution or deduct an institutional expense to begin logging transaction activities.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => onNavigate('add-income')}
              className="inline-flex items-center gap-1.5 min-h-[46px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Record Income</span>
            </button>
            <button
              onClick={() => onNavigate('add-expense')}
              className="inline-flex items-center gap-1.5 min-h-[46px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Card List: Optimized for mobile phone screens */}
          <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No transactions match your criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const student = studentMap.get(tx.student_id);
            const runningBalance = studentLedgerMap.get(tx.id);

            return (
              <div
                key={tx.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3"
              >
                {/* Header: Student & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (student) onNavigate('student-detail', { studentId: student.id });
                      }}
                      className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left leading-tight truncate block"
                    >
                      {student?.full_name || 'Unknown Student'}
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        {student?.student_id}
                      </span>
                      <span>·</span>
                      <span className="truncate">{student?.district}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-black text-sm block ${
                        tx.type === 'income'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{tx.type}</span>
                    </span>
                  </div>
                </div>

                {/* Description & Balance Box */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{tx.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>Date: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatDate(tx.date)}</strong></span>
                    <span>Student Bal: <strong className="text-slate-700 dark:text-slate-300 font-mono font-bold">{runningBalance !== undefined ? formatCurrency(runningBalance) : '—'}</strong></span>
                  </div>
                </div>

                {/* Action Buttons with 44px min height */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openEdit(tx)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Transaction</span>
                  </button>

                  <button
                    onClick={() => setDeleteTargetId(tx.id)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Transactions Table for Tablet / Desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3 text-right">Amount</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Student Balance</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const student = studentMap.get(tx.student_id);
                  const runningBalance = studentLedgerMap.get(tx.id);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium">{formatDate(tx.date)}</td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (student) onNavigate('student-detail', { studentId: student.id });
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                        >
                          {student?.full_name || 'Unknown Student'}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student?.student_id} · {student?.district}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">{tx.description}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {runningBalance !== undefined ? formatCurrency(runningBalance) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(tx)}
                            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteTargetId(tx.id)}
                            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-1">
          <span>Showing {filtered.length} of {transactions.length} total entries</span>
          <span>Automatic recalculated running balance</span>
        </div>
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTargetId !== null}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? The affected student's total income, expenses, and current fund balance will be automatically recalculated immediately."
        confirmLabel="Confirm Delete"
        isDestructive={true}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit {editingTx.type.toUpperCase()} Transaction
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full min-h-[46px] pl-7 pr-3 py-2 text-base sm:text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm active:scale-95"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
