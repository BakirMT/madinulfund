import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';

interface AddExpenseProps {
  onNavigate: (page: NavPage, data?: any) => void;
  preselectedStudentId?: string;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AddExpense: React.FC<AddExpenseProps> = ({
  onNavigate,
  preselectedStudentId,
  showToast,
}) => {
  const { students, addTransaction, formatCurrency, getStudentFinancials } = useDars();

  const [studentId, setStudentId] = useState<string>(preselectedStudentId || (students[0]?.id || ''));
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Kitab & Study Material Purchase');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState<string>('');

  const currentFinancials = useMemo(() => {
    if (!studentId) return null;
    return getStudentFinancials(studentId);
  }, [studentId, getStudentFinancials]);

  const numAmount = parseFloat(amount) || 0;
  const projectedBalance = currentFinancials ? currentFinancials.balance - numAmount : 0;

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    );
  }, [students, search]);

  const expensePresets = [
    'Kitab & Classical Texts Purchase',
    'Hostel Mess & Food Contribution',
    'Madrasa Bedding & Linen Pack',
    'Study Stationery & Note Sheets',
    'Medical & Health Treatment',
    'Annual Examination & Certificate Fee',
    'Educational Tour & Travel Grant',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      showToast('error', 'Select Student', 'Please select a student for this expense record.');
      return;
    }
    if (numAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Expense amount must be greater than zero.');
      return;
    }
    if (!description.trim()) {
      showToast('error', 'Description Required', 'Please enter a description for the expense.');
      return;
    }
    if (!date) {
      showToast('error', 'Date Required', 'Please select a valid date.');
      return;
    }

    try {
      addTransaction({
        student_id: studentId,
        type: 'expense',
        amount: numAmount,
        description: description.trim(),
        date,
      });

      const st = students.find((s) => s.id === studentId);
      showToast(
        'success',
        'Expense Recorded Successfully',
        `${formatCurrency(numAmount)} deducted from ${st?.full_name || 'student'}'s fund balance.`
      );

      setAmount('');
      onNavigate('student-detail', { studentId });
    } catch (err: any) {
      showToast('error', 'Failed to Record Expense', err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          <span>Record Student Expense</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Deduct kitabs, mess bills, hostel charges, or medical allowances from student fund balances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Expense Form Left */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Student Select */}
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                required
              >
                <option value="" disabled>
                  -- Choose Student --
                </option>
                {filteredStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.student_id}) · {st.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder=""
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full min-h-[46px] pl-8 pr-3.5 py-2.5 text-base sm:text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Purpose / Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                required
              />

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {expensePresets.slice(0, 4).map((p) => (
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

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-md shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save Expense Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Balance Impact Right */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fund Balance Impact</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live calculation from student transaction records
            </p>
          </div>

          {currentFinancials ? (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Target Student</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentFinancials.student.full_name}
                </p>
                <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {currentFinancials.student.student_id} · {currentFinancials.student.district}
                </p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Total Income:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(currentFinancials.total_income)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Existing Expenses:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    {formatCurrency(currentFinancials.total_expense)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(currentFinancials.balance)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800 text-rose-600 font-semibold">
                  <span>- Deducting Expense:</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(numAmount)}
                  </span>
                </div>

                <div
                  className={`flex justify-between py-2.5 px-3.5 rounded-xl ${
                    projectedBalance >= 0
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm">Projected Balance:</span>
                  <span className="font-mono font-black text-base sm:text-lg">
                    {formatCurrency(projectedBalance)}
                  </span>
                </div>
              </div>

              {projectedBalance < 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Warning: This expense will put the student's fund in deficit. Student will owe the DARS fund.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Select a student to view balance impact.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
