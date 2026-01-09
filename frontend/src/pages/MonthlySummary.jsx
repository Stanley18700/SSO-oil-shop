import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMonthlyReportDetails } from '../api/api';

// Simple, read-only monthly summary overlay content
export const MonthlySummary = ({ onClose }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const loadSummary = async (targetYear, targetMonth) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMonthlyReportDetails(targetYear, targetMonth);
      setReport(data);
    } catch (err) {
      console.error('Failed to load monthly summary:', err);
      setError('Unable to load summary. Please try again later.');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(year, month);
  }, [year, month]);

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setYear(newYear);
    setMonth(newMonth);
  };

  const formattedMonthYear = `${monthNames[month - 1]} ${year}`;

  const totalSalesAmount = Number(report?.totals?.totalSalesAmount || 0);
  const byOil = Array.isArray(report?.byOil) ? report.byOil : [];

  const revenueChartData = useMemo(() => {
    return [...byOil]
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .slice(0, 8)
      .map((row) => ({
        name: row.oilNameSnapshot || `Oil ${row.oilId}`,
        revenue: Number(row.revenue || 0),
      }));
  }, [byOil]);

  const quantityChartData = useMemo(() => {
    return [...byOil]
      .sort((a, b) => Number(b.quantitySold || 0) - Number(a.quantitySold || 0))
      .slice(0, 8)
      .map((row) => ({
        name: row.oilNameSnapshot || `Oil ${row.oilId}`,
        quantity: Number(row.quantitySold || 0),
      }));
  }, [byOil]);

  const hasAnySales = totalSalesAmount > 0;

  const formatCompactLabel = (value) => {
    const text = String(value ?? '');
    return text.length > 18 ? `${text.slice(0, 18)}…` : text;
  };

  const formatMMK = (value) => {
    return Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Monthly Summary
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">Read-only</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 bg-gray-50">
        {/* Month selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <span className="sr-only">Previous month</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-500">Month</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
              {formattedMonthYear}
            </div>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <span className="sr-only">Next month</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        </div>

        {/* Status / error */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
            <div className="mt-3 text-gray-500 text-sm">Loading summary...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-5 sm:p-6 text-center">
            <div className="text-red-600 font-semibold text-sm">{error}</div>
          </div>
        ) : null}

        {/* Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Total sales (primary KPI) */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-primary-500 text-white px-5 sm:px-6 py-5 sm:py-6">
                <div className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-widest">
                  Total Sales
                </div>
                <div className="mt-2 flex items-end gap-2 justify-center sm:justify-start">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black leading-none">
                    {formatMMK(totalSalesAmount)}
                  </div>
                  <div className="text-base sm:text-lg font-bold pb-0.5">MMK</div>
                </div>
              </div>
              <div className="px-5 sm:px-6 py-4 sm:py-5 text-center sm:text-left">
                {!hasAnySales ? (
                  <div className="text-gray-600 font-semibold">
                    No sales recorded for this month yet.
                  </div>
                ) : (
                  <div className="text-gray-600">
                    Figures update only when a sale is confirmed.
                  </div>
                )}
              </div>
            </div>

            {/* Revenue per oil chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-bold text-gray-800">Revenue per Oil</div>
                  <div className="text-xs text-gray-500">Top oils by revenue</div>
                </div>
              </div>

              {!hasAnySales || revenueChartData.length === 0 ? (
                <div className="text-gray-500 text-sm py-10 text-center">No data to chart.</div>
              ) : (
                <div className="w-full overflow-x-hidden">
                  <div className="text-primary-600" style={{ height: Math.max(260, revenueChartData.length * 48) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueChartData}
                        layout="vertical"
                        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(v) => formatMMK(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          tick={{ fontSize: 12 }}
                          tickFormatter={formatCompactLabel}
                        />
                        <Tooltip
                          formatter={(value) => [`${formatMMK(value)} MMK`, 'Revenue']}
                          labelFormatter={(label) => String(label)}
                        />
                        <Bar dataKey="revenue" fill="currentColor" isAnimationActive={false} radius={[8, 8, 8, 8]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity per oil chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-sm font-bold text-gray-800">Quantity Sold per Oil</div>
                <div className="text-xs text-gray-500">Top oils by quantity</div>
              </div>

              {!hasAnySales || quantityChartData.length === 0 ? (
                <div className="text-gray-500 text-sm py-10 text-center">No data to chart.</div>
              ) : (
                <div className="text-blue-600" style={{ height: Math.max(260, quantityChartData.length * 48) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quantityChartData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => Number(v || 0).toFixed(2)}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCompactLabel}
                      />
                      <Tooltip
                        formatter={(value) => [`${Number(value || 0).toFixed(3)} viss`, 'Quantity']}
                        labelFormatter={(label) => String(label)}
                      />
                      <Bar dataKey="quantity" fill="currentColor" isAnimationActive={false} radius={[8, 8, 8, 8]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hint */}
        <div className="mt-auto text-center text-xs text-gray-400">
          Tip: Confirm Sale from Mix Calculator to record sales.
        </div>
      </div>
    </div>
  );
};
