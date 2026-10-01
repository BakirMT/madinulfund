import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  Users,
  UserCheck,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';

interface AddIncomeProps {
  onNavigate: (page: NavPage, data?: any) => void;
  preselectedStudentId?: string;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AddIncome: React.FC<AddIncomeProps> = ({
  onNavigate,
  preselectedStudentId,
  showToast,
}) => {
  const { students, addTransaction, addBulkIncome, formatCurrency, getStudentFinancials } = useDars();

  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');

  // Individual Form State
  const [studentId, setStudentId] = useState<string>(preselectedStudentId || (students[0]?.id || ''));
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Monthly DARS Fund Contribution');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [individualSearch, setIndividualSearch] = useState<string>('');

  // Bulk Form State
  const [bulkTotalAmount, setBulkTotalAmount] = useState<string>('10000');
  const [bulkDescription, setBulkDescription] = useState<string>('DARS General Fund Distribution');
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() => students.map((s) => s.id));
  const [bulkSearch, setBulkSearch] = useState<string>('');

  // Financial preview for selected individual student
  const currentStudentFinancials = useMemo(() => {
    if (!studentId) return null;
    return getStudentFinancials(studentId);
  }, [studentId, getStudentFinancials]);

  const numAmount = parseFloat(amount) || 0;
  const newProjectedBalance = currentStudentFinancials
    ? currentStudentFinancials.balance + numAmount
    : 0;

  // Filtered students for individual selector
  const filteredIndividualStudents = useMemo(() => {
    if (!individualSearch.trim()) return students;
    const q = individualSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    );
  }, [students, individualSearch]);

  // Filtered students for bulk selector
  const filteredBulkStudents = useMemo(() => {
    if (!bulkSearch.trim()) return students;
    const q = bulkSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    );
  }, [students, bulkSearch]);

  // Bulk calculations
  const numBulkTotal = parseFloat(bulkTotalAmount) || 0;
  const selectedCount = selectedStudentIds.length;
  const perStudentExact = selectedCount > 0 ? numBulkTotal / selectedCount : 0;
  const perStudentRounded = Math.floor(perStudentExact * 100) / 100;
  const remainder = Number((numBulkTotal - perStudentRounded * selectedCount).toFixed(2));

  // Handlers
  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      showToast('error', 'Select Student', 'Please select a student for this income transaction.');
      return;
    }
    if (numAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Income amount must be greater than zero.');
      return;
    }
    if (!description.trim()) {
      showToast('error', 'Description Required', 'Please enter a description for the transaction.');
      return;
    }
    if (!date) {
      showToast('error', 'Date Required', 'Please select a valid date.');
      return;
    }

    try {
      addTransaction({
        student_id: studentId,
        type: 'income',
        amount: numAmount,
        description: description.trim(),
        date,
      });

      const st = students.find((s) => s.id === studentId);
      showToast(
        'success',
        'Income Recorded Successfully',
        `${formatCurrency(numAmount)} added to ${st?.full_name || 'student'}'s fund balance.`
      );

      setAmount('');
      onNavigate('student-detail', { studentId });
    } catch (err: any) {
      showToast('error', 'Failed to Record Income', err.message);
    }
  };

  const handleBulkToggle = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllBulk = () => {
    if (selectedStudentIds.length === filteredBulkStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredBulkStudents.map((s) => s.id));
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numBulkTotal <= 0) {
      showToast('error', 'Invalid Total Amount', 'Total fund amount must be greater than zero.');
      return;
    }
    if (selectedCount === 0) {
      showToast('error', 'No Students Selected', 'Please select at least one student to receive the fund.');
      return;
    }
    if (!bulkDescription.trim()) {
      showToast('error', 'Description Required', 'Please provide a distribution description.');
      return;
    }

    try {
      const res = addBulkIncome({
        total_amount: numBulkTotal,
        student_ids: selectedStudentIds,
        description: bulkDescription.trim(),
        date: bulkDate,
      });

      showToast(
        'success',
        'Bulk Fund Distributed',
        `Successfully allocated ${formatCurrency(res.perStudent)} each to ${res.count} students.`
      );

      onNavigate('transactions');
    } catch (err: any) {
      showToast('error', 'Bulk Distribution Failed', err.message);
    }
  };

  const presets = [
    'Monthly DARS Fund Contribution',
    'Quarterly Mess & Welfare Fund',
    'Community Sponsor Book Grant',
    'Special Ramadan Educational Stipend',
    'Zakat / Subvention Grant',
    'General Educational Contribution',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-16 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Add Income Record</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Record single student fund receipt or distribute a bulk grant equally among students.
          </p>
        </div>

        {/* Mode Selector Tabs: Full-width on mobile */}
        <div className="w-full sm:w-auto grid grid-cols-2 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('individual')}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === 'individual'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === 'bulk'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Bulk Grant</span>
          </button>
        </div>
      </div>

      {/* Mode A: Individual Student Income */}
      {mode === 'individual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
            <form onSubmit={handleIndividualSubmit} className="space-y-4 sm:space-y-5">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Student <span className="text-rose-500">*</span>
                </label>

                {students.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter student by name, ID or district..."
                      value={individualSearch}
                      onChange={(e) => setIndividualSearch(e.target.value)}
                      className="w-full min-h-[44px] pl-9 pr-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                >
                  <option value="" disabled>
                    -- Choose Student --
                  </option>
                  {filteredIndividualStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.student_id}) · {st.district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Income Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      placeholder="e.g. 1000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full min-h-[46px] pl-8 pr-3.5 py-2.5 text-base sm:text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Transaction Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly DARS Fund Contribution"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />

                {/* Quick Presets */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {presets.slice(0, 4).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDescription(p)}
                      className="min-h-[34px] text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Income Transaction</span>
                </button>
              </div>
            </form>
          </div>

          {/* Student Balance Calculation Live Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 h-fit">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Fund Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Formula: Balance = Total Income - Total Expense
              </p>
            </div>

            {currentStudentFinancials ? (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Selected Student</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentStudentFinancials.student.full_name}
                  </p>
                  <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {currentStudentFinancials.student.student_id} · {currentStudentFinancials.student.district}
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Total Income (Current):</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(currentStudentFinancials.total_income)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Total Expense:</span>
                    <span className="font-mono font-semibold text-rose-500">
                      {formatCurrency(currentStudentFinancials.total_expense)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentStudentFinancials.balance)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>+ Adding Income:</span>
                    <span className="font-mono font-bold">
                      +{formatCurrency(numAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 bg-emerald-100/70 dark:bg-emerald-950/60 px-3.5 rounded-xl">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
                      New Balance:
                    </span>
                    <span className="font-mono font-black text-emerald-900 dark:text-emerald-300 text-base sm:text-lg">
                      {formatCurrency(newProjectedBalance)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Select a student to view live balance calculation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode B: Bulk Income Distribution */}
      {mode === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Input Config Left */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bulk Allocation Settings</h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Income Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="10000"
                    value={bulkTotalAmount}
                    onChange={(e) => setBulkTotalAmount(e.target.value)}
                    className="w-full min-h-[46px] pl-8 pr-3.5 py-2.5 text-base font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Divided equally among all checked students below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Distribution Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramadan Special DARS Grant"
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Distribution Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Calculation Preview</span>
                </div>

                <div className="text-xs sm:text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Grant:</span>
                    <span className="font-mono font-bold">{formatCurrency(numBulkTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Students:</span>
                    <span className="font-mono font-bold">{selectedCount}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800 font-semibold text-emerald-900 dark:text-emerald-100">
                    <span>Amount Per Student:</span>
                    <span className="font-mono font-black text-sm sm:text-base">
                      {formatCurrency(perStudentRounded)}
                    </span>
                  </div>

                  {remainder > 0 && (
                    <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-400">
                      * Rounding adjustment of {formatCurrency(remainder)} added to first student.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedCount === 0 || numBulkTotal <= 0}
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Distribute ({selectedCount})</span>
              </button>
            </div>

            {/* Student Checkbox List Right */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Select Recipient Students ({selectedCount} of {students.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tap any student row to include or exclude from this fund distribution.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllBulk}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
                >
                  {selectedStudentIds.length === filteredBulkStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Filter */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, ID or district..."
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Scrollable Student Selector List with touch targets */}
              <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                {filteredBulkStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  const fins = getStudentFinancials(st.id);

                  return (
                    <div
                      key={st.id}
                      onClick={() => handleBulkToggle(st.id)}
                      className={`min-h-[52px] p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors active:scale-99 ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkToggle(st.id);
                          }}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {st.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {st.student_id} · {st.district}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-xs">
                        <span className="text-[10px] text-slate-400 block">Balance</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(fins?.balance || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
