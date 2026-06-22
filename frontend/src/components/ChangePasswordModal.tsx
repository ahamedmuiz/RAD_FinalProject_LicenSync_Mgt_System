import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { changePassword } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../store/store';

const ChangePasswordModal = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isError, message } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setFormError('New passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 6) {
      setFormError('New password must be at least 6 characters.');
      return;
    }

    // Try to change it!
    try {
      await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="bg-emerald-600 p-6 text-center">
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Action Required</h2>
          <p className="text-emerald-100 text-sm mt-1">Please update your temporary password to secure your account.</p>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          {(isError || formError) && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2 border border-red-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{formError || message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input required type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input required type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Securing Account...</> : 'Save & Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;