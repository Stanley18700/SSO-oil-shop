import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils, createOil, updateOil, deleteOil } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { OilForm } from '../components/OilForm';
import { getUnitLabel } from '../utils/units';
import enTranslations from '../i18n/en.json';

/**
 * Admin Dashboard - Oil CRUD operations
 */
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const t = enTranslations;

  const [oils, setOils] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOil, setEditingOil] = useState(null);

  // Fetch oils on mount
  useEffect(() => {
    fetchOils();
  }, []);

  // Fetch all oils
  const fetchOils = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOils();
      setOils(data);
    } catch (err) {
      setError('Failed to fetch oils: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message temporarily
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle create oil
  const handleCreate = () => {
    setEditingOil(null);
    setShowModal(true);
  };

  // Handle edit oil
  const handleEdit = (oil) => {
    setEditingOil(oil);
    setShowModal(true);
  };

  // Handle delete oil (soft delete)
  const handleDelete = async (oil) => {
    if (!window.confirm(t.messages.deleteConfirm)) {
      return;
    }

    try {
      await deleteOil(oil.id);
      showSuccess(t.messages.oilDeleted);
      fetchOils(); // Refresh list
    } catch (err) {
      setError('Failed to delete oil: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (editingOil) {
        // Update existing oil
        await updateOil(editingOil.id, formData);
        showSuccess(t.messages.oilUpdated);
      } else {
        // Create new oil
        await createOil(formData);
        showSuccess(t.messages.oilCreated);
      }
      
      setShowModal(false);
      fetchOils(); // Refresh list
    } catch (err) {
      setError('Failed to save oil: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {t.admin.dashboard}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden sm:inline">{t.admin.customerView}</span>
                <span className="sm:hidden">👥 View</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4"
                style={{ minHeight: '44px' }}
              >
                {t.common.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Add oil button - LARGER for mobile */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            className="btn-primary w-full sm:w-auto text-xl py-4 px-8 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
            style={{ minHeight: '60px' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t.admin.addOil}
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
          </div>
        ) : oils.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">
              {t.admin.noOils}
            </h3>
          </div>
        ) : (
          /* Mobile-friendly card layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oils.map((oil) => (
              <div
                key={oil.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-200"
              >
                {/* Oil Image */}
                {oil.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
                    <img
                      src={oil.image_url}
                      alt={oil.name_en}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Oil Names */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {oil.name_en}
                  </h3>
                  <p className="text-base text-gray-600">
                    {oil.name_my}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4 bg-primary-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {parseFloat(oil.price_per_unit).toLocaleString()} <span className="text-base">MMK</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    per {getUnitLabel(oil.unit || 'viss', 'en')}
                  </p>
                </div>

                {/* Status Toggle - Quick switch */}
                <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <button
                    onClick={async () => {
                      try {
                        await updateOil(oil.id, { ...oil, is_active: !oil.is_active });
                        showSuccess('Status updated!');
                        fetchOils();
                      } catch (err) {
                        setError('Failed to update status: ' + err.message);
                      }
                    }}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      oil.is_active
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                    style={{ minWidth: '80px', minHeight: '40px' }}
                  >
                    {oil.is_active ? '✓ Active' : '✗ Inactive'}
                  </button>
                </div>

                {/* Action Buttons - LARGER for mobile */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(oil)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ minHeight: '50px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t.common.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(oil)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ minHeight: '50px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t.common.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingOil ? t.admin.editOil : t.admin.addOil}
              </h2>
              <OilForm
                oil={editingOil}
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

