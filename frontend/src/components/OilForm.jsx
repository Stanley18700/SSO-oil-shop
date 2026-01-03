import { useState, useEffect } from 'react';
import { getUnitOptions } from '../utils/units';

/**
 * OilForm component
 * Form for creating and editing oils (Admin use)
 */
export const OilForm = ({ oil, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_my: '',
    description_en: '',
    description_my: '',
    price_per_unit: '',
    unit: 'viss',
    image_url: '',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  // Populate form with oil data if editing
  useEffect(() => {
    if (oil) {
      setFormData({
        name_en: oil.name_en || '',
        name_my: oil.name_my || '',
        description_en: oil.description_en || '',
        description_my: oil.description_my || '',
        price_per_unit: oil.price_per_unit || '',
        unit: oil.unit || 'viss',
        image_url: oil.image_url || '',
        is_active: oil.is_active !== undefined ? oil.is_active : true,
      });
    }
  }, [oil]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name_en.trim()) newErrors.name_en = 'English name is required';
    if (!formData.name_my.trim()) newErrors.name_my = 'Myanmar name is required';
    if (!formData.description_en.trim()) newErrors.description_en = 'English description is required';
    if (!formData.description_my.trim()) newErrors.description_my = 'Myanmar description is required';
    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      newErrors.price_per_unit = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Convert price to number
    const submitData = {
      ...formData,
      price_per_unit: parseFloat(formData.price_per_unit),
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* English Name */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Name (English) *
        </label>
        <input
          type="text"
          name="name_en"
          value={formData.name_en}
          onChange={handleChange}
          className={`input-field text-base sm:text-tablet py-3 ${errors.name_en ? 'border-red-500' : ''}`}
          placeholder="e.g., Palm Oil"
          style={{ minHeight: '50px' }}
        />
        {errors.name_en && (
          <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
        )}
      </div>

      {/* Myanmar Name */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Name (Myanmar) *
        </label>
        <input
          type="text"
          name="name_my"
          value={formData.name_my}
          onChange={handleChange}
          className={`input-field text-base sm:text-tablet py-3 ${errors.name_my ? 'border-red-500' : ''}`}
          placeholder="e.g., ထန်းဆီ"
          style={{ minHeight: '50px' }}
        />
        {errors.name_my && (
          <p className="text-red-500 text-sm mt-1">{errors.name_my}</p>
        )}
      </div>

      {/* English Description */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Description (English) *
        </label>
        <textarea
          name="description_en"
          value={formData.description_en}
          onChange={handleChange}
          rows="3"
          className={`input-field text-base py-3 ${errors.description_en ? 'border-red-500' : ''}`}
          placeholder="Describe the oil in English"
        />
        {errors.description_en && (
          <p className="text-red-500 text-sm mt-1">{errors.description_en}</p>
        )}
      </div>

      {/* Myanmar Description */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Description (Myanmar) *
        </label>
        <textarea
          name="description_my"
          value={formData.description_my}
          onChange={handleChange}
          rows="3"
          className={`input-field text-base py-3 ${errors.description_my ? 'border-red-500' : ''}`}
          placeholder="ဆီအကြောင်း မြန်မာဘာသာဖြင့် ဖော်ပြပါ"
        />
        {errors.description_my && (
          <p className="text-red-500 text-sm mt-1">{errors.description_my}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Price per Unit (MMK) *
        </label>
        <input
          type="number"
          name="price_per_unit"
          value={formData.price_per_unit}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`input-field text-lg sm:text-xl py-3 font-bold ${errors.price_per_unit ? 'border-red-500' : ''}`}
          placeholder="e.g., 3500"
          style={{ minHeight: '50px' }}
        />
        {errors.price_per_unit && (
          <p className="text-red-500 text-sm mt-1">{errors.price_per_unit}</p>
        )}
      </div>

      {/* Unit of Measurement */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Measurement Unit *
        </label>
        <select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          className="input-field text-base sm:text-lg py-3 font-semibold"
          style={{ minHeight: '50px' }}
        >
          {getUnitOptions('en').map(option => {
            const myOption = getUnitOptions('my').find(u => u.value === option.value);
            return (
              <option key={option.value} value={option.value}>
                {option.label} ({myOption?.label || option.label})
              </option>
            );
          })}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          💡 <strong>Viss (ပဲ)</strong> is the traditional Myanmar weight unit (~1.633 kg). Most oil shops in Myanmar use Viss.
        </p>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-base sm:text-tablet font-semibold text-gray-700 mb-2">
          Image URL (optional)
        </label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="input-field text-base py-3"
          placeholder="https://example.com/image.jpg"
          style={{ minHeight: '50px' }}
        />
        {/* Image Preview */}
        {formData.image_url && (
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center border-2 border-gray-300">
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.innerHTML = '<p class="text-red-500 text-sm">❌ Invalid image URL</p>';
              }}
            />
          </div>
        )}
      </div>

      {/* Active Status - Better mobile toggle */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <label htmlFor="is_active" className="text-base sm:text-tablet font-semibold text-gray-700 cursor-pointer">
            Active Status
          </label>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
              {formData.is_active ? 'Visible to customers' : 'Hidden'}
            </span>
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action buttons - LARGER for mobile */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 text-base sm:text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          style={{ minHeight: '56px' }}
        >
          {isLoading ? '💾 Saving...' : oil ? '✓ Update Oil' : '+ Create Oil'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary flex-1 text-base sm:text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          style={{ minHeight: '56px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

