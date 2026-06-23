import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, ArrowLeft, Loader2, CheckCircle2, Copy, UserCheck, Mail, Phone, MapPin, Hash, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '../../features/clients/clientSlice';
import type { AppDispatch, RootState } from '../../store/store';

const AddClient = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    billingAddress: '',
    phone: '',
    billingEmail: '',
    primaryContactName: '',
    paymentTerms: 'Net 30',
  });

  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.clients);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(createClient(formData)).unwrap();
      toast.success('Client created successfully!');
      setCreatedCredentials({
        email: formData.billingEmail,
        password: result.temporaryPassword
      });
    } catch (error: any) {
      toast.error(error || 'Failed to create client');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/manager-dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-bold"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
          
          {/* Vibrant Gradient Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-8 flex items-center gap-5">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner">
              <Building2 size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Onboard New Client</h1>
              <p className="text-indigo-100 mt-1 font-medium">Create a company profile and generate their secure portal access.</p>
            </div>
          </div>

          {/* SUCCESS STATE: Stunning Credentials Card */}
          {createdCredentials ? (
            <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                <UserCheck size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Account Created!</h2>
              <p className="text-slate-500 mb-8 font-medium text-lg">Please share these secure login credentials with the client.</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md mx-auto text-left space-y-5 shadow-inner">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Login Email</p>
                  <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-800">{createdCredentials.email}</span>
                    <button onClick={() => copyToClipboard(createdCredentials.email)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"><Copy size={18}/></button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporary Password</p>
                  <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <span className="font-mono text-xl font-bold text-slate-900 tracking-widest">{createdCredentials.password}</span>
                    <button onClick={() => copyToClipboard(createdCredentials.password)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"><Copy size={18}/></button>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/manager-dashboard')}
                className="mt-10 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            
            // FORM STATE
            <form onSubmit={onSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Company Information Section */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-extrabold text-slate-800 border-b-2 border-slate-100 pb-2 mb-2 flex items-center gap-2">
                    <Building2 size={20} className="text-indigo-500"/> Company Details
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Company Name *</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-3.5 text-indigo-400" />
                    <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-slate-800" placeholder="Acme Corp" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Registration Number</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-4 top-3.5 text-indigo-400" />
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-slate-800" placeholder="REG-12345" />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Billing Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-3.5 text-indigo-400" />
                    <input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-slate-800" placeholder="123 Business Rd, City, Country" />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="text-lg font-extrabold text-slate-800 border-b-2 border-slate-100 pb-2 mb-2 flex items-center gap-2">
                    <User size={20} className="text-violet-500"/> Primary Contact & Billing
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Contact Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-violet-400" />
                    <input required type="text" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none font-medium text-slate-800" placeholder="Jane Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Billing Email *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-violet-400" />
                    <input required type="email" name="billingEmail" value={formData.billingEmail} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none font-medium text-slate-800" placeholder="billing@acmecorp.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-3.5 text-violet-400" />
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none font-medium text-slate-800" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Payment Terms</label>
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none font-bold text-slate-700 appearance-none">
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/manager-dashboard')}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
                >
                  {isLoading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={20} /> Create Client Account</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddClient;