import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOils, createOil, updateOil, deleteOil } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { OilForm } from '../components/OilForm';
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
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t.admin.dashboard}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary text-sm md:text-tablet"
              >
                {t.admin.customerView}
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary text-sm md:text-tablet"
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

        {/* Add oil button */}
        <div className="mb-6">
          <button onClick={handleCreate} className="btn-primary">
            + {t.admin.addOil}
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
          /* Oils table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (MMK)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {oils.map((oil) => (
                    <tr key={oil.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {oil.name_en}
                          </div>
                          <div className="text-sm text-gray-500">
                            {oil.name_my}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {parseFloat(oil.price_per_unit).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            oil.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {oil.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(oil)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(oil)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t.common.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

