import { getUnitLabel } from '../utils/units';

/**
 * OilCard component
 * Displays oil information in a card format
 * Used in customer view (tablet-friendly design)
 */
export const OilCard = ({ oil, language, onClick, showCheckbox, checked, onCheckChange }) => {
  const name = language === 'en' ? oil.name_en : oil.name_my;
  const description = language === 'en' ? oil.description_en : oil.description_my;
  const priceLabel = language === 'en' ? 'MMK' : 'ကျပ်';
  const unitLabel = getUnitLabel(oil.unit || 'viss', language);

  // Handle card click - toggle selection
  const handleCardClick = () => {
    if (showCheckbox && onCheckChange) {
      onCheckChange(!checked);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`oil-card relative transition-all duration-200 ${
        showCheckbox 
          ? 'cursor-pointer select-none' 
          : onClick 
          ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
          : ''
      } ${
        checked && showCheckbox
          ? 'ring-4 ring-primary-400 ring-offset-2 shadow-xl scale-[1.02]'
          : showCheckbox
          ? 'hover:ring-2 hover:ring-primary-200 hover:shadow-lg'
          : ''
      }`}
      onClick={handleCardClick}
      role={(showCheckbox || onClick) ? 'button' : undefined}
      tabIndex={(showCheckbox || onClick) ? 0 : undefined}
      onKeyDown={(e) => {
        if ((showCheckbox || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Checkbox for calculator - Visual indicator only, whole card is clickable */}
      {showCheckbox && (
        <div 
          className="absolute top-4 right-4 z-10"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double-toggle when clicking checkbox directly
            onCheckChange?.(!checked);
          }}
        >
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-all ${
            checked 
              ? 'bg-primary-500 shadow-lg' 
              : 'bg-white border-2 border-gray-300 shadow-md'
          }`}>
            {checked && (
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Oil image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
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
              className="w-20 h-20 text-primary-400"
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

      {/* Oil details */}
      <div className="p-5">
        <h3 className="text-tablet-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-tablet text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
          {description}
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-tablet-xl font-bold text-primary-600">
              {parseFloat(oil.price_per_unit).toLocaleString()}
            </span>
            <span className="text-tablet text-gray-500">{priceLabel}</span>
          </div>
          <div className="text-sm text-gray-600 font-semibold">
            {language === 'en' ? 'per' : 'တစ်'} {unitLabel}
          </div>
          {!oil.is_active && (
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded inline-block w-fit">
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

