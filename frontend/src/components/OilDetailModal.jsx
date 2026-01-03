import { getUnitLabel } from '../utils/units';

/**
 * OilDetailModal component
 * Displays full oil information in a readable modal format
 */
export const OilDetailModal = ({ oil, language, isOpen, onClose }) => {
  if (!isOpen || !oil) return null;

  const name = language === 'en' ? oil.name_en : oil.name_my;
  const description = language === 'en' ? oil.description_en : oil.description_my;
  const priceLabel = language === 'en' ? 'MMK' : 'ကျပ်';
  const unitLabel = getUnitLabel(oil.unit || 'viss', language);
  const perLabel = language === 'en' ? 'per' : 'တစ်';

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="oil-detail-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label={language === 'en' ? 'Close' : 'ပိတ်မည်'}
        >
          <svg
            className="w-6 h-6 text-gray-600"
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

        {/* Oil image */}
        <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          {oil.image_url ? (
            <img
              src={oil.image_url}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-24 h-24 text-primary-400"
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
          )}
        </div>

        {/* Oil details - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Title */}
          <h2
            id="oil-detail-title"
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
          >
            {name}
          </h2>

          {/* Description - full text, readable */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {language === 'en' ? 'Description' : 'ဖော်ပြချက်'}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
              {description || (language === 'en' ? 'No description available.' : 'ဖော်ပြချက် မရှိပါ။')}
            </p>
          </div>

          {/* Price information */}
          <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {language === 'en' ? 'Price' : 'ဈေးနှုန်း'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-primary-600">
                  {parseFloat(oil.price_per_unit).toLocaleString()}
                </span>
                <span className="text-xl text-gray-500">{priceLabel}</span>
              </div>
              <div className="text-lg text-gray-600 font-semibold mt-2">
                {perLabel} {unitLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

