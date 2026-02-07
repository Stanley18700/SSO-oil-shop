import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils, confirmSale } from '../api/api';
import { LanguageToggle } from '../components/LanguageToggle';
import { getUnitLabel } from '../utils/units';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

const LANGUAGE_STORAGE_KEY = 'sso_language';

/**
 * NewSale - Single-page shop counter selling screen
 * No steps, no wizard. Everything on one screen.
 * LEFT: Oil selection + quantity buttons + actions
 * RIGHT: Live price + cart + total + confirm
 */
export const NewSale = () => {
  const navigate = useNavigate();

  // Language
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'my' || saved === 'en' ? saved : 'en';
  });

  // Data
  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection state
  const [selectedOilId, setSelectedOilId] = useState(null);
  const [entryViss, setEntryViss] = useState(0);
  const [entryTicals, setEntryTicals] = useState(0);
  const [selectedTicalButtons, setSelectedTicalButtons] = useState([]);
  const [pendingSelections, setPendingSelections] = useState([]);

  // Cart: array of { oilId, oilName, viss, ticals, totalQuantityViss, price }
  const [cart, setCart] = useState([]);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const t = language === 'en' ? enTranslations : myTranslations;
  const formatTicals = (value) => {
    if (value === 0) return '0';
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

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

  // Helpers
  const selectedOil = oils.find(o => o.id === selectedOilId);
  const pendingTotal = pendingSelections.reduce((sum, item) => sum + item.price, 0);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.totalQuantityViss, 0);

  // Handlers
  const handleOilSelect = (oilId) => {
    setSelectedOilId(oilId);
  };

  const handleVissButton = (viss) => {
    // Toggle: if same button clicked, deselect (set to 0)
    setEntryViss(entryViss === viss ? 0 : viss);
  };

  const handleTicalButtonToggle = (ticals) => {
    setSelectedTicalButtons(prev => {
      const exists = prev.includes(ticals);
      const next = exists ? prev.filter(value => value !== ticals) : [...prev, ticals];
      const total = next.reduce((sum, value) => sum + value, 0);
      setEntryTicals(total);
      return next;
    });
  };

  const normalizeQuantity = (viss, ticals) => {
    const roundedTicals = Math.round(ticals * 10) / 10;
    const extraViss = Math.floor(roundedTicals / 100);
    const remainingTicals = parseFloat((roundedTicals % 100).toFixed(1));
    const finalViss = viss + extraViss;
    const totalQuantityViss = finalViss + (remainingTicals / 100);
    return { viss: finalViss, ticals: remainingTicals, totalQuantityViss };
  };

  const handleAddQuantity = () => {
    if (!selectedOil) return;
    if (entryViss === 0 && entryTicals === 0) return;

    setPendingSelections(prev => {
      const existingIndex = prev.findIndex(item => item.oilId === selectedOilId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const combinedViss = existing.viss + entryViss;
        const combinedTicals = existing.ticals + entryTicals;
        const normalized = normalizeQuantity(combinedViss, combinedTicals);
        const newPrice = parseFloat(selectedOil.price_per_unit) * normalized.totalQuantityViss;
        updated[existingIndex] = {
          ...existing,
          viss: normalized.viss,
          ticals: normalized.ticals,
          totalQuantityViss: normalized.totalQuantityViss,
          price: newPrice,
        };
        return updated;
      }

      const normalized = normalizeQuantity(entryViss, entryTicals);
      return [
        ...prev,
        {
          oilId: selectedOilId,
          oilName: language === 'en' ? selectedOil.name_en : selectedOil.name_my,
          viss: normalized.viss,
          ticals: normalized.ticals,
          totalQuantityViss: normalized.totalQuantityViss,
          price: parseFloat(selectedOil.price_per_unit) * normalized.totalQuantityViss,
        },
      ];
    });

    setEntryViss(0);
    setEntryTicals(0);
    setSelectedTicalButtons([]);
  };

  const handleAddToCart = () => {
    if (pendingSelections.length === 0) return;

    setCart(prevCart => {
      const updated = [...prevCart];
      pendingSelections.forEach(pendingItem => {
        const existingIndex = updated.findIndex(item => item.oilId === pendingItem.oilId);
        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          const totalViss = existing.viss + pendingItem.viss;
          const totalTicals = existing.ticals + pendingItem.ticals;
          const normalized = normalizeQuantity(totalViss, totalTicals);
          const oilForItem = oils.find(oil => oil.id === pendingItem.oilId);
          const pricePerUnit = parseFloat(oilForItem?.price_per_unit || 0);
          const newPrice = pricePerUnit > 0
            ? pricePerUnit * normalized.totalQuantityViss
            : existing.price + pendingItem.price;

          updated[existingIndex] = {
            ...existing,
            viss: normalized.viss,
            ticals: normalized.ticals,
            totalQuantityViss: normalized.totalQuantityViss,
            price: newPrice,
          };
        } else {
          updated.push(pendingItem);
        }
      });
      return updated;
    });

    setPendingSelections([]);
    setEntryViss(0);
    setEntryTicals(0);
    setSelectedTicalButtons([]);
  };

  const handleClearCart = () => {
    setCart([]);
    setPendingSelections([]);
    setEntryViss(0);
    setEntryTicals(0);
    setSelectedTicalButtons([]);
    setSelectedOilId(null);
  };

  const handleConfirmSaleClick = () => {
    if (cart.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSale = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const items = cart.map(item => ({
        oilId: item.oilId,
        quantity: item.totalQuantityViss,
        lineAmount: item.price,
      }));

      const saleType = cart.length === 1 ? 'SINGLE_OIL' : 'MIX';

      const payload = {
        totalAmount: cartTotal,
        totalQuantity: cartTotalQuantity,
        saleType,
        note: null,
        items,
      };

      await confirmSale(payload);

      // Success - reset and close
      setCart([]);
      setPendingSelections([]);
      setEntryViss(0);
      setEntryTicals(0);
      setSelectedTicalButtons([]);
      setSelectedOilId(null);
      setShowConfirmModal(false);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/', { replace: false });
      }, 300);
    } catch (err) {
      setSaveError(err?.message || 'Failed to confirm sale');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleRemovePendingItem = (oilId) => {
    setPendingSelections(prev => prev.filter(item => item.oilId !== oilId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t.common.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen landscape:h-screen landscape:overflow-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-amber-100 transition-colors"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">{t.sell?.newSale || 'New Sale'}</h1>
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Main Content - 2 column on tablet+, stacked on mobile */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 landscape:p-2 landscape:overflow-hidden">
        <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 landscape:gap-4">
          
          {/* LEFT SIDE - INPUT / SELECTION */}
          <div className="h-full min-h-0 flex flex-col gap-4 landscape:gap-3">
            
            {/* 1. Available Oils */}
            <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 landscape:p-2 !overflow-visible !max-h-none">
              <h2 className="text-base font-semibold mb-2 landscape:mb-1 landscape:text-sm text-gray-800">
                {t.admin?.oilList || 'Available Oils'}
              </h2>
              {oils.length === 0 ? (
                <p className="text-gray-500">{t.admin?.noOils || 'No oils available'}</p>
              ) : (
                <div className="!overflow-visible !max-h-none">
                  <div className="grid gap-2 landscape:gap-1 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] landscape:[grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
                    {oils.map((oil) => {
                      const isSelected = selectedOilId === oil.id;
                      const oilName = language === 'en' ? oil.name_en : oil.name_my;
                      return (
                        <button
                          key={oil.id}
                          onClick={() => handleOilSelect(oil.id)}
                          className={`p-2 landscape:p-1.5 rounded-md border-2 transition-all text-left ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-25'
                          }`}
                        >
                          <div className="font-semibold text-gray-900 text-xs leading-tight truncate">
                            {oilName}
                          </div>
                          <div className="text-[11px] text-gray-600 mt-1 landscape:mt-0.5 truncate">
                            {parseFloat(oil.price_per_unit).toLocaleString()} MMK / {getUnitLabel(oil.unit, language)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Quantity Selection Buttons */}
            <div className="bg-white rounded-lg shadow-md p-3 landscape:p-2">
              <h2 className="text-lg font-semibold mb-3 landscape:mb-2 landscape:text-base text-gray-800">
                {t.sell?.selectQuantity || 'Select Quantity'}
              </h2>
              
              {/* Row 1 - Viss (whole) */}
              <div className="mb-4 landscape:mb-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {getUnitLabel('viss', language)} (Whole)
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                    <button
                      key={v}
                      onClick={() => handleVissButton(v)}
                      className={`px-3 py-2 landscape:px-2 landscape:py-1.5 landscape:text-sm rounded-md border-2 font-medium transition-all ${
                        entryViss === v
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2 - Ticals (0.1 to 90) */}
              <div className="mb-4 landscape:mb-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Ticals (0.1 - 90)
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`px-3 py-2 landscape:px-2 landscape:py-1.5 landscape:text-sm rounded-md border-2 font-medium transition-all ${
                        selectedTicalButtons.includes(t)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`px-3 py-2 landscape:px-2 landscape:py-1.5 landscape:text-sm rounded-md border-2 font-medium transition-all ${
                        selectedTicalButtons.includes(t)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`px-3 py-2 landscape:px-2 landscape:py-1.5 landscape:text-sm rounded-md border-2 font-medium transition-all ${
                        selectedTicalButtons.includes(t)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={handleAddQuantity}
                  disabled={!selectedOil || (entryViss === 0 && entryTicals === 0)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg shadow-md transition-all"
                >
                  Add Quantity
                </button>
              </div>
            </div>

            {/* 3. Action Button */}
            <div className="bg-white rounded-lg shadow-md p-3 landscape:p-2">
              <button
                onClick={handleAddToCart}
                disabled={pendingSelections.length === 0}
                className="w-full py-4 landscape:py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl landscape:text-lg rounded-lg shadow-lg transition-all"
              >
                {t.sell?.addToCart || 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - LIVE CALCULATION / CART */}
          <div className="h-full min-h-0 flex flex-col gap-6 landscape:gap-4">
            
            {/* 4. Live Price Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-4 landscape:p-3">
              <h2 className="text-lg font-semibold mb-3 landscape:mb-2 landscape:text-base text-gray-800">
                {t.sell?.currentSelection || 'Current Selection'}
              </h2>
              {pendingSelections.length > 0 ? (
                <div className="space-y-2">
                  {pendingSelections.map((item) => (
                    <div key={item.oilId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-semibold text-gray-900">{item.oilName}</div>
                        <div className="text-sm text-gray-600">
                          {item.viss > 0 && `${item.viss} ${getUnitLabel('viss', language)}`}
                          {item.viss > 0 && item.ticals > 0 && ' + '}
                          {item.ticals > 0 && `${formatTicals(item.ticals)} Ticals`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-amber-600">
                          {item.price.toLocaleString()} MMK
                        </div>
                        <button
                          onClick={() => handleRemovePendingItem(item.oilId)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-700">{t.sell?.price || 'Price'}:</span>
                    <span className="text-xl font-bold text-amber-600">
                      {pendingTotal > 0 ? `${pendingTotal.toLocaleString()} MMK` : '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {t.sell?.selectOilFirst || 'Select an oil to begin'}
                </p>
              )}
            </div>

            {/* 5. Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-4 landscape:p-3">
              <h2 className="text-lg font-semibold mb-3 landscape:mb-2 landscape:text-base text-gray-800">
                {t.sell?.cart || 'Cart'}
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {t.sell?.cartEmpty || 'Cart is empty'}
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.oilName}</div>
                        <div className="text-sm text-gray-600">
                          {item.viss > 0 && `${item.viss} ${getUnitLabel('viss', language)}`}
                          {item.viss > 0 && item.ticals > 0 && ' + '}
                          {item.ticals > 0 && `${formatTicals(item.ticals)} Ticals`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-900">
                          {item.price.toLocaleString()} MMK
                        </div>
                        <button
                          onClick={() => handleRemoveCartItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Cart Total & Final Actions */}
            <div className="bg-white rounded-lg shadow-md p-4 landscape:p-3">
              <div className="mb-4 pb-4 border-b">
                <div className="text-sm text-gray-600 mb-1">
                  {t.sell?.totalAmount || 'TOTAL'}
                </div>
                <div className="text-4xl landscape:text-3xl font-bold text-amber-600">
                  {cartTotal > 0 ? `${cartTotal.toLocaleString()} MMK` : '0 MMK'}
                </div>
                {cart.length > 0 && (
                  <div className="text-sm text-gray-600 mt-2">
                    {cartTotalQuantity.toFixed(2)} {getUnitLabel('viss', language)} total
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                  className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg shadow-md transition-all"
                >
                  {t.sell?.clearCart || 'Clear Cart'}
                </button>
                <button
                  onClick={handleConfirmSaleClick}
                  disabled={cart.length === 0}
                  className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl rounded-lg shadow-lg transition-all"
                >
                  {t.sell?.confirmSale || 'Confirm Sale'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Sale Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              {t.sell?.confirmSale || 'Confirm Sale'}
            </h3>
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                {t.sell?.totalAmount || 'Total Amount'}:
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {cartTotal.toLocaleString()} MMK
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} • {cartTotalQuantity.toFixed(2)} {getUnitLabel('viss', language)}
              </div>
            </div>
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {saveError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSaveError('');
                }}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold rounded-lg transition-all"
              >
                {t.common?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleConfirmSale}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
              >
                {isSaving ? (t.common?.loading || 'Saving...') : (t.common?.yes || 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
