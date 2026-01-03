import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils } from '../api/api';
import { OilCard } from '../components/OilCard';
import { OilDetailModal } from '../components/OilDetailModal';
import { LanguageToggle } from '../components/LanguageToggle';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

/**
 * Customer View - Public tablet-friendly oil display
 */
export const CustomerView = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOil, setSelectedOil] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const t = language === 'en' ? enTranslations : myTranslations;

  // Fetch oils on mount
  useEffect(() => {
    fetchOils();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const fetchOils = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOils();
      // Filter only active oils for customers
      const activeOils = data.filter(oil => oil.is_active);
      setOils(activeOils);
    } catch (err) {
      setError('Failed to load oils: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle oil card click - open modal with full details
  const handleOilClick = (oil) => {
    setSelectedOil(oil);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOil(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {t.common.appName}
              </h1>
            </div>

            {/* Language toggle */}
            <LanguageToggle
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Calculator button */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t.customer.title}
          </h2>
          <button
            onClick={() => navigate('/calculator')}
            className="btn-primary flex items-center gap-2"
          >
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {t.customer.calculator}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-tablet">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-tablet-lg text-gray-600">
                {t.common.loading}
              </p>
            </div>
          </div>
        ) : oils.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <svg
              className="mx-auto h-32 w-32 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-6 text-tablet-xl font-semibold text-gray-700">
              No oils available at the moment
            </h3>
            <p className="mt-2 text-tablet text-gray-500">
              Please check back later
            </p>
          </div>
        ) : (
          /* Oils grid - tablet-friendly layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {oils.map((oil) => (
              <OilCard
                key={oil.id}
                oil={oil}
                language={language}
                onClick={() => handleOilClick(oil)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Oil Detail Modal */}
      <OilDetailModal
        oil={selectedOil}
        language={language}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Admin login link (subtle) */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-white hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-full shadow-lg text-sm transition-all duration-200"
        >
          Admin
        </button>
      </div>
    </div>
  );
};

