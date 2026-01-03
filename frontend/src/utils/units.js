/**
 * Myanmar traditional measurement units for oil
 * Utilities for handling different weight/volume units
 */

// Unit definitions with translations
export const UNITS = {
  viss: {
    en: 'Viss',
    my: 'ပဲ',
    description_en: 'Traditional Myanmar unit (≈ 1.633 kg)',
    description_my: 'မြန်မာ့ရိုးရာ အလေးချိန်စနစ်'
  },
  liter: {
    en: 'Liter',
    my: 'လီတာ',
    description_en: 'Volume measurement',
    description_my: 'ထုထည် တိုင်းတာမှု'
  },
  kg: {
    en: 'Kilogram',
    my: 'ကီလိုဂရမ်',
    description_en: 'Metric weight unit',
    description_my: 'မက်ထရစ် အလေးချိန်'
  },
  kyat_thar: {
    en: 'Kyat Thar',
    my: 'ကျပ်သား',
    description_en: '1/100 of a Viss',
    description_my: 'ပဲတစ်ခု၏ တစ်ပုံတစ်ရာ'
  }
};

/**
 * Get unit label based on language
 * @param {string} unit - Unit key (viss, liter, kg, kyat_thar)
 * @param {string} language - Language code (en, my)
 * @returns {string} Localized unit label
 */
export const getUnitLabel = (unit, language = 'en') => {
  if (!unit || !UNITS[unit]) {
    return language === 'en' ? 'Unit' : 'ယူနစ်';
  }
  return UNITS[unit][language];
};

/**
 * Get unit description based on language
 * @param {string} unit - Unit key
 * @param {string} language - Language code
 * @returns {string} Localized unit description
 */
export const getUnitDescription = (unit, language = 'en') => {
  if (!unit || !UNITS[unit]) {
    return '';
  }
  return UNITS[unit][`description_${language}`];
};

/**
 * Get all available units as options for select dropdown
 * @param {string} language - Language code
 * @returns {Array} Array of {value, label} objects
 */
export const getUnitOptions = (language = 'en') => {
  return Object.keys(UNITS).map(key => ({
    value: key,
    label: UNITS[key][language]
  }));
};

/**
 * Format quantity with unit
 * @param {number} quantity - Amount
 * @param {string} unit - Unit key
 * @param {string} language - Language code
 * @returns {string} Formatted string (e.g., "5 Viss", "3 ပဲ")
 */
export const formatQuantityWithUnit = (quantity, unit, language = 'en') => {
  const unitLabel = getUnitLabel(unit, language);
  return `${quantity} ${unitLabel}`;
};

// Export for backwards compatibility
export const AVAILABLE_UNITS = UNITS;
