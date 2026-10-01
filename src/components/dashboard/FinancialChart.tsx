import React, { useState } from 'react';
import { useDars } from '../../context/DarsContext';

interface FinancialChartProps {
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ monthlyData }) => {
  const { formatCurrency } = useDars();
  const [activeTab, setActiveTab] = useState<'both' | 'income' | 'expense' | 'balance'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No monthly financial data recorded yet.
      </div>
    );
  }

  // Find max value for scaling
  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense, Math.abs(d.balance))),
    1000
  );

  const chartHeight = 200;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const stepX = monthlyData.length > 1 ? innerWidth / (monthlyData.length - 1) : innerWidth;

  const getY = (val: number) => {
    return chartHeight - paddingY - (Math.max(0, val) / maxVal) * innerHeight;
  };

  // Build SVG paths for balance line
  const balancePoints = monthlyData.map((d, i) => `${paddingX + i * stepX},${getY(d.balance)}`).join(' ');

  return (
    <div className="space-y-4">
      {/* Chart View Tabs: Responsive grid on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
              activeTab === 'both'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Income vs Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
              activeTab === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Income Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Expense Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
              activeTab === 'balance'
                ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Balance Trend
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
          {(activeTab === 'both' || activeTab === 'income') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Income</span>
            </div>
          )}
          {(activeTab === 'both' || activeTab === 'expense') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Expense</span>
            </div>
          )}
          {(activeTab === 'both' || activeTab === 'balance') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">Net Fund</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 select-none overflow-visible">
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingY - ratio * innerHeight;
              const value = Math.round(ratio * maxVal);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                  >
                    {value >= 1000 ? `${Math.round(value / 1000)}k` : value}
                  </text>
                </g>
              );
            })}

            {/* Bars for Income & Expense */}
            {monthlyData.map((d, i) => {
              const xCenter = paddingX + i * stepX;
              const barWidth = 14;
              const incY = getY(d.income);
              const expY = getY(d.expense);
              const baseZero = chartHeight - paddingY;

              return (
                <g
                  key={d.month}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible hover area */}
                  <rect
                    x={xCenter - stepX / 2}
                    y={paddingY}
                    width={stepX}
                    height={innerHeight}
                    fill="transparent"
                  />

                  {/* Income bar */}
                  {(activeTab === 'both' || activeTab === 'income') && (
                    <rect
                      x={activeTab === 'both' ? xCenter - barWidth - 1 : xCenter - barWidth / 2}
                      y={incY}
                      width={barWidth}
                      height={Math.max(0, baseZero - incY)}
                      rx={3}
                      className="fill-emerald-600 dark:fill-emerald-500 transition-all duration-200 hover:opacity-85"
                    />
                  )}

                  {/* Expense bar */}
                  {(activeTab === 'both' || activeTab === 'expense') && (
                    <rect
                      x={activeTab === 'both' ? xCenter + 1 : xCenter - barWidth / 2}
                      y={expY}
                      width={barWidth}
                      height={Math.max(0, baseZero - expY)}
                      rx={3}
                      className="fill-rose-500 dark:fill-rose-600 transition-all duration-200 hover:opacity-85"
                    />
                  )}

                  {/* Month Label */}
                  <text
                    x={xCenter}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 dark:fill-slate-400 font-medium"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            {/* Balance trend line */}
            {(activeTab === 'both' || activeTab === 'balance') && (
              <>
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={balancePoints}
                  className="drop-shadow-xs"
                />
                {monthlyData.map((d, i) => {
                  const x = paddingX + i * stepX;
                  const y = getY(d.balance);
                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white stroke-sky-600 dark:stroke-sky-400 stroke-2 cursor-pointer hover:r-5 transition-all"
                    />
                  );
                })}
              </>
            )}

            {/* Tooltip on hover */}
            {hoveredIndex !== null && monthlyData[hoveredIndex] && (
              <g
                transform={`translate(${Math.min(
                  chartWidth - 160,
                  Math.max(20, paddingX + hoveredIndex * stepX - 70)
                )}, 10)`}
                className="pointer-events-none"
              >
                <rect
                  width="145"
                  height="66"
                  rx="8"
                  className="fill-slate-900/95 dark:fill-slate-800/95 text-white shadow-xl"
                />
                <text x="12" y="18" className="text-[11px] font-bold fill-white">
                  {monthlyData[hoveredIndex].month}
                </text>
                <text x="12" y="34" className="text-[10px] fill-emerald-400 font-medium">
                  Income: {formatCurrency(monthlyData[hoveredIndex].income)}
                </text>
                <text x="12" y="47" className="text-[10px] fill-rose-300 font-medium">
                  Expense: {formatCurrency(monthlyData[hoveredIndex].expense)}
                </text>
                <text x="12" y="60" className="text-[10px] fill-sky-300 font-medium">
                  Net: {formatCurrency(monthlyData[hoveredIndex].balance)}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
