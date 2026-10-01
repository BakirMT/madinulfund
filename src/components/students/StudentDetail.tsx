import React, { useState } from 'react';
import {
  User,
  Phone,
  Home,
  MapPin,
  Calendar,
  PlusCircle,
  MinusCircle,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  ArrowLeft,
  Receipt,
  Scale,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { exportToCSV } from '../../utils/formatters';

interface StudentDetailProps {
  studentId: string;
  onNavigate: (page: NavPage, data?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({
  studentId,
  onNavigate,
  showToast,
}) => {
  const {
    students,
    getStudentFinancials,
    getStudentLedger,
    deleteStudent,
    updateStudent,
    deleteTransaction,
    formatCurrency,
    formatDate,
    settings,
  } = useDars();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const student = students.find((s) => s.id === studentId);
  const financials = getStudentFinancials(studentId);
  const ledger = getStudentLedger(studentId);

  // Edit form state
  const [editFullName, setEditFullName] = useState<string>(student?.full_name || '');
  const [editStudentId, setEditStudentId] = useState<string>(student?.student_id || '');
  const [editPhone, setEditPhone] = useState<string>(student?.phone || '');
  const [editHouseName, setEditHouseName] = useState<string>(student?.house_name || '');
  const [editPostOffice, setEditPostOffice] = useState<string>(student?.post_office || '');
  const [editExtraAddress, setEditExtraAddress] = useState<string>(student?.extra_address || '');
  const [editDistrict, setEditDistrict] = useState<string>(student?.district || '');
  const [editState, setEditState] = useState<string>(student?.state || 'Kerala');
  const [editPincode, setEditPincode] = useState<string>(student?.pincode || '');

  if (!student || !financials) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Record Not Found</h3>
        <p className="text-xs sm:text-sm text-slate-500">The requested student could not be located in the database.</p>
        <button
          onClick={() => onNavigate('students')}
          className="min-h-[44px] px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold"
        >
          Back to Students List
        </button>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    try {
      const name = student.full_name;
      deleteStudent(student.id);
      showToast('success', 'Student Deleted', `Removed ${name} and all associated financial records.`);
      onNavigate('students');
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      showToast('error', 'Full Name Required', 'Student name cannot be empty.');
      return;
    }

    try {
      updateStudent(student.id, {
        full_name: editFullName.trim(),
        student_id: editStudentId.trim(),
        phone: editPhone.trim(),
        house_name: editHouseName.trim(),
        post_office: editPostOffice.trim(),
        extra_address: editExtraAddress.trim(),
        district: editDistrict.trim(),
        state: editState.trim(),
        pincode: editPincode.trim(),
      });
      setIsEditModalOpen(false);
      showToast('success', 'Profile Updated', 'Student profile details updated successfully.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Income Amount', 'Expense Amount', 'Running Balance'];
    const rows = ledger.map((tx) => [
      formatDate(tx.date),
      tx.type.toUpperCase(),
      tx.description,
      tx.type === 'income' ? tx.amount : 0,
      tx.type === 'expense' ? tx.amount : 0,
      tx.running_balance,
    ]);
    exportToCSV(`${student.student_id}_${student.full_name}_Ledger`, rows, headers);
    showToast('info', 'Export Complete', 'Downloaded student ledger CSV file.');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto pb-16 md:pb-0">
      {/* Top Bar with Back and Actions: Responsively arranged */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <button
          onClick={() => onNavigate('students')}
          className="min-h-[40px] inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students List</span>
        </button>

        {/* Action Buttons: Responsively arranged with 44px min touch targets on mobile */}
        <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('add-income', { studentId: student.id })}
            className="min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Income</span>
          </button>

          <button
            onClick={() => onNavigate('add-expense', { studentId: student.id })}
            className="min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>- Expense</span>
          </button>

          <button
            onClick={() => onNavigate('student-financial', { studentId: student.id })}
            className="min-h-[44px] px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>Financials</span>
          </button>

          <button
            onClick={() => {
              setEditFullName(student.full_name);
              setEditStudentId(student.student_id);
              setEditPhone(student.phone);
              setEditHouseName(student.house_name);
              setEditPostOffice(student.post_office);
              setEditExtraAddress(student.extra_address || '');
              setEditDistrict(student.district);
              setEditState(student.state);
              setEditPincode(student.pincode);
              setIsEditModalOpen(true);
            }}
            className="min-h-[44px] px-3 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[44px] px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Ledger</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="min-h-[44px] px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="col-span-2 xs:col-span-1 min-h-[44px] px-3 py-2 flex items-center justify-center gap-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-xl transition-colors active:scale-95 border border-rose-200 dark:border-rose-900/40 text-xs font-bold"
            title="Delete Student Record"
            aria-label="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
            <span className="xs:hidden">Delete Student Record</span>
          </button>
        </div>
      </div>

      {/* Official Print Header (Visible only when printed) */}
      <div className="hidden print-only text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{settings.dars_name}</h1>
        <p className="text-xs text-slate-600 mt-1">{settings.dars_address}</p>
        <p className="text-xs text-slate-600">Tel: {settings.phone} · Email: {settings.email}</p>
        <div className="mt-3 py-1 bg-slate-100 font-bold text-sm uppercase">
          Official Student Fund Ledger Statement
        </div>
      </div>

      {/* Student Profile Card Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-8 shadow-xs print-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-md">
              {student.full_name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                  {student.full_name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {student.student_id}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-medium">{student.phone}</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.district}, {student.state}</span>
                </div>
                <span aria-hidden="true">·</span>
                <span>PIN: {student.pincode}</span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-slate-400 dark:text-slate-500 shrink-0">
            <span>Enrolled: {formatDate(student.created_at.split('T')[0])}</span>
          </div>
        </div>

        {/* Detailed Address Grid */}
        <div className="mt-5 pt-5 sm:mt-6 sm:pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">House Name:</span>
            <span className="text-slate-900 dark:text-white font-semibold mt-0.5 block truncate">
              {student.house_name || '—'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Post Office:</span>
            <span className="text-slate-900 dark:text-white font-semibold mt-0.5 block truncate">
              {student.post_office || '—'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Landmark:</span>
            <span className="text-slate-900 dark:text-white font-semibold mt-0.5 block truncate">
              {student.extra_address || '—'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Location:</span>
            <span className="text-slate-900 dark:text-white font-semibold mt-0.5 block truncate">
              {student.district}, {student.state}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs print-card">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Fund Income
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {formatCurrency(financials.total_income)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Sum of all contributions</p>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs print-card">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
            {formatCurrency(financials.total_expense)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Sum of all deductions / kitabs</p>
        </div>

        {/* Current Balance */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs print-card ${
            financials.balance >= 0
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Current Fund Balance
            </span>
            <Scale className={`w-4 h-4 ${financials.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              financials.balance >= 0
                ? 'text-emerald-900 dark:text-emerald-200'
                : 'text-rose-700 dark:text-rose-300'
            }`}
          >
            {formatCurrency(financials.balance)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Formula: Income - Expense
          </p>
        </div>
      </div>

      {/* Transaction History & Running Balance Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden print-card space-y-3 sm:space-y-4">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Complete Transaction Ledger</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological running balance computed automatically from recorded receipts and expenses.
            </p>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Records: <strong className="text-slate-900 dark:text-white font-mono">{ledger.length}</strong>
          </span>
        </div>

        {ledger.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-xs text-slate-400">
            No transactions found for this student. Use "+ Income" or "- Expense" above to record entries.
          </div>
        ) : (
          <>
            {/* Mobile Card List for Ledger: Clean, touch-friendly, no horizontal scroll */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 px-4">
              {ledger.map((tx) => (
                <div key={tx.id} className="py-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{formatDate(tx.date)}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                        {tx.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-sm block ${
                          tx.type === 'income'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Bal: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(tx.running_balance)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end no-print pt-1">
                    <button
                      onClick={() => setDeleteTxId(tx.id)}
                      className="min-h-[36px] px-2.5 py-1 text-xs font-medium flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet / Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-3 text-right">Income</th>
                    <th className="py-3 px-3 text-right">Expense</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium">{formatDate(tx.date)}</td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium max-w-xs">{tx.description}</td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {tx.type === 'income' ? formatCurrency(tx.amount) : '—'}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-500">
                        {tx.type === 'expense' ? formatCurrency(tx.amount) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(tx.running_balance)}
                      </td>

                      <td className="py-3.5 px-3 text-center no-print">
                        <button
                          onClick={() => setDeleteTxId(tx.id)}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Student Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${student.full_name}? This will permanently remove the student profile and all ${ledger.length} associated financial transactions.`}
        confirmLabel="Yes, Delete Student"
        isDestructive={true}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Delete Single Transaction Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTxId !== null}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? The student balance and overall DARS totals will be recalculated immediately."
        confirmLabel="Delete Transaction"
        isDestructive={true}
        onClose={() => setDeleteTxId(null)}
        onConfirm={() => {
          if (deleteTxId) {
            deleteTransaction(deleteTxId);
            setDeleteTxId(null);
            showToast('success', 'Transaction Deleted', 'Recalculated student balance automatically.');
          }
        }}
      />

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Student Information</h3>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    House Name
                  </label>
                  <input
                    type="text"
                    value={editHouseName}
                    onChange={(e) => setEditHouseName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Post Office
                  </label>
                  <input
                    type="text"
                    value={editPostOffice}
                    onChange={(e) => setEditPostOffice(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Extra Address / Landmark
                </label>
                <input
                  type="text"
                  value={editExtraAddress}
                  onChange={(e) => setEditExtraAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
