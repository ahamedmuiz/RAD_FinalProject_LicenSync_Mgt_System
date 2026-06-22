import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, ArrowLeft, Loader2, CheckCircle2, Copy, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast'; // <-- Using professional alerts
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

  // State to hold the credentials after success
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
      // .unwrap() returns the EXACT response from the backend (including the temp password!)
      const result = await dispatch(createClient(formData)).unwrap();
      
      toast.success('Client created successfully!');
      
      // Instead of navigating away, we display the credentials UI
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
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/manager-dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl text-white">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Onboard New Client</h1>
              <p className="text-indigo-100 mt-1">Create a company profile and generate their portal access.</p>
            </div>
          </div>

          {/* IF SUCCESS: Show the credentials card */}
          {createdCredentials ? (
            <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Account Created!</h2>
              <p className="text-slate-500 mb-8">Please share these secure login credentials with the client.</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-md mx-auto text-left space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Login Email</p>
                  <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg">
                    <span className="font-medium text-slate-800">{createdCredentials.email}</span>
                    <button onClick={() => copyToClipboard(createdCredentials.email)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition-colors"><Copy size={18}/></button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Temporary Password</p>
                  <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg">
                    <span className="font-mono text-lg text-slate-800">{createdCredentials.password}</span>
                    <button onClick={() => copyToClipboard(createdCredentials.password)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition-colors"><Copy size={18}/></button>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/manager-dashboard')}
                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            // IF NO SUCCESS YET: Show the form
            <form onSubmit={onSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Company Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                  <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
                  <input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                {/* Contact Information */}
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Primary Contact & Billing</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name *</label>
                  <input required type="text" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Billing Email *</label>
                  <input required type="email" name="billingEmail" value={formData.billingEmail} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white">
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/manager-dashboard')}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={18} /> Create Client</>}
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