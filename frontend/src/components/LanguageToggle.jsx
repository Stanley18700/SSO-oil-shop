/**
 * LanguageToggle component
 * Switches between English and Myanmar languages
 */
export const LanguageToggle = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 min-w-[80px] text-tablet ${
          language === 'en'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('my')}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 min-w-[80px] text-tablet ${
          language === 'my'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        မြန်မာ
      </button>
    </div>
  );
};

