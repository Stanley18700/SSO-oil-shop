import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils } from '../api/api';
import { OilCard } from '../components/OilCard';
import { LanguageToggle } from '../components/LanguageToggle';
import { getUnitLabel, formatQuantityWithUnit } from '../utils/units';
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
  const [quantity, setQuantity] = useState(1); // How many Viss/Liters customer wants

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

  // Handle percentage input change
  const handlePercentageChange = (oilId, value) => {
    const percentage = parseFloat(value) || 0;
    setSelectedOils((prev) => ({
      ...prev,
      [oilId]: { percentage: Math.max(0, Math.min(100, percentage)) },
    }));
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
    setQuantity(1);
  };

  // Quick percentage buttons
  const handleQuickPercentage = (oilId, percentage) => {
    handlePercentageChange(oilId, percentage);
  };

  // Print calculation
  const handlePrint = () => {
    window.print();
  };

  // Share calculation (copy to clipboard)
  const handleShare = () => {
    const mixDetails = Object.entries(selectedOils)
      .map(([oilId, data]) => {
        const oil = oils.find((o) => o.id === parseInt(oilId));
        const name = language === 'en' ? oil.name_en : oil.name_my;
        return `${name}: ${data.percentage}%`;
      })
      .join('\n');
    
    const unitLabel = getUnitLabel(commonUnit, language);
    const shareText = `${t.common.appName}\n\n${mixDetails}\n\n${language === 'en' ? 'Price per' : 'ဈေးနှုန်း'} ${unitLabel}: ${pricePerUnit?.toLocaleString()} MMK\n${language === 'en' ? 'Quantity' : 'အရေအတွက်'}: ${quantity} ${unitLabel}\n${language === 'en' ? 'Total Price' : 'စုစုပေါင်း ဈေးနှုန်း'}: ${totalPrice?.toLocaleString()} MMK`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert(language === 'en' ? 'Calculation copied to clipboard!' : 'တွက်ချက်မှုကို ကူးယူပြီးပါပြီ!');
    });
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

  const pricePerUnit = calculateTotalPrice();
  const totalPrice = pricePerUnit ? pricePerUnit * quantity : null;
  const isValidMix = totalPercentage === 100;
  const hasSelectedOils = Object.keys(selectedOils).length > 0;
  
  // Get the common unit from selected oils (assuming all use same unit)
  const commonUnit = hasSelectedOils 
    ? oils.find(o => o.id === parseInt(Object.keys(selectedOils)[0]))?.unit || 'viss'
    : 'viss';

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
        {/* Progress Stepper - Visual guide */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-lg ${
                    currentStep === step 
                      ? 'bg-primary-500 text-white scale-125 border-4 border-white' 
                      : currentStep > step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className={`mt-2 text-sm font-bold ${currentStep === step ? 'text-primary-600' : 'text-gray-500'}`}>
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
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {language === 'en' ? 'Choose Your Oils' : 'ဆီများ ရွေးချယ်ပါ'}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {language === 'en' ? 'Select at least 2 oils to mix' : 'အနည်းဆုံး ဆီ ၂ မျိုး ရွေးချယ်ပါ'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
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

                <div className="sticky bottom-6 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-between gap-4">
                  <div className="text-lg font-bold text-gray-700">
                    {hasSelectedOils ? (
                      <span>{Object.keys(selectedOils).length} {language === 'en' ? 'Selected' : 'ခု ရွေးထားသည်'}</span>
                    ) : (
                      <span className="text-gray-400">{language === 'en' ? 'None Selected' : 'မရွေးရသေးပါ'}</span>
                    )}
                  </div>
                  <button
                    disabled={Object.keys(selectedOils).length < 2}
                    onClick={nextStep}
                    className="btn-primary flex-1 py-4 text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                  >
                    {language === 'en' ? 'Continue to Mixing' : 'ရှေ့သို့'}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SET PERCENTAGES */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {language === 'en' ? 'Set Mixing Proportions' : 'ရောစပ်မည့် ရာခိုင်နှုန်း သတ်မှတ်ပါ'}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {language === 'en' ? 'Adjust percentages to reach 100%' : 'စုစုပေါင်း ၁၀၀% ဖြစ်အောင် ညှိပါ'}
                  </p>
                </div>

                {/* Sticky Total Indicator */}
                <div className={`sticky top-24 z-20 mb-8 p-6 rounded-2xl shadow-xl border-2 transition-all ${
                  isValidMix ? 'bg-green-50 border-green-500' : 'bg-white border-primary-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-gray-700">
                      {language === 'en' ? 'Total Percentage' : 'စုစုပေါင်း ရာခိုင်နှုန်း'}
                    </span>
                    <span className={`text-4xl font-black ${
                      isValidMix ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-primary-600'
                    }`}>
                      {totalPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isValidMix ? 'bg-green-500' : totalPercentage > 100 ? 'bg-red-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                    />
                  </div>
                  {totalPercentage !== 100 && (
                    <p className={`text-center mt-3 font-bold text-lg ${totalPercentage > 100 ? 'text-red-600' : 'text-primary-600'}`}>
                      {totalPercentage > 100 
                        ? (language === 'en' ? `Reduce by ${(totalPercentage - 100).toFixed(0)}%` : `${(totalPercentage - 100).toFixed(0)}% လျှော့ပါ`)
                        : (language === 'en' ? `Add ${(100 - totalPercentage).toFixed(0)}% more` : `${(100 - totalPercentage).toFixed(0)}% ထပ်ပေါင်းပါ`)
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-6 mb-24">
                  {Object.entries(selectedOils).map(([oilId, data]) => {
                    const oil = oils.find((o) => o.id === parseInt(oilId));
                    if (!oil) return null;
                    const name = language === 'en' ? oil.name_en : oil.name_my;

                    return (
                      <div key={oilId} className="card border-2 border-gray-100 hover:border-primary-100 transition-all p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                          <div className="text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-lg text-center">
                            <div>{parseFloat(oil.price_per_unit).toLocaleString()} MMK</div>
                            <div className="text-xs text-gray-600 font-normal">
                              {language === 'en' ? 'per' : 'တစ်'} {getUnitLabel(oil.unit || 'viss', language)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <input
                            type="number"
                            value={data.percentage || ''}
                            onChange={(e) => handlePercentageChange(oilId, e.target.value)}
                            className="flex-1 text-4xl font-black text-center py-5 border-4 border-gray-100 rounded-2xl focus:border-primary-500 transition-all outline-none"
                            placeholder="0"
                          />
                          <span className="text-4xl font-black text-gray-400">%</span>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          {[25, 33, 50, 100].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => handleQuickPercentage(oilId, percent)}
                              className="bg-gray-100 hover:bg-primary-500 hover:text-white text-gray-700 font-bold py-4 rounded-xl transition-all text-xl shadow-sm"
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity Input - How many Viss/Liters */}
                <div className="card bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6 mb-24">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {language === 'en' ? '🛒 How much do you need?' : '🛒 မည်မျှ လိုအပ်ပါသလဲ?'}
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                      min="0.1"
                      step="0.5"
                      className="flex-1 text-4xl font-black text-center py-5 border-4 border-blue-200 rounded-2xl focus:border-blue-500 transition-all outline-none bg-white"
                      placeholder="1"
                    />
                    <span className="text-3xl font-black text-gray-700 bg-blue-100 px-4 py-3 rounded-xl">
                      {getUnitLabel(commonUnit, language)}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {[1, 2, 5, 10, 20].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty)}
                        className="bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 font-bold py-3 rounded-xl transition-all text-lg"
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 w-full bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-gray-100 flex gap-4 z-30">
                  <button
                    onClick={prevStep}
                    className="btn-secondary flex-1 py-5 text-xl flex items-center justify-center gap-2 font-bold"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    {language === 'en' ? 'Back' : 'နောက်သို့'}
                  </button>
                  <button
                    disabled={!isValidMix}
                    onClick={nextStep}
                    className="btn-primary flex-[2] py-5 text-xl flex items-center justify-center gap-2 font-black shadow-xl"
                  >
                    {language === 'en' ? 'Calculate Result' : 'တွက်ချက်မည်'}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {/* Price per Unit */}
                  <div className="bg-blue-500 p-6 text-white text-center border-b-4 border-blue-600">
                    <p className="text-lg opacity-90 mb-1 font-bold">
                      {language === 'en' ? 'Mixed Oil Price per' : 'ရောစပ်ဆီ ဈေးနှုန်း'} {getUnitLabel(commonUnit, language)}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-black leading-none">
                        {pricePerUnit?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-xl font-bold">MMK</span>
                    </div>
                  </div>
                  
                  {/* Total Price for Quantity */}
                  <div className="bg-primary-500 p-8 text-white text-center">
                    <p className="text-sm opacity-90 mb-2">
                      {formatQuantityWithUnit(quantity, commonUnit, language)}
                    </p>
                    <p className="text-xl opacity-90 mb-2 uppercase tracking-widest font-bold">
                      {language === 'en' ? 'Total Price' : 'စုစုပေါင်း ဈေးနှုန်း'}
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
                      {language === 'en' ? 'Composition' : 'ပါဝင်မှု အစိတ်အပိုင်းများ'}
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(selectedOils).map(([oilId, data]) => {
                        const oil = oils.find((o) => o.id === parseInt(oilId));
                        if (!oil) return null;
                        const name = language === 'en' ? oil.name_en : oil.name_my;
                        return (
                          <div key={oilId} className="flex justify-between items-center group">
                            <div className="flex flex-col">
                              <span className="text-2xl font-black text-gray-800">{name}</span>
                              <span className="text-gray-500 font-bold">
                                {parseFloat(oil.price_per_unit).toLocaleString()} MMK / {getUnitLabel(oil.unit || 'viss', language)}
                              </span>
                            </div>
                            <div className="text-3xl font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-2xl">
                              {data.percentage}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-20">
                  <div className="flex gap-4">
                    <button
                      onClick={handlePrint}
                      className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-lg"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      {language === 'en' ? 'Print' : 'ပရင့်'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 bg-green-600 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-lg"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {language === 'en' ? 'Share' : 'မျှဝေမည်'}
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full bg-white text-gray-700 border-4 border-gray-100 font-black py-5 rounded-2xl text-xl shadow-md"
                  >
                    {language === 'en' ? 'Start New Calculation' : 'အသစ်ပြန်တွက်မည်'}
                  </button>
                  <button
                    onClick={() => navigate('/')}
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


