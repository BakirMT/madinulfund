import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Users,
  TrendingUp,
  TrendingDown,
  Scale,
  Landmark,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { exportToCSV } from '../../utils/formatters';

export const Reports: React.FC = () => {
  const {
    students,
    transactions,
    settings,
    formatCurrency,
    formatDate,
    getStudentFinancials,
    getStudentLedger,
  } = useDars();

  const [reportType, setReportType] = useState<'overall' | 'student'>('overall');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const filteredOverallTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  const overallIncome = useMemo(() => {
    return filteredOverallTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredOverallTx]);

  const overallExpense = useMemo(() => {
    return filteredOverallTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredOverallTx]);

  const overallBalance = overallIncome - overallExpense;

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const selectedStudentFins = useMemo(() => {
    if (!selectedStudentId) return null;
    return getStudentFinancials(selectedStudentId);
  }, [selectedStudentId, getStudentFinancials]);

  const studentLedger = useMemo(() => {
    if (!selectedStudentId) return [];
    return getStudentLedger(selectedStudentId).filter((tx) => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });
  }, [selectedStudentId, getStudentLedger, dateFrom, dateTo]);

  const studentMap = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportOverallCSV = () => {
    const headers = ['Date', 'Student Name', 'Student ID', 'Type', 'Amount', 'Description'];
    const rows = filteredOverallTx.map((tx) => {
      const st = studentMap.get(tx.student_id);
      return [
        formatDate(tx.date),
        st?.full_name || 'Unknown',
        st?.student_id || '—',
        tx.type.toUpperCase(),
        tx.amount,
        tx.description,
      ];
    });
    exportToCSV(`Madinul_Qutaba_Overall_Report_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  const handleExportStudentCSV = () => {
    if (!selectedStudent) return;
    const headers = ['Date', 'Type', 'Description', 'Income Amount', 'Expense Amount', 'Running Balance'];
    const rows = studentLedger.map((tx) => [
      formatDate(tx.date),
      tx.type.toUpperCase(),
      tx.description,
      tx.type === 'income' ? tx.amount : 0,
      tx.type === 'expense' ? tx.amount : 0,
      tx.running_balance,
    ]);
    exportToCSV(
      `${selectedStudent.student_id}_${selectedStudent.full_name}_Report`,
      rows,
      headers
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto pb-16 md:pb-0">
      {/* Screen Controls Toolbar (Hidden when printed) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Financial Reports & Audits</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Generate certified institutional statements with official DARS letterhead.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[42px] px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>

            <button
              onClick={reportType === 'overall' ? handleExportOverallCSV : handleExportStudentCSV}
              className="min-h-[42px] px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Date Range Filters: Full width on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setReportType('overall')}
              className={`min-h-[40px] px-3 sm:px-4 py-2 font-bold rounded-lg transition-colors text-center ${
                reportType === 'overall'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overall Report
            </button>

            <button
              onClick={() => setReportType('student')}
              className={`min-h-[40px] px-3 sm:px-4 py-2 font-bold rounded-lg transition-colors text-center ${
                reportType === 'student'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Student Statement
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {reportType === 'student' && (
              <div className="w-full sm:w-auto flex items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="min-h-[40px] w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base sm:text-xs"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.student_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Period:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="min-h-[40px] flex-1 sm:w-auto px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="min-h-[40px] flex-1 sm:w-auto px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="min-h-[40px] px-2 text-rose-500 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-10 space-y-6 sm:space-y-8 print-card">
        {/* Institutional Letterhead */}
        <div className="border-b-2 border-emerald-700 pb-5 sm:pb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-xs shrink-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {settings.dars_name}
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                {settings.other_details}
              </p>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {settings.dars_address} · Tel: {settings.phone}
          </p>

          <div className="inline-block mt-1 sm:mt-2 px-3 sm:px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {reportType === 'overall' ? 'Consolidated Financial Statement' : 'Student Fund Account Ledger'}
          </div>
        </div>

        {/* Report Metadata Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span>Period: </span>
            <strong className="text-slate-900 dark:text-white font-mono">
              {dateFrom ? formatDate(dateFrom) : 'Inception'} — {dateTo ? formatDate(dateTo) : 'Current'}
            </strong>
          </div>
          <div>
            <span>Generated: </span>
            <strong className="text-slate-900 dark:text-white font-mono">
              {new Date().toLocaleDateString('en-GB')}
            </strong>
          </div>
        </div>

        {/* OVERALL REPORT VIEW */}
        {reportType === 'overall' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Summary Metrics: 2 columns on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Students</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {students.length}
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Total Inflow
                </span>
                <div className="text-lg sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                  {formatCurrency(overallIncome)}
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl sm:rounded-2xl border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase">
                  Total Outflow
                </span>
                <div className="text-lg sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                  {formatCurrency(overallExpense)}
                </div>
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
                  overallBalance >= 0
                    ? 'bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-300'
                    : 'bg-rose-100/60 dark:bg-rose-900/40 border-rose-300'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Net Balance
                </span>
                <div
                  className={`text-lg sm:text-2xl font-black font-mono mt-0.5 truncate ${
                    overallBalance >= 0
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {formatCurrency(overallBalance)}
                </div>
              </div>
            </div>

            {/* Overall Transactions Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Itemized Transactions ({filteredOverallTx.length})
              </h3>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Income</th>
                      <th className="py-2.5 px-3 text-right">Expense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredOverallTx.map((tx) => {
                      const st = studentMap.get(tx.student_id);
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-mono font-medium">{formatDate(tx.date)}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {st?.full_name || '—'}
                          </td>
                          <td className="py-2 px-2 uppercase font-bold text-[10px]">
                            <span
                              className={
                                tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                              }
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{tx.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            {tx.type === 'income' ? formatCurrency(tx.amount) : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">
                            {tx.type === 'expense' ? formatCurrency(tx.amount) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INDIVIDUAL STUDENT REPORT VIEW */}
        {reportType === 'student' && selectedStudent && selectedStudentFins && (
          <div className="space-y-5 sm:space-y-6">
            {/* Student Particulars */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Student Full Name:</span>
                <strong className="text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 block">
                  {selectedStudent.full_name}
                </strong>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-0.5 block">
                  ID: {selectedStudent.student_id} · Ph: {selectedStudent.phone}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Residential Address:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedStudent.house_name}, {selectedStudent.post_office}
                  {selectedStudent.extra_address ? `, ${selectedStudent.extra_address}` : ''}
                  <br />
                  {selectedStudent.district}, {selectedStudent.state} - {selectedStudent.pincode}
                </p>
              </div>
            </div>

            {/* Student Financials Triple Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Total Income Received
                </span>
                <div className="text-lg sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(selectedStudentFins.total_income)}
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl sm:rounded-2xl border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase">
                  Total Expenses Deducted
                </span>
                <div className="text-lg sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(selectedStudentFins.total_expense)}
                </div>
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
                  selectedStudentFins.balance >= 0
                    ? 'bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-300'
                    : 'bg-rose-100/60 dark:bg-rose-900/40 border-rose-300'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Current Fund Balance
                </span>
                <div
                  className={`text-lg sm:text-2xl font-black font-mono mt-0.5 ${
                    selectedStudentFins.balance >= 0
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {formatCurrency(selectedStudentFins.balance)}
                </div>
              </div>
            </div>

            {/* Student Chronological Ledger */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Transaction History Ledger ({studentLedger.length})
              </h3>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Income</th>
                      <th className="py-2.5 px-3 text-right">Expense</th>
                      <th className="py-2.5 px-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {studentLedger.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2.5 px-3 font-mono font-medium">{formatDate(tx.date)}</td>
                        <td className="py-2.5 px-2 uppercase font-bold text-[10px]">
                          <span
                            className={
                              tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                            }
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{tx.description}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          {tx.type === 'income' ? formatCurrency(tx.amount) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                          {tx.type === 'expense' ? formatCurrency(tx.amount) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(tx.running_balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Signatures for Print Document */}
        <div className="pt-8 sm:pt-12 grid grid-cols-2 text-center text-xs text-slate-500">
          <div>
            <div className="w-32 sm:w-40 border-b border-slate-400 mx-auto mb-2" />
            <span>Accountant / In-Charge</span>
          </div>
          <div>
            <div className="w-32 sm:w-40 border-b border-slate-400 mx-auto mb-2" />
            <span>Principal / Mudarris</span>
          </div>
        </div>
      </div>
    </div>
  );
};
