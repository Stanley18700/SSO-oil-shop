import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils, confirmSale } from '../api/api';
import { LanguageToggle } from '../components/LanguageToggle';
import { getUnitLabel } from '../utils/units';
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LANGUAGE_STORAGE_KEY = 'sso_language';
const OIL_ORDER_STORAGE_KEY = 'sso_oil_order';
const CATEGORY_ORDER = ['peanut', 'sesame', 'palm'];
const CATEGORY_DIVIDERS = {
  peanut: { id: 'divider:peanut', label: 'Peanut Oils' },
  sesame: { id: 'divider:sesame', label: 'Sesame Oils' },
  palm: { id: 'divider:palm', label: 'Palm Oils' },
};

const SortableOilCard = memo(({ oil, oilName, isSelected, language, isReorderMode, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oil.id, disabled: !isReorderMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: isReorderMode ? 'none' : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-70' : ''} ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
    >
      <button
        onClick={isReorderMode ? undefined : () => onSelect(oil.id)}
        className={`w-full p-2.5 landscape:p-2 rounded-lg border-2 transition-all text-left ${
          isSelected
            ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-200 ring-opacity-50'
            : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-25 shadow-sm'
        } ${isReorderMode ? 'pointer-events-none' : ''}`}
      >
        <div className={`font-bold text-gray-900 leading-snug truncate ${language === 'my' ? 'text-base' : 'text-sm'}`}>
          {oilName}
        </div>
        <div className={`mt-1 truncate font-extrabold tracking-wide ${
          isSelected ? 'text-amber-900' : 'text-emerald-900'
        } ${language === 'my' ? 'text-base' : 'text-sm'}`}>
          {parseFloat(oil.price_per_unit).toLocaleString()} MMK / {getUnitLabel(oil.unit, language)}
        </div>
      </button>
      {isReorderMode && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          Drag
        </div>
      )}
    </div>
  );
});

const SortableDividerCard = memo(({ divider, isReorderMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: divider.id, disabled: !isReorderMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: isReorderMode ? 'none' : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`col-span-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900 font-bold ${
        isDragging ? 'opacity-70' : ''
      } ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
    >
      {divider.label}
    </div>
  );
});

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
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [displayOrder, setDisplayOrder] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

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
      const defaultOrder = buildDefaultDisplayOrder(activeOils);
      setDisplayOrder(loadStoredDisplayOrder(defaultOrder));
    } catch (err) {
      setError('Failed to load oils: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryKey = (oil) => {
    const name = `${oil.name_en || ''} ${oil.name_my || ''}`.toLowerCase();
    if (name.includes('peanut') || name.includes('groundnut')) return 'peanut';
    if (name.includes('sesame')) return 'sesame';
    if (name.includes('palm')) return 'palm';
    return 'other';
  };

  const buildDefaultDisplayOrder = (items) => {
    const grouped = {
      peanut: [],
      sesame: [],
      palm: [],
      other: [],
    };

    items.forEach(oil => {
      const key = getCategoryKey(oil);
      grouped[key].push(oil);
    });

    const order = [];
    CATEGORY_ORDER.forEach(key => {
      if (grouped[key].length > 0) {
        order.push(CATEGORY_DIVIDERS[key].id);
        order.push(...grouped[key].map(oil => oil.id));
      }
    });

    if (grouped.other.length > 0) {
      order.push(...grouped.other.map(oil => oil.id));
    }

    return order;
  };

  const loadStoredDisplayOrder = (defaultOrder) => {
    try {
      const stored = JSON.parse(localStorage.getItem(OIL_ORDER_STORAGE_KEY) || '[]');
      if (!Array.isArray(stored) || stored.length === 0) return defaultOrder;
      const allowed = new Set(defaultOrder);
      const cleaned = stored.filter(id => allowed.has(id));
      const missing = defaultOrder.filter(id => !cleaned.includes(id));
      return [...cleaned, ...missing];
    } catch {
      return defaultOrder;
    }
  };

  // Helpers
  const selectedOil = oils.find(o => o.id === selectedOilId);
  const pendingTotal = pendingSelections.reduce((sum, item) => sum + item.price, 0);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.totalQuantityViss, 0);

  // Handlers
  const handleOilSelect = useCallback((oilId) => {
    setSelectedOilId(oilId);
  }, []);

  const handleVissButton = (viss) => {
    // Toggle: if same button clicked, deselect (set to 0)
    setEntryViss(entryViss === viss ? 0 : viss);
  };

  const handleTicalButtonToggle = (ticals) => {
    const key = ticals.toString();
    setSelectedTicalButtons(prev => {
      const exists = prev.includes(key);
      return exists ? prev.filter(value => value !== key) : [...prev, key];
    });
  };

  useEffect(() => {
    const total = selectedTicalButtons.reduce((sum, value) => sum + parseFloat(value), 0);
    setEntryTicals(total);
  }, [selectedTicalButtons]);

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

  const handleOilReorder = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return;
    setDisplayOrder(prev => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem(OIL_ORDER_STORAGE_KEY, JSON.stringify(reordered));
      return reordered;
    });
  }, []);

  const displayItems = useMemo(() => {
    const oilMap = new Map(oils.map(oil => [oil.id, { type: 'oil', oil }]));
    const dividerMap = new Map(
      Object.values(CATEGORY_DIVIDERS).map(divider => [divider.id, { type: 'divider', divider }])
    );

    return displayOrder
      .map(id => oilMap.get(id) || dividerMap.get(id))
      .filter(Boolean);
  }, [displayOrder, oils]);


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
    <div className="min-h-screen bg-gray-50 flex flex-col text-[15px] leading-relaxed">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-amber-100 transition-colors"
              aria-label="Back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-base font-semibold">{t.sell?.newSale || 'New Sale'}</h1>
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} variant="compact" />
        </div>
      </div>

      {/* Main Content - 2 column on tablet+, stacked on mobile */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 landscape:p-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 landscape:gap-3">
          
          {/* LEFT SIDE - INPUT / SELECTION */}
          <div className="flex flex-col gap-4 landscape:gap-3">
            
            {/* 1. Available Oils */}
            <div className="bg-white rounded-lg shadow-md p-1.5 sm:p-2 landscape:p-1 !overflow-visible !max-h-none">
              <div className="flex items-center justify-between gap-2 mb-2 landscape:mb-1">
                <h2 className="text-base font-semibold landscape:text-sm text-gray-800">
                  {t.admin?.oilList || 'Available Oils'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsReorderMode(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    isReorderMode
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {isReorderMode ? 'Done' : 'Arrange'}
                </button>
              </div>
              {isReorderMode && (
                <div className="text-sm text-amber-700 mb-2">
                  Drag a card by the small handle to reorder.
                </div>
              )}
              {oils.length === 0 ? (
                <p className="text-gray-500">{t.admin?.noOils || 'No oils available'}</p>
              ) : (
                <div className="!overflow-visible !max-h-none">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleOilReorder}
                  >
                    <SortableContext items={displayOrder} strategy={rectSortingStrategy}>
                      <div className="grid gap-2 landscape:gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(125px,1fr))] landscape:[grid-template-columns:repeat(auto-fit,minmax(115px,1fr))]">
                        {displayItems.map((item) => {
                          if (item.type === 'divider') {
                            return (
                              <SortableDividerCard
                                key={item.divider.id}
                                divider={item.divider}
                                isReorderMode={isReorderMode}
                              />
                            );
                          }

                          const oil = item.oil;
                          const isSelected = selectedOilId === oil.id;
                          const oilName = language === 'en' ? oil.name_en : oil.name_my;
                          return (
                            <SortableOilCard
                              key={oil.id}
                              oil={oil}
                              oilName={oilName}
                              isSelected={isSelected}
                              language={language}
                              isReorderMode={isReorderMode}
                              onSelect={handleOilSelect}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            {/* 2. Quantity Selection Buttons */}
            <div className="bg-white rounded-lg shadow-md p-3 landscape:p-2">
              <h2 className="text-lg font-semibold mb-2 landscape:mb-2 landscape:text-base text-gray-800">
                {t.sell?.selectQuantity || 'Select Quantity'}
              </h2>
              
              {/* Row 1 - Viss (whole) */}
              <div className="mb-4 landscape:mb-2">
                <div className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">1</span>
                  {getUnitLabel('viss', language)} Only
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                    <button
                      key={v}
                      onClick={() => handleVissButton(v)}
                      className={`h-9 sm:h-9 py-1 flex items-center justify-center text-sm rounded-lg border-2 font-bold transition-all shadow-sm ${
                        entryViss === v
                          ? 'border-amber-600 bg-amber-600 text-white shadow-md transform scale-105'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2 - Ticals (0.1 to 90) */}
              <div className="mb-4 landscape:mb-2">
                <div className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">2</span>
                  Ticals (Fractions)
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2 mb-2">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`h-9 sm:h-9 flex items-center justify-center text-sm rounded-lg border-2 font-bold transition-all shadow-sm ${
                        selectedTicalButtons.includes(t.toString())
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`h-9 sm:h-9 flex items-center justify-center text-sm rounded-lg border-2 font-bold transition-all shadow-sm ${
                        selectedTicalButtons.includes(t.toString())
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2">
                  {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(t => (
                    <button
                      key={t}
                      onClick={() => handleTicalButtonToggle(t)}
                      className={`h-9 sm:h-9 flex items-center justify-center text-sm rounded-lg border-2 font-bold transition-all shadow-sm ${
                        selectedTicalButtons.includes(t.toString())
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-2 z-20 bg-white rounded-xl shadow-md p-2">
                <button
                  onClick={handleAddQuantity}
                  disabled={!selectedOil || (entryViss === 0 && entryTicals === 0)}
                  className={`w-full py-2.5 px-4 font-bold text-base rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    !selectedOil || (entryViss === 0 && entryTicals === 0)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Quantity
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - LIVE CALCULATION / CART */}
          <div className="flex flex-col gap-6 landscape:gap-4">
            {/* Sticky Actions & Total */}
            <div className="sticky top-2 z-30 bg-white rounded-lg shadow-md border border-amber-200 p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs text-gray-500 uppercase">
                    {t.sell?.totalAmount || 'TOTAL'}
                  </div>
                  <div className="text-3xl font-extrabold text-black tracking-wide">
                    {cartTotal > 0 ? `${cartTotal.toLocaleString()} MMK` : '0 MMK'}
                  </div>
                  {cart.length > 0 && (
                    <div className="text-xs text-gray-700 mt-1">
                      {cart.length} {cart.length === 1 ? 'item' : 'items'} • {cartTotalQuantity.toFixed(2)} {getUnitLabel('viss', language)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleClearCart}
                    disabled={cart.length === 0}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-all"
                  >
                    {t.sell?.clearCart || 'Clear Cart'}
                  </button>
                  <button
                    onClick={handleConfirmSaleClick}
                    disabled={cart.length === 0}
                    className="flex-1 sm:flex-none py-2 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-md transition-all"
                  >
                    {t.sell?.confirmSale || 'Confirm Sale'}
                  </button>
                </div>
              </div>
            </div>
            {/* 4. Live Price Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-3 landscape:p-2 border border-amber-100">
              <h2 className="text-lg font-bold mb-2 landscape:mb-2 landscape:text-base text-amber-800 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {t.sell?.currentSelection || 'Currently Measuring'}
              </h2>
              {pendingSelections.length > 0 ? (
                <div className="space-y-2">
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                    {pendingSelections.map((item) => (
                      <div key={item.oilId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{item.oilName}</div>
                            <div className="text-sm text-gray-700">
                            {item.viss > 0 && `${item.viss} ${getUnitLabel('viss', language)}`}
                            {item.viss > 0 && item.ticals > 0 && ' + '}
                            {item.ticals > 0 && `${formatTicals(item.ticals)} Ticals`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="font-bold text-amber-600 text-base">
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
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-gray-800 font-semibold">{t.sell?.price || 'Price'}:</span>
                    <span className="text-lg font-bold text-white bg-amber-600 px-3 py-1 rounded-full shadow">
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
            <div className="bg-white rounded-lg shadow-md p-3 landscape:p-2">
              <h2 className="text-lg font-semibold mb-2 landscape:mb-2 landscape:text-base text-gray-800">
                {t.sell?.cart || 'Cart'}
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {t.sell?.cartEmpty || 'Cart is empty'}
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{item.oilName}</div>
                        <div className="text-sm text-gray-700">
                          {item.viss > 0 && `${item.viss} ${getUnitLabel('viss', language)}`}
                          {item.viss > 0 && item.ticals > 0 && ' + '}
                          {item.ticals > 0 && `${formatTicals(item.ticals)} Ticals`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-900 text-base">
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

          </div>
        </div>
      </div>

      {/* Floating Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={pendingSelections.length === 0}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 rounded-full px-6 py-4 shadow-xl transition-all transform active:scale-95 flex items-center gap-3 text-lg font-bold ${
          pendingSelections.length === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        } ${pendingSelections.length > 0 ? 'animate-pulse' : ''}`}
        aria-label={t.sell?.addToCart || 'Add to Cart'}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {t.sell?.addToCart || 'Add to Cart'}
      </button>

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
