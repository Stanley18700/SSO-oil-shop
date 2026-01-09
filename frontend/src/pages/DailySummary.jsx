import { useEffect, useMemo, useState } from 'react';
import { getDailySummary } from '../api/api';

const formatMMK = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatViss = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};

const formatTimeHHMM = (iso, timeZone) => {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(dt);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dt);
  }
};

// Simple, read-only daily summary overlay content
export const DailySummary = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const loadSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Omit date for fastest call; backend defaults to today in Asia/Yangon.
      const data = await getDailySummary();
      setReport(data);
    } catch (err) {
      console.error('Failed to load daily summary:', err);
      setError('Unable to load daily summary. Please try again.');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const totals = report?.totals || {};
  const totalSalesAmount = Number(totals.totalSalesAmount || 0);
  const transactionsCount = Number(totals.transactionsCount || 0);

  const topOils = useMemo(() => {
    const items = Array.isArray(report?.topOilsByRevenue) ? report.topOilsByRevenue : [];
    return items.slice(0, 3);
  }, [report]);

  const asOf = formatTimeHHMM(report?.generatedAt, 'Asia/Yangon');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Daily Summary</h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Today (Asia/Yangon)</span>
            {asOf ? <span>• As of {asOf}</span> : null}
            <span>• Read-only</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 bg-gray-50">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
            <div className="mt-3 text-gray-500 text-sm">Loading daily summary...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-5 sm:p-6 text-center">
            <div className="text-red-600 font-semibold text-sm">{error}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Primary KPI */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-primary-500 text-white px-5 sm:px-6 py-6 sm:py-7">
                <div className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-widest">Total Sales Today</div>
                <div className="mt-2 flex items-end gap-2 justify-center sm:justify-start">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black leading-none">{formatMMK(totalSalesAmount)}</div>
                  <div className="text-base sm:text-lg font-bold pb-0.5">MMK</div>
                </div>
              </div>
              <div className="px-5 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Transactions</div>
                    <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-800">{transactionsCount}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Updates when a sale is confirmed
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 oils */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-gray-800">Top oils by revenue (today so far)</div>
                </div>
              </div>

              {topOils.length === 0 ? (
                <div className="text-gray-500 text-sm py-6 text-center">No sales yet today.</div>
              ) : (
                <div className="mt-4 divide-y divide-gray-100">
                  {topOils.map((row, idx) => {
                    const name = row?.oilNameSnapshot || `Oil ${row?.oilId ?? ''}`;
                    const revenue = Number(row?.revenue || 0);
                    const quantitySold = Number(row?.quantitySold || 0);
                    return (
                      <div key={`${row?.oilId ?? idx}`} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-extrabold text-sm">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-800 truncate">{name}</div>
                            <div className="mt-0.5 text-xs text-gray-500">Qty: {formatViss(quantitySold)} viss</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-gray-900">{formatMMK(revenue)} MMK</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
