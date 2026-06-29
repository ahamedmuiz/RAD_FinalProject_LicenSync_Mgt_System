import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../features/auth/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full"><ShieldCheck className="text-indigo-600" size={40} /></div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Reset Password</h2>
        
        {isSent ? (
          <div className="text-center">
            <p className="text-emerald-600 bg-emerald-50 p-4 rounded-xl font-medium mb-6">
              Check your email! We've sent a secure reset link to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-center mb-8 font-medium">Enter your account email address and we will send you a secure link to reset your password.</p>
            
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70">
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;