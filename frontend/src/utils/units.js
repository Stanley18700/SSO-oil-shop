/**
 * Unit translations and utilities for Myanmar oil measurements
 */

// Unit display names in English and Myanmar
export const UNIT_LABELS = {
  viss: {
    en: 'Viss',
    my: 'ပိဿာ',
    symbol: 'ပိဿာ'
  },
  liter: {
    en: 'Liter',
    my: 'လီတာ',
    symbol: 'L'
  },
  kg: {
    en: 'Kilogram',
    my: 'ကီလိုဂရမ်',
    symbol: 'kg'
  },
  gallon: {
    en: 'Gallon',
    my: 'ဂါလံ',
    symbol: 'gal'
  }
};

// Available units for admin selection
export const AVAILABLE_UNITS = [
  { value: 'viss', label_en: 'Viss (ပိဿာ)', label_my: 'ပိဿာ' },
  { value: 'liter', label_en: 'Liter (လီတာ)', label_my: 'လီတာ' },
  { value: 'kg', label_en: 'Kilogram (ကီလိုဂရမ်)', label_my: 'ကီလိုဂရမ်' },
  { value: 'gallon', label_en: 'Gallon (ဂါလံ)', label_my: 'ဂါလံ' }
];

/**
 * Get the unit display string for a given unit and language
 * @param {string} unit - The unit code (viss, liter, kg, etc.)
 * @param {string} language - The language code (en or my)
 * @returns {string} The localized unit name
 */
export const getUnitLabel = (unit, language = 'en') => {
  const unitData = UNIT_LABELS[unit] || UNIT_LABELS.viss;
  return language === 'my' ? unitData.my : unitData.en;
};

/**
 * Get the unit symbol
 * @param {string} unit - The unit code
 * @returns {string} The unit symbol
 */
export const getUnitSymbol = (unit) => {
  const unitData = UNIT_LABELS[unit] || UNIT_LABELS.viss;
  return unitData.symbol;
};

/**
 * Format price with unit
 * @param {number} price - The price value
 * @param {string} unit - The unit code
 * @param {string} language - The language code
 * @returns {string} Formatted price with unit
 */
export const formatPriceWithUnit = (price, unit, language = 'en') => {
  const formattedPrice = parseFloat(price).toLocaleString();
  const unitLabel = getUnitLabel(unit, language);
  return `${formattedPrice} MMK / ${unitLabel}`;
};

