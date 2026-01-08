import { useEffect, useState } from 'react';
import { getMonthlySalesSummary } from '../api/api';

// Simple, read-only monthly summary overlay content
export const MonthlySummary = ({ onClose }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalSalesValue, setTotalSalesValue] = useState(0);

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
      const data = await getMonthlySalesSummary(targetYear, targetMonth);
      setTotalSalesValue(data?.totalSalesValue ?? 0);
    } catch (err) {
      console.error('Failed to load monthly summary:', err);
      setError('Unable to load summary. Please try again later.');
      setTotalSalesValue(0);
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary-500 text-white px-5 sm:px-6 py-5 sm:py-6">
              <div className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-widest">
                Total Sales
              </div>
              <div className="mt-2 flex items-end gap-2 justify-center sm:justify-start">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black leading-none">
                  {Number(totalSalesValue).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-base sm:text-lg font-bold pb-0.5">MMK</div>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-4 sm:py-5 text-center sm:text-left">
              {Number(totalSalesValue) === 0 ? (
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
        )}

        {/* Hint */}
        <div className="mt-auto text-center text-xs text-gray-400">
          Tip: Confirm Sale from Mix Calculator to record sales.
        </div>
      </div>
    </div>
  );
};
