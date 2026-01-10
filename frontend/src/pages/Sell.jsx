import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils } from '../api/api';
import { OilCard } from '../components/OilCard';
import { OilDetailModal } from '../components/OilDetailModal';
import { LanguageToggle } from '../components/LanguageToggle';
import { OwnerHeader } from '../components/OwnerHeader';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { MixCalculator } from './MixCalculator';
import { AdminDashboard } from './AdminDashboard';
import { MonthlySummary } from './MonthlySummary';
import { DailySummary } from './DailySummary';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';
import { logoutRequest } from '../api/api';
import { useAuth } from '../auth/useAuth';

/**
 * Sell - Owner tablet-friendly selling screen
 * Shows active products and provides quick access to New Sale.
 */
export const Sell = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const [language, setLanguage] = useState('en');
  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOil, setSelectedOil] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const t = language === 'en' ? enTranslations : myTranslations;

  // Fetch oils on mount
  useEffect(() => {
    fetchOils();
  }, []);

  // Prevent body scroll when any overlay is open
  useEffect(() => {
    const anyOverlayOpen =
      isModalOpen ||
      isCalculatorOpen ||
      isManagementOpen ||
      isSummaryOpen ||
      isDailyOpen ||
      isChangePasswordOpen;

    if (anyOverlayOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isCalculatorOpen, isManagementOpen, isSummaryOpen, isDailyOpen, isChangePasswordOpen]);

  const handleLogout = async () => {
    // Best-effort server call (JWT is stateless, but keeps things symmetric)
    try {
      await logoutRequest();
    } catch {
      // Ignore network/server errors on logout
    }
    authLogout();
    navigate('/login', { replace: true });
  };

  const fetchOils = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOils();
      // Show only active products on Sell
      const activeOils = data.filter((oil) => oil.is_active);
      setOils(activeOils);
    } catch (err) {
      setError('Failed to load oils: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOilClick = (oil) => {
    setSelectedOil(oil);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOil(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <OwnerHeader
        title={t.customer.title}
        menuLabel={t?.common?.menu}
        left={(
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
        )}
        languageToggle={(
          <div>
            <div className="sm:hidden">
              <LanguageToggle language={language} onLanguageChange={setLanguage} variant="compact" />
            </div>
            <div className="hidden sm:block">
              <LanguageToggle language={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        )}
        primaryAction={{
          label: t.customer.calculator,
          shortLabel: t.customer.calculator,
          onClick: () => setIsCalculatorOpen(true),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          ),
        }}
        menuItems={[
          {
            key: 'manage',
            label: t.admin?.dashboard || 'Manage Oils',
            onClick: () => setIsManagementOpen(true),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ),
          },
          {
            key: 'monthly',
            label: t.reports?.thisMonth || 'This Month',
            onClick: () => setIsSummaryOpen(true),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h8m-6-4l4 4-4 4" />
              </svg>
            ),
          },
          {
            key: 'daily',
            label: t.reports?.today || 'Today',
            onClick: () => setIsDailyOpen(true),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            key: 'change-password',
            label: t?.common?.changePassword || (language === 'en' ? 'Change Password' : 'စကားဝှက် ပြောင်းမည်'),
            onClick: () => setIsChangePasswordOpen(true),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 0c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
              </svg>
            ),
          },
          {
            key: 'logout',
            label: t?.common?.logout || (language === 'en' ? 'Logout' : 'ထွက်ရန်'),
            onClick: handleLogout,
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            ),
          },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.customer.title}</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-tablet">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-tablet-lg text-gray-600">{t.common.loading}</p>
            </div>
          </div>
        ) : oils.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-32 w-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-6 text-tablet-xl font-semibold text-gray-700">No products available right now</h3>
            <p className="mt-2 text-tablet text-gray-500">Add products in Products, or activate existing ones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {oils.map((oil) => (
              <OilCard key={oil.id} oil={oil} language={language} onClick={() => handleOilClick(oil)} />
            ))}
          </div>
        )}
      </main>

      <OilDetailModal
        oil={selectedOil}
        language={language}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* New Sale Overlay */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-xl overflow-y-auto shadow-2xl">
            <MixCalculator
              onClose={() => setIsCalculatorOpen(false)}
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      )}

      {/* Products Overlay */}
      {isManagementOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[95vh] bg-white rounded-xl overflow-y-auto shadow-2xl">
            <AdminDashboard onClose={() => setIsManagementOpen(false)} language={language} />
          </div>
        </div>
      )}

      {/* This Month Overlay */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-xl overflow-y-auto shadow-2xl">
            <MonthlySummary onClose={() => setIsSummaryOpen(false)} language={language} />
          </div>
        </div>
      )}

      {/* Today Overlay */}
      {isDailyOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-xl overflow-y-auto shadow-2xl">
            <DailySummary onClose={() => setIsDailyOpen(false)} language={language} />
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        language={language}
        t={t}
      />
    </div>
  );
};
