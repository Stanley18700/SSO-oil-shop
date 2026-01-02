import { useState, useEffect } from 'react';

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
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Name (English) *
        </label>
        <input
          type="text"
          name="name_en"
          value={formData.name_en}
          onChange={handleChange}
          className={`input-field ${errors.name_en ? 'border-red-500' : ''}`}
          placeholder="e.g., Palm Oil"
        />
        {errors.name_en && (
          <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
        )}
      </div>

      {/* Myanmar Name */}
      <div>
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Name (Myanmar) *
        </label>
        <input
          type="text"
          name="name_my"
          value={formData.name_my}
          onChange={handleChange}
          className={`input-field ${errors.name_my ? 'border-red-500' : ''}`}
          placeholder="e.g., ထန်းဆီ"
        />
        {errors.name_my && (
          <p className="text-red-500 text-sm mt-1">{errors.name_my}</p>
        )}
      </div>

      {/* English Description */}
      <div>
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Description (English) *
        </label>
        <textarea
          name="description_en"
          value={formData.description_en}
          onChange={handleChange}
          rows="3"
          className={`input-field ${errors.description_en ? 'border-red-500' : ''}`}
          placeholder="Describe the oil in English"
        />
        {errors.description_en && (
          <p className="text-red-500 text-sm mt-1">{errors.description_en}</p>
        )}
      </div>

      {/* Myanmar Description */}
      <div>
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Description (Myanmar) *
        </label>
        <textarea
          name="description_my"
          value={formData.description_my}
          onChange={handleChange}
          rows="3"
          className={`input-field ${errors.description_my ? 'border-red-500' : ''}`}
          placeholder="ဆီအကြောင်း မြန်မာဘာသာဖြင့် ဖော်ပြပါ"
        />
        {errors.description_my && (
          <p className="text-red-500 text-sm mt-1">{errors.description_my}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Price per Unit (MMK) *
        </label>
        <input
          type="number"
          name="price_per_unit"
          value={formData.price_per_unit}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`input-field ${errors.price_per_unit ? 'border-red-500' : ''}`}
          placeholder="e.g., 3500"
        />
        {errors.price_per_unit && (
          <p className="text-red-500 text-sm mt-1">{errors.price_per_unit}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-tablet font-semibold text-gray-700 mb-2">
          Image URL (optional)
        </label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="input-field"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-5 h-5 cursor-pointer"
        />
        <label htmlFor="is_active" className="text-tablet font-semibold text-gray-700 cursor-pointer">
          Active (visible to customers)
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : oil ? 'Update Oil' : 'Create Oil'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

