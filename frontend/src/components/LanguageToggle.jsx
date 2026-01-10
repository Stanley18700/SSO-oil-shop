/**
 * LanguageToggle component
 * Switches between English and Myanmar languages
 */
export const LanguageToggle = ({ language, onLanguageChange, variant = 'default' }) => {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`flex items-center gap-2 bg-white rounded-lg ${
        isCompact ? 'p-1 shadow-sm' : 'p-2 shadow-md'
      }`}
    >
      <button
        onClick={() => onLanguageChange('en')}
        className={`${isCompact ? 'px-3 py-1.5 min-w-0 text-sm' : 'px-4 py-2 min-w-[80px] text-tablet'} rounded-lg font-semibold transition-all duration-200 ${
          language === 'en'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isCompact ? 'EN' : 'English'}
      </button>
      <button
        onClick={() => onLanguageChange('my')}
        className={`${isCompact ? 'px-3 py-1.5 min-w-0 text-sm' : 'px-4 py-2 min-w-[80px] text-tablet'} rounded-lg font-semibold transition-all duration-200 ${
          language === 'my'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isCompact ? 'MY' : 'မြန်မာ'}
      </button>
    </div>
  );
};

