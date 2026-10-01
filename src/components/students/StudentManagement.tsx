import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { exportToCSV } from '../../utils/formatters';

interface StudentManagementProps {
  onNavigate: (page: NavPage, data?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

type SortField = 'name' | 'student_id' | 'district' | 'income' | 'expense' | 'balance';
type SortOrder = 'asc' | 'desc';

export const StudentManagement: React.FC<StudentManagementProps> = ({ onNavigate, showToast }) => {
  const { students, studentFinancials, deleteStudent, formatCurrency } = useDars();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const districts = useMemo(() => {
    const set = new Set<string>();
    studentFinancials.forEach((sf) => {
      if (sf.student.district) set.add(sf.student.district);
    });
    return Array.from(set).sort();
  }, [studentFinancials]);

  const processedData = useMemo(() => {
    let result = studentFinancials.filter((sf) => {
      const s = sf.student;
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q ||
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.house_name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q);

      const matchesDistrict = districtFilter === 'all' || s.district === districtFilter;

      let matchesBalance = true;
      if (balanceFilter === 'positive') matchesBalance = sf.balance > 0;
      else if (balanceFilter === 'zero') matchesBalance = sf.balance === 0;
      else if (balanceFilter === 'negative') matchesBalance = sf.balance < 0;

      return matchesSearch && matchesDistrict && matchesBalance;
    });

    result.sort((a, b) => {
      let valA: any = a.student.full_name.toLowerCase();
      let valB: any = b.student.full_name.toLowerCase();

      if (sortField === 'student_id') {
        valA = a.student.student_id;
        valB = b.student.student_id;
      } else if (sortField === 'district') {
        valA = a.student.district.toLowerCase();
        valB = b.student.district.toLowerCase();
      } else if (sortField === 'income') {
        valA = a.total_income;
        valB = b.total_income;
      } else if (sortField === 'expense') {
        valA = a.total_expense;
        valB = b.total_expense;
      } else if (sortField === 'balance') {
        valA = a.balance;
        valB = b.balance;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [studentFinancials, searchTerm, districtFilter, balanceFilter, sortField, sortOrder]);

  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteStudent(deleteTarget.id);
      showToast('success', 'Student Deleted', `Removed ${deleteTarget.name} from records.`);
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Student ID',
      'House Name',
      'Post Office',
      'District',
      'State',
      'Phone',
      'Total Income',
      'Total Expense',
      'Current Balance',
    ];
    const rows = processedData.map((sf) => [
      sf.student.full_name,
      sf.student.student_id,
      sf.student.house_name,
      sf.student.post_office,
      sf.student.district,
      sf.student.state,
      sf.student.phone,
      sf.total_income,
      sf.total_expense,
      sf.balance,
    ]);
    exportToCSV('Madinul_Qutaba_Students_Directory', rows, headers);
    showToast('info', 'Export Complete', 'Exported student directory CSV.');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-16 md:pb-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Student Management & Fund Balances</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Directory of enrolled DARS students, total contributions, kitabs/expenses, and net balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="min-h-[42px] px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('add-student')}
            className="min-h-[42px] px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, phone, district..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-[42px] px-2.5 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Balance Filter */}
            <select
              value={balanceFilter}
              onChange={(e) => {
                setBalanceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-[42px] px-2.5 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Balances</option>
              <option value="positive">In Credit</option>
              <option value="zero">Zero</option>
              <option value="negative">In Deficit</option>
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="col-span-2 sm:col-span-1 min-h-[42px] px-2.5 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* When zero students exist in database */}
      {students.length === 0 ? (
        <div className="p-8 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No Students Registered Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              The database is clean and ready. Register your first student to begin managing individual accounts, fund collections, and ledger records.
            </p>
          </div>
          <button
            onClick={() => onNavigate('add-student')}
            className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Student</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List: Optimized for mobile phone screens */}
          <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No students match your query.
          </div>
        ) : (
          paginatedData.map((sf) => (
            <div
              key={sf.student.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="min-w-0 cursor-pointer"
                  onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                >
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {sf.student.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80">
                      {sf.student.student_id}
                    </span>
                    <span>·</span>
                    <span className="truncate">{sf.student.district}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {sf.student.house_name} {sf.student.post_office ? `· ${sf.student.post_office}` : ''}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balance</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      sf.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(sf.balance)}
                  </span>
                </div>
              </div>

              {/* Income and Expense Row */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Income</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(sf.total_income)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Expense</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(sf.total_expense)}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Mobile with 44px touch targets */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs active:scale-95 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteTarget({ id: sf.student.id, name: sf.student.full_name })}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Table for Tablet / Desktop (Hidden on small mobile) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Full Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('student_id')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3.5 px-3">House Name</th>

                <th
                  onClick={() => handleSort('district')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3.5 px-3">Phone</th>

                <th
                  onClick={() => handleSort('income')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Income</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('expense')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Expense</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('balance')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Balance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No students match your query.
                  </td>
                </tr>
              ) : (
                paginatedData.map((sf) => (
                  <tr
                    key={sf.student.id}
                    onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sf.student.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{sf.student.post_office}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                      {sf.student.student_id}
                    </td>

                    <td className="py-3.5 px-3 truncate max-w-[120px]">{sf.student.house_name || '—'}</td>

                    <td className="py-3.5 px-3">{sf.student.district}</td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">{sf.student.phone}</td>

                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sf.total_income)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-rose-500">
                      {formatCurrency(sf.total_expense)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          sf.balance >= 0
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(sf.balance)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: sf.student.id, name: sf.student.full_name })
                          }
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="font-mono text-slate-800 dark:text-slate-200">{paginatedData.length}</strong> of{' '}
            <strong className="font-mono text-slate-800 dark:text-slate-200">{totalItems}</strong> students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone and will delete all associated transactions.`}
        confirmLabel="Confirm Delete"
        isDestructive={true}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
