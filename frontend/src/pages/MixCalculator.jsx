import { useState, useEffect } from 'react';
import { confirmSale, getOils } from '../api/api';
import { OilCard } from '../components/OilCard';
import { LanguageToggle } from '../components/LanguageToggle';
import { getUnitLabel } from '../utils/units';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

/**
 * Mix Calculator - Calculate mixed oil prices by percentage
 * Used as a full-screen overlay from the owner display.
 */
export const MixCalculator = ({ onClose }) => {
  const [language, setLanguage] = useState('en');
  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected oils with their weights in Ticals (Myanmar weight system)
  const [selectedOils, setSelectedOils] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [saleSaved, setSaleSaved] = useState(false);
  const [saleSaveError, setSaleSaveError] = useState('');
  const [showConfirmSaleModal, setShowConfirmSaleModal] = useState(false);

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
        [oilId]: { ticals: 0 }, // Weight in Ticals instead of percentage
      }));
    } else {
      setSelectedOils((prev) => {
        const newSelected = { ...prev };
        delete newSelected[oilId];
        return newSelected;
      });
    }
  };

  // Navigation handlers
  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0); // Scroll to top on step change
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle weight input change (in Ticals)
  const handleWeightChange = (oilId, value) => {
    const ticals = parseFloat(value) || 0;
    setSelectedOils((prev) => ({
      ...prev,
      [oilId]: { ticals: Math.max(0, ticals) }, // No upper limit on ticals
    }));
  };

  // Handle finish calculation
  const handleFinish = () => {
    setShowSuccessModal(true);
  };

  // Handle close modal and return
  const handleCloseAndReturn = () => {
    setShowSuccessModal(false);
    if (onClose) {
      onClose();
    }
  };

  // Reset calculator
  const handleReset = () => {
    setSelectedOils({});
    setCurrentStep(1);
    setShowSuccessModal(false);
    setIsSavingSale(false);
    setSaleSaved(false);
    setSaleSaveError('');
    window.scrollTo(0, 0);
  };

  // Quick weight buttons (common Tical amounts)
  const handleQuickWeight = (oilId, ticals) => {
    handleWeightChange(oilId, ticals);
  };

  // Calculate total weight in Ticals
  const totalTicals = Object.values(selectedOils).reduce(
    (sum, oil) => sum + oil.ticals,
    0
  );

  // Convert to Viss (1 Viss = 100 Ticals)
  const totalViss = totalTicals / 100;

  // Calculate total price based on actual weights
  const calculateTotalPrice = () => {
    if (totalTicals === 0) return null;

    let totalPrice = 0;
    Object.entries(selectedOils).forEach(([oilId, data]) => {
      const oil = oils.find((o) => o.id === parseInt(oilId));
      if (oil && data.ticals > 0) {
        // Price = (price_per_viss * ticals) / 100
        const vissAmount = data.ticals / 100;
        totalPrice += parseFloat(oil.price_per_unit) * vissAmount;
      }
    });

    return totalPrice;
  };

  const totalPrice = calculateTotalPrice();
  const isValidMix = totalTicals > 0; // Any amount is valid
  const hasSelectedOils = Object.keys(selectedOils).length > 0;
  
  // Get the common unit from selected oils (assuming all use same unit)
  const commonUnit = hasSelectedOils 
    ? oils.find(o => o.id === parseInt(Object.keys(selectedOils)[0]))?.unit || 'viss'
    : 'viss';

  const buildSalePayload = () => {
    const items = Object.entries(selectedOils)
      .filter(([, data]) => (data?.ticals || 0) > 0)
      .map(([oilId, data]) => {
        const oil = oils.find((o) => o.id === parseInt(oilId));
        const quantityViss = (data.ticals || 0) / 100;
        const lineAmount = oil ? parseFloat(oil.price_per_unit) * quantityViss : 0;
        return {
          oilId: parseInt(oilId),
          quantity: quantityViss,
          lineAmount,
        };
      });

    const saleType = items.length <= 1 ? 'SINGLE_OIL' : 'MIX';

    return {
      totalAmount: totalPrice || 0,
      totalQuantity: totalViss,
      saleType,
      note: null,
      items,
    };
  };

  const handleConfirmSale = async () => {
    if (!isValidMix || !totalPrice || isSavingSale || saleSaved) return;
    setIsSavingSale(true);
    setSaleSaveError('');
    try {
      const payload = buildSalePayload();
      await confirmSale(payload);
      setSaleSaved(true);
      // After a successful save, reset to start for next customer
      setTimeout(() => {
        handleReset();
      }, 500);
    } catch (err) {
      setSaleSaveError(err?.message || 'Failed to confirm sale');
    } finally {
      setIsSavingSale(false);
    }
  };

  const handleConfirmSaleClick = () => {
    if (!isValidMix || !totalPrice || isSavingSale || saleSaved) return;
    setShowConfirmSaleModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showConfirmSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {t?.messages?.confirmSaleTitle || (language === 'en' ? 'Confirm Sale' : 'ရောင်းအား အတည်ပြုမည်')}
              </h3>
              <p className="text-gray-700 font-semibold">
                {t?.messages?.confirmSaleConfirm ||
                  (language === 'en'
                    ? 'Are you sure you want to confirm this sale?'
                    : 'ဤရောင်းအားကို အတည်ပြု၍ သိမ်းမည်မှာ သေချာပါသလား?')}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConfirmSaleModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black py-3 rounded-xl transition-colors"
                >
                  {t?.common?.no || t?.common?.cancel || (language === 'en' ? 'No' : 'မဟုတ်ပါ')}
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmSaleModal(false);
                    await handleConfirmSale();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-colors"
                >
                  {t?.common?.yes || (language === 'en' ? 'Yes' : 'ဟုတ်ကဲ့')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header - Mobile optimized */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <button
                  onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
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
              <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                {t.customer.calculator}
              </h1>
            </div>

            <div className="flex-shrink-0">
              <LanguageToggle
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 pb-24">
        {/* Progress Stepper - Visual guide - Mobile optimized */}
        <div className="mb-4 sm:mb-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative px-1 sm:px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 sm:h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 sm:h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center flex-1">
                <div 
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-xl transition-all duration-300 shadow-md sm:shadow-lg ${
                    currentStep === step 
                      ? 'bg-primary-500 text-white scale-105 sm:scale-125 border-2 sm:border-4 border-white' 
                      : currentStep > step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className={`mt-0.5 sm:mt-1 text-[10px] sm:text-sm font-bold text-center leading-tight ${currentStep === step ? 'text-primary-600' : 'text-gray-500'}`}>
                  {step === 1 ? (language === 'en' ? 'Select' : 'ရွေးချယ်ရန်') : 
                   step === 2 ? (language === 'en' ? 'Mix' : 'ရောစပ်ရန်') : 
                   (language === 'en' ? 'Result' : 'ရလဒ်')}
                </span>
              </div>
            ))}
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
          <div className="max-w-4xl mx-auto">
            {/* STEP 1: SELECT OILS */}
            {currentStep === 1 && (
              <div className="animate-fadeIn pb-24">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {language === 'en' ? 'Choose Your Oils' : 'ဆီ(များ) ရွေးချယ်ပါ'}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 mb-1">
                    {language === 'en'
                      ? 'Select one or more oils (single or mix)'
                      : 'ဆီ တစ်မျိုး သို့မဟုတ် အများ မည်မျှမဆို ရွေးချယ်ပါ'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {language === 'en' ? '💡 Tap anywhere on the card to select' : '💡 ကတ်ပေါ်တွင် နေရာမရွေးထိပါ'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
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

                {/* Fixed footer for mobile */}
                <div className="fixed bottom-0 left-0 right-0 bg-white p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 z-40">
                  <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="text-sm sm:text-lg font-bold text-gray-700 flex-shrink-0">
                      {hasSelectedOils ? (
                        <span>{Object.keys(selectedOils).length} {language === 'en' ? 'Selected' : 'ခု'}</span>
                      ) : (
                        <span className="text-gray-400">{language === 'en' ? 'None' : 'မရွေးရသေး'}</span>
                      )}
                    </div>
                    <button
                      disabled={Object.keys(selectedOils).length < 1}
                      onClick={nextStep}
                      className="btn-primary flex-1 py-3 sm:py-4 text-base sm:text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale font-bold"
                    >
                      <span className="truncate">{language === 'en' ? 'Continue' : 'ရှေ့သို့'}</span>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

             {/* STEP 2: SET WEIGHTS */}
            {currentStep === 2 && (
              <div className="animate-fadeIn pb-32">
                <div className="text-center mb-4 sm:mb-6 px-2">
                  <h2 className="text-lg sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    {language === 'en' ? 'Enter Weights (Ticals)' : 'အလေးချိန် ထည့်ပါ (ကျပ်သား)'}
                  </h2>
                  <p className="text-xs sm:text-lg text-gray-600">
                    {language === 'en' ? 'How many Ticals of each oil?' : 'ဆီ တစ်မျိုးချင်းစီ မည်မျှ ကျပ်သား?'}
                  </p>
                </div>

                {/* Sticky Total Weight Indicator - Mobile optimized */}
                <div className={`sticky top-14 sm:top-20 z-20 mb-4 sm:mb-6 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border-2 transition-all ${
                  isValidMix ? 'bg-green-50 border-green-500' : 'bg-white border-primary-200'
                }`}>
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-xl font-bold text-gray-700 block truncate">
                        {language === 'en' ? 'Total Weight' : 'စုစုပေါင်း'}
                      </span>
                      <span className="text-[10px] sm:text-sm text-gray-500 block">
                        {language === 'en' ? '100 Ticals = 1 Viss' : '၁၀၀ ကျပ်သား = ၁ ပိဿာ'}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xl sm:text-4xl font-black block leading-none ${
                        isValidMix ? 'text-green-600' : 'text-primary-600'
                      }`}>
                        {totalViss.toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-lg font-bold text-gray-600 block">
                        {language === 'en' ? 'Viss' : 'ပိဿာ'}
                      </span>
                      <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                        {totalTicals} {language === 'en' ? 'Ticals' : 'ကျပ်သား'}
                      </div>
                    </div>
                  </div>
                  {totalTicals === 0 && (
                    <p className="text-center mt-2 font-bold text-xs sm:text-lg text-primary-600">
                      {language === 'en' ? 'Enter weights to calculate' : 'အလေးချိန် ထည့်ပါ'}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-24">
                  {Object.entries(selectedOils).map(([oilId, data]) => {
                    const oil = oils.find((o) => o.id === parseInt(oilId));
                    if (!oil) return null;
                    const name = language === 'en' ? oil.name_en : oil.name_my;

                    return (
                      <div key={oilId} className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-primary-100 transition-all p-3 sm:p-4 md:p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-gray-800 flex-1 leading-tight pt-0.5">{name}</h3>
                          <div className="text-primary-600 font-bold bg-primary-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-right flex-shrink-0">
                            <div className="text-xs sm:text-sm md:text-base leading-tight">{parseFloat(oil.price_per_unit).toLocaleString()} MMK</div>
                            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-normal whitespace-nowrap leading-tight">
                              {language === 'en' ? 'per' : 'တစ်'} {getUnitLabel(oil.unit || 'viss', language)}
                            </div>
                          </div>
                        </div>

                        {/* Fully Responsive Input Group */}
                        <div className="w-full mb-3 sm:mb-4">
                          <div className="flex items-stretch border-2 sm:border-4 border-gray-100 rounded-xl sm:rounded-2xl focus-within:border-primary-500 transition-all bg-white overflow-hidden shadow-sm">
                            <input
                              type="number"
                              value={data.ticals || ''}
                              onChange={(e) => handleWeightChange(oilId, e.target.value)}
                              className="flex-1 text-xl sm:text-2xl md:text-4xl font-black text-center py-3 sm:py-4 md:py-5 outline-none bg-transparent min-w-0 px-2"
                              placeholder="0"
                              min="0"
                              step="1"
                            />
                            <div className="flex items-center justify-center bg-gray-50 px-2 sm:px-4 md:px-6 text-[11px] sm:text-sm md:text-xl font-bold text-gray-600 border-l-2 border-gray-200 shrink-0">
                              <span className="whitespace-nowrap">
                                {language === 'en' ? 'Ticals' : 'ကျပ်သား'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Tical Buttons - Fully Responsive */}
                        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2">
                          {[10, 25, 50, 75, 100].map((ticals) => (
                            <button
                              key={ticals}
                              onClick={() => handleQuickWeight(oilId, ticals)}
                              className="bg-gray-100 hover:bg-primary-500 active:bg-primary-600 hover:text-white text-gray-700 font-bold py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl transition-all text-xs sm:text-sm md:text-lg shadow-sm"
                            >
                              {ticals}
                            </button>
                          ))}
                        </div>

                        {/* Quick Viss Buttons - for larger amounts */}
                        <div className="mt-2 grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2">
                          {[1, 1.5, 2, 2.5].map((viss) => (
                            <button
                              key={viss}
                              onClick={() => handleQuickWeight(oilId, viss * 100)}
                              className="bg-primary-50 hover:bg-primary-500 active:bg-primary-600 hover:text-white text-primary-700 font-bold py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl transition-all text-xs sm:text-sm md:text-lg shadow-sm"
                            >
                              {viss} {language === 'en' ? 'Viss' : 'ပိဿာ'}
                            </button>
                          ))}
                        </div>
                        
                        {/* Additional Viss Buttons - second row for more options */}
                        <div className="mt-1 sm:mt-1.5 md:mt-2 grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2">
                          {[3, 3.5, 4, 5].map((viss) => (
                            <button
                              key={viss}
                              onClick={() => handleQuickWeight(oilId, viss * 100)}
                              className="bg-amber-50 hover:bg-amber-500 active:bg-amber-600 hover:text-white text-amber-700 font-bold py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl transition-all text-xs sm:text-sm md:text-lg shadow-sm"
                            >
                              {viss} {language === 'en' ? 'Viss' : 'ပိဿာ'}
                            </button>
                          ))}
                        </div>

                        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1 sm:mt-1.5 md:mt-2 text-center leading-tight">
                          {language === 'en'
                            ? '💡 Tap Ticals or Viss buttons, or type amount'
                            : '💡 ကျပ်သား / ပိဿာ ခလုတ်များ သို့မဟုတ် ရိုက်ထည့်ပါ'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Navigation - Mobile optimized */}
                <div className="fixed bottom-0 left-0 w-full bg-white p-3 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-gray-100 flex gap-2 sm:gap-4 z-40">
                  <button
                    onClick={prevStep}
                    className="btn-secondary flex-1 py-3 sm:py-5 text-base sm:text-xl flex items-center justify-center gap-1 sm:gap-2 font-bold"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    <span className="hidden sm:inline">{language === 'en' ? 'Back' : 'နောက်သို့'}</span>
                  </button>
                  <button
                    disabled={!isValidMix}
                    onClick={nextStep}
                    className="btn-primary flex-[2] py-3 sm:py-5 text-base sm:text-xl flex items-center justify-center gap-1 sm:gap-2 font-black shadow-xl disabled:opacity-50"
                  >
                    <span className="truncate">{language === 'en' ? 'Calculate' : 'တွက်ချက်မည်'}</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESULT SUMMARY */}
            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-black text-gray-800 mb-2">
                    {language === 'en' ? 'Mix Ready!' : 'ရောစပ်မှု အဆင်သင့်ဖြစ်ပါပြီ!'}
                  </h2>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-10">
                  {/* Total Weight Display */}
                  <div className="bg-blue-500 p-6 text-white text-center border-b-4 border-blue-600">
                    <p className="text-lg opacity-90 mb-1 font-bold">
                      {language === 'en' ? 'Total Mixed Oil Weight' : 'စုစုပေါင်း ရောစပ်ဆီ အလေးချိန်'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <span className="text-4xl font-black leading-none block">
                          {totalViss.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold opacity-90">
                          {language === 'en' ? 'Viss (ပိဿာ)' : 'ပိဿာ'}
                        </span>
                      </div>
                      <span className="text-2xl">=</span>
                      <div className="text-center">
                        <span className="text-4xl font-black leading-none block">
                          {totalTicals}
                        </span>
                        <span className="text-sm font-bold opacity-90">
                          {language === 'en' ? 'Ticals (ကျပ်သား)' : 'ကျပ်သား'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Price */}
                  <div className="bg-primary-500 p-8 text-white text-center">
                    <p className="text-xl opacity-90 mb-2 uppercase tracking-widest font-bold">
                      {language === 'en' ? 'Total Price to Pay' : 'စုစုပေါင်း ပေးရမည့် ဈေးနှုန်း'}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-6xl font-black leading-none">
                        {totalPrice?.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <span className="text-2xl font-bold self-end mb-2">MMK</span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-6 border-b pb-4">
                      {language === 'en' ? 'Mix Breakdown' : 'ရောစပ်မှု အသေးစိတ်'}
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(selectedOils).map(([oilId, data]) => {
                        const oil = oils.find((o) => o.id === parseInt(oilId));
                        if (!oil) return null;
                        const name = language === 'en' ? oil.name_en : oil.name_my;
                        const vissAmount = data.ticals / 100;
                        const itemPrice = parseFloat(oil.price_per_unit) * vissAmount;
                        return (
                          <div key={oilId} className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col">
                                <span className="text-2xl font-black text-gray-800">{name}</span>
                                <span className="text-gray-500 font-semibold text-sm">
                                  {parseFloat(oil.price_per_unit).toLocaleString()} MMK / {getUnitLabel(oil.unit || 'viss', language)}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-2xl">
                                  {data.ticals} <span className="text-lg">{language === 'en' ? 'Ticals' : 'ကျပ်သား'}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  = {vissAmount.toFixed(2)} {language === 'en' ? 'Viss' : 'ပိဿာ'}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-600">
                                {language === 'en' ? 'Subtotal:' : 'စုစုပေါင်း:'}
                              </span>
                              <span className="text-xl font-bold text-gray-800">
                                {itemPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })} MMK
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-20">
                  <button
                    onClick={handleConfirmSaleClick}
                    disabled={!isValidMix || !totalPrice || isSavingSale || saleSaved}
                    className={`w-full py-5 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-lg font-black transition-all disabled:opacity-50 disabled:grayscale ${
                      saleSaved
                        ? 'bg-green-600 text-white'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {saleSaved ? (
                      <>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        {language === 'en' ? 'Sale Confirmed' : 'ရောင်းအား သိမ်းပြီးပါပြီ'}
                      </>
                    ) : isSavingSale ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        {language === 'en' ? 'Saving...' : 'သိမ်းနေသည်...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {language === 'en' ? 'Confirm Sale' : 'ရောင်းအား အတည်ပြုမည်'}
                      </>
                    )}
                  </button>

                  {saleSaveError && (
                    <div className="text-center text-red-600 text-sm font-semibold">
                      {saleSaveError}
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg transition-colors hover:bg-blue-700"
                  >
                    {language === 'en' ? 'Start New Calculation' : 'အသစ်ပြန်တွက်မည်'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-primary-600 font-bold py-4 text-lg"
                  >
                    {language === 'en' ? 'Back to Home' : 'ပင်မစာမျက်နှာသို့'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Keep the original modal but only as a backup/reference or remove it since Step 3 is now a dedicated screen */}
      {/* (Removed showSuccessModal as Step 3 replaces it for better tablet UX) */}
    </div>
  );
};


