import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, reset } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Invalid email or password');
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success('Login Successful!');
      if (user.role === 'PROJECT_MANAGER') {
        navigate('/manager-dashboard');
      } else {
        navigate('/client-dashboard');
      }
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Left Side - Vibrant Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Blurred Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">LicenSync</span>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6">Manage software licenses with precision.</h1>
          <p className="text-indigo-200 text-xl font-medium max-w-md leading-relaxed">
            Enterprise-grade portal access for automated billing, quote generation, and real-time seat consumption.
          </p>
        </div>
        
        <div className="relative z-10 text-indigo-400 font-medium text-sm">
          © {new Date().getFullYear()} Elite Software Solutions
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 p-3 rounded-2xl shadow-md">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">LicenSync</span>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 mb-8 font-medium">Please enter your credentials to access your account.</p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="admin@elite.com" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    required 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Authenticating...</> : 'Sign In to Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;