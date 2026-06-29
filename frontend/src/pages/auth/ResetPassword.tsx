import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../features/auth/authService';

const ResetPassword = () => {
  const { token } = useParams(); // Grabs the JWT token from the URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token as string, password);
      setIsSuccess(true);
      toast.success('Password successfully reset!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired token. Please request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full"><ShieldCheck className="text-emerald-600" size={40} /></div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Create New Password</h2>
        
        {isSuccess ? (
          <div className="text-center">
            <p className="text-slate-500 mb-8 font-medium">Your password has been successfully updated. You can now log into your portal.</p>
            <Link to="/login" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
              Proceed to Login <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6 mt-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-3.5 text-slate-400" />
                <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-3.5 text-slate-400" />
                <input required minLength={6} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;