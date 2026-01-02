import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils } from '../api/api';
import { OilCard } from '../components/OilCard';
import { LanguageToggle } from '../components/LanguageToggle';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

/**
 * Mix Calculator - Calculate mixed oil prices by percentage
 */
export const MixCalculator = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected oils with their percentages
  const [selectedOils, setSelectedOils] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const t = language === 'en' ? enTranslations : myTranslations;

  // Fetch oils on mount
  useEffect(() => {
    fetchOils();
  }, []);

  const fetchOils = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOils();
      const activeOils = data.filter(oil => oil.is_active);
      setOils(activeOils);
    } catch (err) {
      setError('Failed to load oils: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle oil selection toggle
  const handleOilToggle = (oilId, isChecked) => {
    if (isChecked) {
      setSelectedOils((prev) => ({
        ...prev,
        [oilId]: { percentage: 0 },
      }));
      // Move to step 2 when first oil is selected
      if (Object.keys(selectedOils).length === 0) {
        setCurrentStep(2);
      }
    } else {
      setSelectedOils((prev) => {
        const newSelected = { ...prev };
        delete newSelected[oilId];
        // Go back to step 1 if no oils selected
        if (Object.keys(newSelected).length === 0) {
          setCurrentStep(1);
        }
        return newSelected;
      });
    }
  };

  // Handle percentage input change
  const handlePercentageChange = (oilId, value) => {
    const percentage = parseFloat(value) || 0;
    setSelectedOils((prev) => ({
      ...prev,
      [oilId]: { percentage: Math.max(0, Math.min(100, percentage)) },
    }));
    
    // Auto-advance to step 3 when user starts entering percentages
    if (currentStep === 2 && percentage > 0) {
      setCurrentStep(3);
    }
  };

  // Handle finish calculation
  const handleFinish = () => {
    setShowSuccessModal(true);
  };

  // Handle close modal and return
  const handleCloseAndReturn = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  // Reset calculator
  const handleReset = () => {
    setSelectedOils({});
    setCurrentStep(1);
    setShowSuccessModal(false);
  };

  // Calculate total percentage
  const totalPercentage = Object.values(selectedOils).reduce(
    (sum, oil) => sum + oil.percentage,
    0
  );

  // Calculate total price (weighted average)
  const calculateTotalPrice = () => {
    if (totalPercentage !== 100) {
      return null;
    }

    let totalPrice = 0;
    Object.entries(selectedOils).forEach(([oilId, data]) => {
      const oil = oils.find((o) => o.id === parseInt(oilId));
      if (oil) {
        totalPrice += (parseFloat(oil.price_per_unit) * data.percentage) / 100;
      }
    });

    return totalPrice;
  };

  const totalPrice = calculateTotalPrice();
  const isValidMix = totalPercentage === 100;
  const hasSelectedOils = Object.keys(selectedOils).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {t.customer.calculator}
              </h1>
            </div>

            <LanguageToggle
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step-by-step Instructions */}
        <div className="card mb-8">
          <h2 className="text-tablet-xl font-bold text-gray-800 mb-6">
            {language === 'en' ? 'How to Calculate Mixed Oil Price' : 'ရောစပ်ဆီ ဈေးနှုန်း တွက်ချက်နည်း'}
          </h2>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className={`flex gap-4 p-4 rounded-lg transition-all ${currentStep >= 1 ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-tablet mb-1">
                  {language === 'en' ? 'Step 1: Select Oils' : 'အဆင့် ၁ - ဆီများ ရွေးချယ်ပါ'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' ? 'Check the boxes on the oils you want to mix (at least 2)' : 'ရောစပ်လိုသော ဆီများကို အမှန်ခြစ်ပါ (အနည်းဆုံး ၂ခု)'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex gap-4 p-4 rounded-lg transition-all ${currentStep >= 2 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-tablet mb-1">
                  {language === 'en' ? 'Step 2: Enter Percentages' : 'အဆင့် ၂ - ရာခိုင်နှုန်း ထည့်ပါ'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' ? 'Enter the percentage for each oil (total must equal 100%)' : 'ဆီတစ်ခုချင်းစီအတွက် ရာခိုင်နှုန်း ထည့်ပါ (စုစုပေါင်း ၁၀၀% ဖြစ်ရမည်)'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex gap-4 p-4 rounded-lg transition-all ${currentStep >= 3 && isValidMix ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep >= 3 && isValidMix ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-tablet mb-1">
                  {language === 'en' ? 'Step 3: View Result' : 'အဆင့် ၃ - ရလဒ် ကြည့်ပါ'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' ? 'See your calculated mixed oil price and save it!' : 'တွက်ချက်ထားသော ဆီဈေးနှုန်းကို ကြည့်၍ သိမ်းပါ!'}
                </p>
              </div>
            </div>
          </div>

          {/* Important note */}
          <div className="mt-6 bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
            <p className="text-tablet font-semibold text-primary-800">
              💡 {t.customer.mustEqual100}
            </p>
          </div>
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
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left side: Oil selection grid */}
            <div className="lg:col-span-2">
              <h2 className="text-tablet-xl font-bold text-gray-800 mb-4">
                Select Oils
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {oils.map((oil) => (
                  <OilCard
                    key={oil.id}
                    oil={oil}
                    language={language}
                    showCheckbox={true}
                    checked={!!selectedOils[oil.id]}
                    onCheckChange={(checked) => handleOilToggle(oil.id, checked)}
                  />
                ))}
              </div>
            </div>

            {/* Right side: Calculator panel */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-tablet-xl font-bold text-gray-800 mb-6">
                  {t.customer.calculator}
                </h2>

                {/* Selected oils with percentage inputs */}
                {hasSelectedOils ? (
                  <div className="space-y-4 mb-6">
                    {Object.entries(selectedOils).map(([oilId, data]) => {
                      const oil = oils.find((o) => o.id === parseInt(oilId));
                      if (!oil) return null;

                      const name = language === 'en' ? oil.name_en : oil.name_my;

                      return (
                        <div key={oilId} className="pb-4 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-tablet font-semibold text-gray-700">
                              {name}
                            </span>
                            <button
                              onClick={() => handleOilToggle(oilId, false)}
                              className="text-red-500 hover:text-red-700"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={data.percentage || ''}
                              onChange={(e) =>
                                handlePercentageChange(oilId, e.target.value)
                              }
                              className="input-field flex-1"
                              placeholder="0"
                            />
                            <span className="text-tablet font-semibold text-gray-600">
                              %
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {parseFloat(oil.price_per_unit).toLocaleString()} {t.customer.mmk}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-tablet">Select oils to start</p>
                  </div>
                )}

                {/* Total percentage indicator */}
                {hasSelectedOils && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-tablet font-semibold text-gray-700">
                          {t.customer.totalPercentage}
                        </span>
                        <span
                          className={`text-tablet-lg font-bold ${
                            isValidMix
                              ? 'text-green-600'
                              : totalPercentage > 100
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {totalPercentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isValidMix
                              ? 'bg-green-500'
                              : totalPercentage > 100
                              ? 'bg-red-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                        />
                      </div>

                      {!isValidMix && (
                        <p className="text-sm text-orange-600 mt-2">
                          {totalPercentage > 100
                            ? 'Total exceeds 100%'
                            : `Need ${(100 - totalPercentage).toFixed(1)}% more`}
                        </p>
                      )}
                    </div>

                    {/* Total price result */}
                    <div
                      className={`p-6 rounded-xl mb-4 ${
                        isValidMix
                          ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-tablet text-gray-600 mb-2">
                          {t.customer.totalPrice}
                        </p>
                        {isValidMix ? (
                          <>
                            <p className="text-4xl font-bold text-green-600 mb-1">
                              {totalPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <p className="text-tablet text-gray-600">{t.customer.mmk}</p>
                          </>
                        ) : (
                          <p className="text-2xl font-semibold text-gray-400">
                            -- {t.customer.mmk}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {isValidMix && (
                        <button
                          onClick={handleFinish}
                          className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {language === 'en' ? 'Done - View Summary' : 'ပြီးပါပြီ - အကျဉ်းချုပ် ကြည့်မည်'}
                        </button>
                      )}
                      
                      <button
                        onClick={handleReset}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {language === 'en' ? 'Start Over' : 'ပြန်စ မည်'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && isValidMix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-6 md:p-8">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {language === 'en' ? 'Calculation Complete!' : 'တွက်ချက်မှု အောင်မြင်ပါပြီ!'}
                </h2>
                <p className="text-tablet text-gray-600">
                  {language === 'en' ? 'Here\'s your mixed oil price summary' : 'သင်၏ ရောစပ်ဆီ ဈေးနှုန်း အကျဉ်းချုပ်'}
                </p>
              </div>

              {/* Summary Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-tablet-lg mb-4 text-gray-800">
                  {language === 'en' ? 'Mix Composition:' : 'ရောစပ်မှု အစိတ်အပိုင်းများ:'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedOils).map(([oilId, data]) => {
                    const oil = oils.find((o) => o.id === parseInt(oilId));
                    if (!oil) return null;
                    const name = language === 'en' ? oil.name_en : oil.name_my;
                    return (
                      <div key={oilId} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <span className="font-semibold text-gray-800">{name}</span>
                          <span className="text-primary-600 font-bold ml-2">{data.percentage}%</span>
                        </div>
                        <span className="text-gray-600">
                          {parseFloat(oil.price_per_unit).toLocaleString()} {t.customer.mmk}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Final Price */}
                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-tablet-lg font-bold text-gray-800">
                      {language === 'en' ? 'Your Mixed Oil Price:' : 'ရောစပ်ဆီ ဈေးနှုန်း:'}
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {totalPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-tablet text-gray-600">{t.customer.mmk} / {language === 'en' ? 'unit' : 'ယူနစ်'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="btn-secondary flex-1"
                >
                  {language === 'en' ? 'Calculate Again' : 'ထပ် တွက်မည်'}
                </button>
                <button
                  onClick={handleCloseAndReturn}
                  className="btn-primary flex-1"
                >
                  {language === 'en' ? 'OK - Back to Home' : 'ကောင်းပြီ - ပင်မစာမျက်နှာ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

