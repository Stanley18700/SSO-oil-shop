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

  return (
    <div
      className={`oil-card relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Checkbox for calculator */}
      {showCheckbox && (
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onCheckChange?.(e.target.checked);
            }}
            className="w-6 h-6 cursor-pointer"
          />
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

