import { useEffect, useMemo, useState } from 'react';
import { changePassword } from '../api/api';

export const ChangePasswordModal = ({ isOpen, onClose, language, t }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const labels = useMemo(() => {
    const isEn = language === 'en';
    return {
      title: t?.auth?.changePasswordTitle || (isEn ? 'Change Password' : 'စကားဝှက် ပြောင်းမည်'),
      current: t?.auth?.currentPassword || (isEn ? 'Current Password' : 'လက်ရှိ စကားဝှက်'),
      next: t?.auth?.newPassword || (isEn ? 'New Password' : 'စကားဝှက် အသစ်'),
      confirm: t?.auth?.confirmPassword || (isEn ? 'Confirm New Password' : 'စကားဝှက် အသစ် ထပ်မံရေးပါ'),
      save: t?.auth?.changePasswordButton || t?.common?.save || (isEn ? 'Save' : 'သိမ်းမည်'),
      cancel: t?.common?.cancel || (isEn ? 'Cancel' : 'မလုပ်တော့'),
      required: t?.auth?.requiredFields || (isEn ? 'Please fill in all fields' : 'လိုအပ်သော အကွက်များကို ဖြည့်ပါ'),
      mismatch: t?.auth?.passwordMismatch || (isEn ? 'New passwords do not match' : 'စကားဝှက် အသစ် မတူပါ'),
      tooShort: t?.auth?.passwordTooShort || (isEn ? 'New password must be at least 8 characters' : 'စကားဝှက် အသစ်သည် အနည်းဆုံး အက္ခရာ ၈ လုံး ဖြစ်ရမည်'),
      sameAsCurrent: t?.auth?.newPasswordDifferent || (isEn ? 'New password must be different from current password' : 'စကားဝှက် အသစ်သည် လက်ရှိ စကားဝှက်နှင့် မတူရပါ'),
      success: t?.auth?.passwordChangedSuccess || (isEn ? 'Password updated successfully.' : 'စကားဝှက် ပြောင်းပြီးပါပြီ။'),
    };
  }, [language, t]);

  useEffect(() => {
    if (!isOpen) return;

    // Reset on open
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsSaving(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(labels.required);
      return;
    }

    if (newPassword.length < 8) {
      setError(labels.tooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(labels.mismatch);
      return;
    }

    if (newPassword === currentPassword) {
      setError(labels.sameAsCurrent);
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setSuccess(labels.success);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto-close after a short delay so the user can see success.
      setTimeout(() => {
        onClose?.();
      }, 650);
    } catch (err) {
      setError(err?.message || (t?.auth?.passwordChangedError || 'Failed to change password'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-black text-gray-900">{labels.title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label={t?.common?.close || 'Close'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error ? (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-tablet">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-tablet">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-tablet font-semibold text-gray-700 mb-2">{labels.current}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                className="input-field"
                autoComplete="current-password"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-tablet font-semibold text-gray-700 mb-2">{labels.next}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                className="input-field"
                autoComplete="new-password"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-tablet font-semibold text-gray-700 mb-2">{labels.confirm}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                className="input-field"
                autoComplete="new-password"
                disabled={isSaving}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {labels.cancel}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {t?.common?.loading || 'Loading...'}
                  </span>
                ) : (
                  labels.save
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
