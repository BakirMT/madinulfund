import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Eye,
  PlusCircle,
  MinusCircle,
  LayoutGrid,
  List as ListIcon,
  Phone,
  Home,
  MapPin,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';

interface SearchStudentsProps {
  onNavigate: (page: NavPage, data?: any) => void;
}

export const SearchStudents: React.FC<SearchStudentsProps> = ({ onNavigate }) => {
  const { studentFinancials, formatCurrency } = useDars();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'positive' | 'zero' | 'negative'>('all');
  // Default to cards on small screens, table on desktop
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set<string>();
    studentFinancials.forEach((sf) => {
      if (sf.student.district) set.add(sf.student.district);
    });
    return Array.from(set).sort();
  }, [studentFinancials]);

  // Filtered records
  const filtered = useMemo(() => {
    return studentFinancials.filter((sf) => {
      const s = sf.student;
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q ||
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.house_name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        (s.post_office && s.post_office.toLowerCase().includes(q));

      const matchesDistrict = districtFilter === 'all' || s.district === districtFilter;

      let matchesBalance = true;
      if (balanceFilter === 'positive') matchesBalance = sf.balance > 0;
      else if (balanceFilter === 'zero') matchesBalance = sf.balance === 0;
      else if (balanceFilter === 'negative') matchesBalance = sf.balance < 0;

      return matchesSearch && matchesDistrict && matchesBalance;
    });
  }, [studentFinancials, searchTerm, districtFilter, balanceFilter]);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Search Student Records</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Instant multi-parameter search across Student Name, ID, Phone, House Name, and District.
        </p>
      </div>

      {/* Prominent Search Bar & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Student ID, Phone, House, District..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[48px] pl-11 pr-14 py-3 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 min-h-[32px] px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg bg-slate-200/60 dark:bg-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* District Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">District</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="all">All Districts ({studentFinancials.length})</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Balance Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-xs">Balance</span>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="min-h-[40px] px-2.5 py-1.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="all">All Balances</option>
                <option value="positive">In Credit (&gt; ₹0)</option>
                <option value="zero">Zero (₹0.00)</option>
                <option value="negative">In Deficit (&lt; ₹0)</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-end sm:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-mono">{filtered.length}</strong> student records
        </span>
        {searchTerm && (
          <span className="truncate max-w-[200px]">
            &ldquo;<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{searchTerm}</span>&rdquo;
          </span>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Students Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new student.
          </p>
          <button
            onClick={() => onNavigate('add-student')}
            className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl active:scale-95"
          >
            Register New Student
          </button>
        </div>
      )}

      {/* View Mode: Cards (Perfect for mobile phones) */}
      {viewMode === 'cards' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((sf) => (
            <div
              key={sf.student.id}
              onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all space-y-3 sm:space-y-4 group active:scale-99"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {sf.student.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {sf.student.student_id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{sf.student.district}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {sf.student.full_name.charAt(0)}
                </div>
              </div>

              {/* Student Address & Phone snippet */}
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sf.student.house_name}, {sf.student.post_office}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono font-medium">{sf.student.phone}</span>
                </div>
              </div>

              {/* Financial Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Income:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(sf.total_income)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Expense:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    {formatCurrency(sf.total_expense)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">Balance:</span>
                  <span
                    className={`font-mono font-black text-sm sm:text-base ${
                      sf.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(sf.balance)}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions with touch targets */}
              <div className="flex items-center justify-between pt-1 gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                  className="min-h-[38px] px-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <Eye className="w-4 h-4" />
                  <span>Profile</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('add-income', { studentId: sf.student.id })}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold active:scale-95"
                  >
                    + Income
                  </button>
                  <button
                    onClick={() => onNavigate('add-expense', { studentId: sf.student.id })}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold active:scale-95"
                  >
                    - Expense
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode: Table (Horizontal Scrollable) */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Student Full Name</th>
                  <th className="py-3.5 px-3">Student ID</th>
                  <th className="py-3.5 px-3">District</th>
                  <th className="py-3.5 px-3">Phone</th>
                  <th className="py-3.5 px-3 text-right">Total Income</th>
                  <th className="py-3.5 px-3 text-right">Total Expense</th>
                  <th className="py-3.5 px-4 text-right">Current Balance</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filtered.map((sf) => (
                  <tr
                    key={sf.student.id}
                    onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sf.student.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{sf.student.house_name}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                      {sf.student.student_id}
                    </td>

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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onNavigate('student-detail', { studentId: sf.student.id })}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('add-income', { studentId: sf.student.id })}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Add Income"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('add-expense', { studentId: sf.student.id })}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Add Expense"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
